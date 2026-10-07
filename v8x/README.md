# Digital Arhat V8X — Lead Demo Release System

V8X is the isolated release lane for Saudi prospect demos.

## Release law
- Source branch: `v8x`
- Vercel project: `v8x`
- Deployment mode: manual production release only
- Preview deployments: disabled
- One approved lead = one release commit = one production deployment
- Every client receives a prospect-specific alias pinned to that exact deployment
- Never move an old client's alias to a newer prospect deployment

## Lead → demo workflow
1. Fail-closed dedupe before serious research.
2. Reserve the economic identity when serious research begins.
3. Build only from verified business facts and attributable prospect assets.
4. Keep FACT / INFERENCE / UNKNOWN separate.
5. Verify phone or WhatsApp before wiring direct handoff; otherwise use the verified public route.
6. Run contamination audit: no previous prospect names, phones, logos, initials, copy or assets.
7. Run responsive + interaction QA before release.
8. Update `demo-registry.json`.
9. Commit once to `v8x`.
10. Deploy that exact commit to Vercel production.
11. Assign a unique prospect alias and verify HTTP 200 before outreach.

## Current active release
- Prospect: مؤسسة فهد الزاهر للمطابخ
- Demo slug: `fahd-al-zaher-kitchens`
- Source: `demos/fahd-al-zaher/index.html`
- Root `index.html` is the same approved demo so a deployment can receive a clean root alias.
