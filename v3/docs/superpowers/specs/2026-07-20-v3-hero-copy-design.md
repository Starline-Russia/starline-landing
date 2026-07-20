# V3 Hero copy design

## Scope

Refine only the Hero headline and supporting message in the shared
`src/components/Hero.astro`, plus the Hero-specific responsive typography in
`src/styles/global.css`. Preserve the existing CTA, proof metrics, background,
orbits, grid, spacing, and overall centered composition.

The isolated `/preview/hero/` route must continue to render the same shared
Hero component used by the full landing.

## Headline

Replace the existing headline with:

1. `Управляем маркетингом`
2. `как системой роста GMV`

Keep the two phrases as separate semantic spans inside the single `h1`. On
tablet and desktop they form two deliberate display lines. The second line
keeps the existing violet gradient emphasis. On mobile, both phrases retain
their semantic separation but may wrap naturally within the available width.

This is an intentional replacement of the previous approved Hero H1
`Starline — оператор роста / для электронной коммерции`; update the v3 content
contract and structural expectations to the new wording rather than preserving
the old assertion.

## Supporting message

Replace the existing supporting message with:

`Связываем привлечение новых клиентов, аналитику и каналы продаж с ростом GMV — а не только с показателями в рекламных отчётах`

Render it without a final period. Use `22px` type above the `640px` mobile
breakpoint, including tablet layouts such as the annotated `1051px` viewport.
Use `17px` at `640px` and below to preserve readable wrapping and avoid making
the already tall mobile Hero unnecessarily longer.

## Preserved behavior and content

- Keep exactly one Hero CTA: `Оставить заявку`, linked to `#lead`.
- Preserve the three existing proof metrics and their wording.
- Do not add a Hero logo, decorative star, second button, animation, or
  JavaScript.
- Keep the headline as the page's only `h1`.
- Preserve no-JavaScript readability and the existing keyboard focus treatment.

## Structural and visual validation

1. Update the Hero structural test before implementation so it requires the new
   headline, supporting message, absence of the final period, and the two
   responsive supporting-message sizes.
2. Run that test and confirm it fails for the intended old-copy and typography
   expectations before changing the component and CSS.
3. Run `npm test`, `npm run check`, `npm run build`, and
   `npm run test:build`.
4. Inspect `/preview/hero/` and the full landing at `1440×900`, `1051×913`, and
   `390×844`.
5. Confirm the desktop/tablet headline hierarchy, mobile wrapping, lack of
   horizontal overflow or clipped text, visible CTA focus, no console errors,
   and no missing assets.

