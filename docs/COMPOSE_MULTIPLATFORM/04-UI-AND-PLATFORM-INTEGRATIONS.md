# 04 — UI and Platform Integrations

Implementation spec for shared Compose UI, visual parity, and native Android/iOS capabilities. Source references: [design tokens](../BLUEPRINT/05-UI-DESIGN-TOKENS.md), [token JSON](../BLUEPRINT/design-tokens.json), [screen references](../screenshots/).

## Shared UI architecture

- Place reusable design-system elements and screen UI in the shared Compose source set where supported.
- Keep platform APIs behind narrow interfaces implemented in Android and iOS source sets.
- Use typed UI state and explicit events/actions. Composables render state and emit actions; they should not own backend access or business rules.
- Keep navigation destinations, domain use cases, and platform adapters separated so screens can be tested without Firebase or OS services.
- Select navigation, state, persistence, serialization, and image libraries as an explicit foundation decision before relying on them in feature code.

## Design system translation

Port the machine-readable tokens and the semantics in [the visual blueprint](../BLUEPRINT/05-UI-DESIGN-TOKENS.md):

- Dark/light palettes, distinct segment/input/chip/glow token families.
- Typography variants (`h1`, `h2`, `h3`, subtitle, body, caption, button).
- Spacing scale 4/8/16/24/32/48 and documented corner radii.
- Reusable themed text, segment pill, action chip, selectable card, search field, role badge, and event card.
- Category-specific card accents and accessible selected, disabled, pressed, and focus states.

Use the reference screenshots for visual comparison, but prioritize readable content, platform-native accessibility, and stable list performance over pixel-perfect imitation of React Native-only effects.

## Visual effects and list performance

- Decide whether glass blur and aurora backgrounds are reproduced, simplified, or omitted; record any deliberate difference.
- Keep expensive blur/effects off scrolling rows unless profiling demonstrates acceptable performance.
- Use lazy composition for feed/queue/RSVP collections; provide stable item keys and avoid recomposing the full feed for unrelated changes.
- Load invitation images asynchronously with placeholders, error fallback, and appropriate caching.
- Verify contrast, dynamic text scaling, screen reader descriptions, touch target size, and landscape/small-screen layouts.
- Support Android tablet/window resizing with adaptive widths; use list/detail or navigation-rail patterns only where they improve existing workflows and do not alter role behavior.
- Keep screen-owned work lifecycle-aware: cancel obsolete queries when filters change or screens leave scope, and avoid duplicate observers after recreation.
- Profile startup, list scrolling, image memory, and recomposition on representative low/mid-range Android phones and tablets.
- Support Android tablet/window resizing with adaptive widths; use list/detail or navigation-rail patterns only where they fit the existing workflow and do not alter role behavior.
- Keep screen-owned work lifecycle-aware: cancel obsolete queries when filters change or screens leave scope, and avoid duplicate observers after recreation.
- Profile startup, list scrolling, image memory, and recomposition on representative low/mid-range Android phones and tablets.

## Platform adapters

Define shared interfaces for capabilities such as:

| Capability | Shared responsibility | Platform responsibility |
|------------|-----------------------|-------------------------|
| Image selection | Request image and represent selected asset/result | Android/iOS picker, permission and URI/file handling |
| Image upload | Validate metadata, invoke existing upload/backend contract, report result | Provide a readable upload stream/file handle when required |
| External links | Validate destination and expose success/failure | Open browser, maps, WhatsApp, or system share UI |
| Secure storage | Typed read/write/delete boundary | Use platform-protected storage for sensitive values |
| Connectivity | Convert status into shared network state | Observe platform network changes |
| System UI | Request desired appearance/insets | Configure status/navigation bars and iOS safe areas |

Keep permission rationale, denied-permission, cancellation, unavailable-handler, and failure states explicit. Do not silently treat cancellation or an OS error as a successful operation.

## Acceptance checks

- Both platforms use the same shared tokens and equivalent interaction states.
- Images and external actions handle success, cancellation, unsupported targets, and errors.
- Sensitive values are not written to plain preferences.
- Scrolling feeds remain responsive with long lists and image loading.
- Screen readers can identify controls, selected states, event summaries, and validation errors.
- Phone and tablet layouts remain usable across orientation, split-screen, and window resizing.
- Background/foreground, configuration change, and process recreation do not duplicate operations or show unacknowledged mutations as complete.
- Phone and tablet layouts remain usable across orientation, split-screen, and window resizing.
- Background/foreground, configuration change, and process recreation do not duplicate operations or show unacknowledged mutations as complete.
