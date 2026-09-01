<?php
declare(strict_types=1);

const STARLINE_LEAD_SUCCESS = 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
const STARLINE_LEAD_ERROR = 'Не удалось отправить заявку. Попробуйте ещё раз или напишите на hi@starlinerussia.ru.';
const STARLINE_LEAD_CONSENT_VERSION = '2026-08-28';

function starline_string_field(array $post, string $key): ?string
{
    $value = $post[$key] ?? null;
    return is_string($value) ? trim($value) : null;
}

function starline_text_length(string $value): int
{
    if (function_exists('mb_strlen')) {
        return mb_strlen($value, 'UTF-8');
    }

    $matched = preg_match_all('/./us', $value, $characters);
    return $matched === false ? strlen($value) : $matched;
}

function starline_has_control_characters(string $value): bool
{
    return preg_match('/[\x00-\x1F\x7F]/u', $value) === 1;
}

function starline_response(int $status, array $payload, bool $json): array
{
    if ($json) {
        return [
            'status' => $status,
            'content_type' => 'application/json; charset=utf-8',
            'payload' => $payload,
            'body' => (string) json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];
    }

    $message = htmlspecialchars((string) ($payload['message'] ?? ''), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $title = $payload['ok'] ? 'Заявка отправлена' : 'Заявка не отправлена';
    $body = '<!doctype html><html lang="ru"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<title>' . $title . ' — Starline</title></head><body>'
        . '<main><h1>' . $title . '</h1><p>' . $message . '</p><p><a href="./">Вернуться на сайт</a></p></main>'
        . '</body></html>';

    return [
        'status' => $status,
        'content_type' => 'text/html; charset=utf-8',
        'payload' => $payload,
        'body' => $body,
    ];
}

function starline_process_request(
    array $server,
    array $post,
    callable $mailer,
    DateTimeImmutable $now,
): array {
    $accept = strtolower((string) ($server['HTTP_ACCEPT'] ?? ''));
    $requestedWith = strtolower((string) ($server['HTTP_X_REQUESTED_WITH'] ?? ''));
    $json = str_contains($accept, 'application/json') || $requestedWith === 'xmlhttprequest';

    if (strtoupper((string) ($server['REQUEST_METHOD'] ?? '')) !== 'POST') {
        return starline_response(405, [
            'ok' => false,
            'message' => 'Для отправки заявки используйте форму на сайте.',
        ], $json);
    }

    $name = starline_string_field($post, 'name');
    $contact = starline_string_field($post, 'contact');
    $source = starline_string_field($post, 'source');
    $website = starline_string_field($post, 'website');
    $consent = starline_string_field($post, 'personal_data_consent');

    if ($website === null) {
        return starline_response(422, ['ok' => false, 'message' => 'Проверьте поля формы и отправьте заявку ещё раз.'], $json);
    }

    if ($website !== '') {
        return starline_response(200, ['ok' => true, 'message' => STARLINE_LEAD_SUCCESS], $json);
    }

    $invalid = $name === null
        || $contact === null
        || $source === null
        || $consent === null
        || !in_array($source, ['main', 'ai-contour'], true)
        || $consent !== STARLINE_LEAD_CONSENT_VERSION
        || starline_text_length($name) < 1
        || starline_text_length($name) > 160
        || starline_text_length($contact) < 3
        || starline_text_length($contact) > 320
        || starline_has_control_characters($name)
        || starline_has_control_characters($contact)
        || starline_has_control_characters($source)
        || starline_has_control_characters($consent);

    if ($invalid) {
        return starline_response(422, [
            'ok' => false,
            'message' => 'Проверьте имя, контакт и согласие на обработку данных.',
        ], $json);
    }

    $subject = '[Starline] Lead: ' . $source;
    $message = implode("\n", [
        'Новая заявка с сайта Starline',
        '',
        'Имя: ' . $name,
        'Контакт: ' . $contact,
        'Источник: ' . $source,
        'Версия согласия: ' . $consent,
        'Серверное время: ' . $now->format(DATE_ATOM),
    ]);
    $headers = [
        'From: no-reply@starlineagency.ru',
        'Content-Type: text/plain; charset=UTF-8',
        'MIME-Version: 1.0',
    ];

    if (filter_var($contact, FILTER_VALIDATE_EMAIL) !== false) {
        $headers[] = 'Reply-To: ' . $contact;
    }

    $sent = $mailer(
        'hi@starlinerussia.ru',
        $subject,
        $message,
        implode("\r\n", $headers),
    );

    if (!$sent) {
        return starline_response(500, ['ok' => false, 'message' => STARLINE_LEAD_ERROR], $json);
    }

    return starline_response(200, ['ok' => true, 'message' => STARLINE_LEAD_SUCCESS], $json);
}

if (!defined('STARLINE_LEAD_TESTING')) {
    $result = starline_process_request(
        $_SERVER,
        $_POST,
        static fn (string $to, string $subject, string $message, string $headers): bool => mail($to, $subject, $message, $headers),
        new DateTimeImmutable('now'),
    );

    http_response_code($result['status']);
    if ($result['status'] === 405) {
        header('Allow: POST');
    }
    header('Content-Type: ' . $result['content_type']);
    header('Cache-Control: no-store');
    echo $result['body'];
}
