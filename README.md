# Solvenek funnel

Nuxt 3, TypeScript, Tailwind CSS, Pinia, and Lucide. Applications are sent to a Netlify Function that forwards them to `LEAD_WEBHOOK_URL`; bookings are made in Calendly.

## Run

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000. `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run test:e2e` run verification. Install the browser with `npx playwright install chromium` before the first browser test.

## Structure

- `pages/`: application, scheduling, and confirmation routes.
- `components/`: shared header/footer, fields, buttons, stepper, accordion, and video player.
- `assets/css/main.css` and `tailwind.config.ts`: design tokens, layout, responsive styles, and motion.
- `stores/funnel.ts`: Pinia state persisted in sessionStorage.
- `middleware/funnel.global.ts`: route prerequisites.
- `services/funnel.ts`: application POST to `/.netlify/functions/lead`.
- `netlify/functions/lead.ts`: validates leads (with honeypot) and forwards them to the webhook.
- `pages/schedule.vue`: Calendly inline embed (prefill, UTMs, `calendly.event_scheduled` redirect).
- `utils/tracking.ts`, `plugins/meta-pixel.client.ts`: Meta Pixel `Lead` and `Schedule` events.
- `data/faq.ts`: editable FAQ copy.
- `tests/`: Playwright functional and desktop/mobile screenshot checks.
- `design/`: original references; `screenshots/`: rendered verification images.

## Configuration

- `NUXT_PUBLIC_CALENDLY_URL`: booking page (default `https://calendly.com/bhurajxtha/30min`).
- `NUXT_PUBLIC_META_PIXEL_ID`: Meta Pixel ID; the pixel is not loaded when empty.
- `LEAD_WEBHOOK_URL`: server-side webhook that receives each lead as JSON. See `.env.example`.
- Founder video: `public/videos/founder-intro.mp4` (1080p web encode of the Loom recording), set in `components/FounderVideo.vue`.

## Decisions

The reference files are small, compressed full-page screenshots, so desktop dimensions are inferred. DM Sans and Libre Caslon Text approximate the pictured fonts. The reference copyright year is replaced with the current year. Contact uses the `hello@solvenek.com` address. Calendly sends the confirmation email.

Accordion expansion updates layout immediately, with an opacity fade and rotating chevron; this respects the transform/opacity-only animation constraint. The SVG connector uses the specifically requested stroke-dashoffset drawing effect.

## Verification limits in the authoring environment

Registry downloads were denied, and Nuxt 3 and Playwright were unavailable locally, so dependency installation, Nuxt lint/typecheck/build, and Playwright execution could not be completed here. All Vue components were compiled with a locally available Vue compiler. An offline Vue/Vite preview was exercised in Chrome at 1440px and 375px, covering validation, guards, application and booking submission, consent, reload persistence, video playback, accordions, ICS creation, and horizontal overflow. Those checks use a substitute runtime and do not prove Nuxt integration. Rendered screenshots and results are in `screenshots/`. Once dependencies can be downloaded, run the standard checks above.

