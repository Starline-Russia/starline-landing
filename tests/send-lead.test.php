<?php
declare(strict_types=1);

define('STARLINE_LEAD_TESTING', true);
require dirname(__DIR__) . '/send-lead.php';

$failures = 0;
$tests = 0;

function check(bool $condition, string $message): void
{
    global $failures;
    if (!$condition) {
        $failures += 1;
        fwrite(STDERR, "FAIL: {$message}\n");
    }
}

function same(mixed $actual, mixed $expected, string $message): void
{
    check($actual === $expected, $message . ' (got ' . var_export($actual, true) . ')');
}

function contains_text(string $haystack, string $needle, string $message): void
{
    check(str_contains($haystack, $needle), $message);
}

function run_case(string $name, callable $case): void
{
    global $tests;
    $tests += 1;
    $case();
    fwrite(STDOUT, "ok {$tests} - {$name}\n");
}

function base_post(array $overrides = []): array
{
    return array_merge([
        'name' => 'Антон',
        'contact' => 'anton@example.ru',
        'source' => 'ai-contour',
        'website' => '',
        'personal_data_consent' => '2026-08-28',
    ], $overrides);
}

function request(array $server, array $post, bool $mailResult = true): array
{
    $calls = [];
    $mailer = function (string $to, string $subject, string $message, string $headers) use (&$calls, $mailResult): bool {
        $calls[] = compact('to', 'subject', 'message', 'headers');
        return $mailResult;
    };
    $result = starline_process_request(
        array_merge([
            'REQUEST_METHOD' => 'POST',
            'HTTP_ACCEPT' => 'application/json',
            'REMOTE_ADDR' => '203.0.113.8',
            'HTTP_USER_AGENT' => 'Must not be stored',
        ], $server),
        $post,
        $mailer,
        new DateTimeImmutable('2026-08-18T12:34:56+03:00'),
    );
    $result['mail_calls'] = $calls;
    return $result;
}

run_case('only POST is accepted', function (): void {
    $result = request(['REQUEST_METHOD' => 'GET'], []);
    same($result['status'], 405, 'GET must return 405');
    same($result['payload']['ok'], false, 'GET response must fail');
    same(count($result['mail_calls']), 0, 'GET must not send mail');
});

run_case('required fields and source allowlist are enforced', function (): void {
    foreach ([
        base_post(['name' => '']),
        base_post(['contact' => '']),
        base_post(['source' => 'other']),
        base_post(['personal_data_consent' => 'yes']),
        base_post(['name' => str_repeat('a', 161)]),
        base_post(['contact' => str_repeat('a', 321)]),
    ] as $post) {
        $result = request([], $post);
        same($result['status'], 422, 'invalid input must return 422');
        same($result['payload']['ok'], false, 'invalid input must fail');
        same(count($result['mail_calls']), 0, 'invalid input must not send mail');
    }
});

run_case('honeypot is accepted silently without sending mail', function (): void {
    $result = request([], base_post(['website' => 'https://spam.example']));
    same($result['status'], 200, 'honeypot response should not reveal detection');
    same($result['payload']['ok'], true, 'honeypot should receive generic success');
    same(count($result['mail_calls']), 0, 'honeypot must suppress mail');
});

run_case('control characters and header injection are rejected', function (): void {
    foreach ([
        base_post(['name' => "Антон\r\nBcc: victim@example.com"]),
        base_post(['contact' => "lead@example.ru\nReply-To: attacker@example.com"]),
        base_post(['name' => "Ан\0тон"]),
    ] as $post) {
        $result = request([], $post);
        same($result['status'], 422, 'control characters must return 422');
        same(count($result['mail_calls']), 0, 'control characters must prevent mail');
    }
});

run_case('successful email lead includes only the approved evidence', function (): void {
    $result = request([], base_post());
    same($result['status'], 200, 'valid lead must return 200');
    same($result['payload'], [
        'ok' => true,
        'message' => 'Спасибо! Заявка отправлена. Мы свяжемся с вами.',
    ], 'success payload must match the public contract');
    same(count($result['mail_calls']), 1, 'valid lead must send one mail');
    $mail = $result['mail_calls'][0];
    same($mail['to'], 'hi@starlinerussia.ru', 'mail recipient must be Starline');
    contains_text($mail['headers'], 'From: no-reply@starlineagency.ru', 'mail must use the current site domain as sender');
    contains_text($mail['headers'], 'Reply-To: anton@example.ru', 'valid email may become Reply-To');
    foreach ([
        'Имя: Антон',
        'Контакт: anton@example.ru',
        'Источник: ai-contour',
        'Версия согласия: 2026-08-28',
        'Серверное время: 2026-08-18T12:34:56+03:00',
    ] as $needle) {
        contains_text($mail['message'], $needle, "mail body must contain {$needle}");
    }
    check(!str_contains($mail['message'], '203.0.113.8'), 'mail must not contain IP');
    check(!str_contains($mail['message'], 'Must not be stored'), 'mail must not contain User-Agent');
});

run_case('phone contact never becomes Reply-To', function (): void {
    $result = request([], base_post(['contact' => '+7 999 123-45-67']));
    same($result['status'], 200, 'phone lead must be accepted');
    check(!str_contains($result['mail_calls'][0]['headers'], 'Reply-To:'), 'phone must not be used as Reply-To');
});

run_case('mail failure returns an error instead of a false success', function (): void {
    $result = request([], base_post(), false);
    same($result['status'], 500, 'mail failure must return 500');
    same($result['payload']['ok'], false, 'mail failure must return ok=false');
    check($result['payload']['message'] !== 'Спасибо! Заявка отправлена. Мы свяжемся с вами.', 'mail failure must not show success');
});

run_case('fetch receives JSON while native submit receives minimal HTML', function (): void {
    $json = request(['HTTP_ACCEPT' => 'application/json'], base_post());
    contains_text($json['content_type'], 'application/json', 'fetch response must be JSON');
    same(json_decode($json['body'], true), $json['payload'], 'JSON body must encode the public payload');

    $html = request(['HTTP_ACCEPT' => 'text/html'], base_post());
    contains_text($html['content_type'], 'text/html', 'native response must be HTML');
    contains_text($html['body'], '<!doctype html>', 'native response must be a complete minimal page');
    contains_text($html['body'], 'Спасибо! Заявка отправлена. Мы свяжемся с вами.', 'native response must show success');
});

if ($failures > 0) {
    fwrite(STDERR, "{$failures} assertion(s) failed across {$tests} cases.\n");
    exit(1);
}

fwrite(STDOUT, "1..{$tests}\n");
