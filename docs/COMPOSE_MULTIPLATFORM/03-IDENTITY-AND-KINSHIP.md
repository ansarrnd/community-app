# 03 — Identity, Profile, and Kinship

Implementation spec for authentication bootstrap, profile, theme preference, demo role switching, and optional kinship. Source references: [Profile screen](../BLUEPRINT/screens/profile.md), [application layer](../BLUEPRINT/08-APPLICATION-LAYER.md), [repository contracts](../BLUEPRINT/02-REPOSITORY-CONTRACTS.md), [kinship module](../BLUEPRINT/04-KINSHIP-MODULE.md).

## Authentication and session bootstrap

- Subscribe to the selected auth provider at app startup and expose a distinct initializing state until the first auth result is known.
- Map authenticated identity and role claims to the app's user model; handle signed-out state explicitly.
- Cancel/unsubscribe the auth listener when its owner is disposed.
- Route protected actions through authenticated state; do not use a hard-coded demo ADMIN as the production identity.
- Preserve sign-out and session restoration behavior.
- Define how expired credentials, missing profiles, and auth/network errors are surfaced and recovered.

**Important:** the current mock profile may default to a demo ADMIN and exposes a demo role switch. This is useful for local QA but must not grant production authority. Keep demo switching isolated to mock/emulator or explicitly approved QA builds, and enforce all real role privileges through trusted claims and backend rules.

## Profile and RSVP history

- Display the current user's name, phone/profile fields available in the existing model, and role badge.
- Load the user's RSVP map and corresponding event summaries; distinguish loading, no RSVPs, and retrieval errors.
- Keep Profile state reactive to auth changes and RSVP updates elsewhere in the app.
- Only expose profile edits that are supported by existing product/backend behavior; this migration does not imply new profile-edit features.

## Role management scope

- Preserve `ManageRoleUseCase` rules and the Firebase `grantRole` contract in shared/backend compatibility tests: only ADMIN may grant roles, and an ADMIN cannot demote themself.
- The current Profile role switch is a demo/QA sign-in path; it is not the same as changing another user's production role.
- The blueprint's screen inventory does not define a user-management screen. Confirm whether such a screen exists outside the documented routes before including admin role-management UI in native parity.

## Theme preference

- Support `Dark`, `Light`, and `System` modes.
- Store the preference locally using a platform-safe persistence abstraction; do not persist a concrete palette when the selected mode is System.
- Apply the effective theme across all destinations, dialogs, system bars, and shared UI.
- Ensure text, icons, selected controls, and error/success states remain legible in both palettes.

## Kinship and event members

- Port kinship types and event payloads: people, relationships, lineage category, context tags, event members, and event relationships.
- Preserve the Tamil relationship labels and inverse relationship mappings as data, not Compose-specific logic.
- Rebuild the optional member picker in event creation, including selecting/adding members and assigning organizer relationships.
- Keep lineage color/tag presentation consistent with the design tokens and accessible without color alone.
- Persist member/relationship data using the current backend contract when the user submits an event.
- Keep kinship optional: an event can be created without kinship data, and the feature should remain isolated so it can be disabled without breaking core event flows.

### Acceptance checks

- Session restores and updates the signed-in profile when auth state changes.
- Role-based UI reflects the authenticated role; a local demo role switch cannot elevate production privileges.
- Theme mode survives app restart and System follows the device appearance setting.
- RSVP history reflects current RSVP state and handles an empty list.
- Kinship labels, inverse mappings, member relationships, and optional submission behavior match current module tests.
