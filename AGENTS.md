# Agent guide

Instructions for implementing features in Costra. A feature is **not complete** until tests pass, i18n is updated, and CI checks are green.

## Before you finish

Run the full verification suite and confirm green output:

```bash
npm run check
npm run lint
npm run test:unit -- --run
npm run test:e2e
```

CI runs these on every PR. Do not mark work complete with failing checks unless the user explicitly accepts that tradeoff.

---

# Testing

Every feature, bug fix, or refactor that changes behavior **must include test updates**.

## What to test (by layer)

Use the **smallest layer that catches real regressions**:

| Layer         | Location                  | Use for                                                                          |
| ------------- | ------------------------- | -------------------------------------------------------------------------------- |
| **Unit**      | `src/tests/*.spec.ts`     | Pure logic in `src/lib/utils/`, validation, calculations, history                |
| **Component** | `src/**/*.svelte.spec.ts` | Svelte UI that needs a browser (wrap with providers; see `TestProviders.svelte`) |
| **E2E**       | `e2e/*.test.ts`           | Critical user journeys across pages, localStorage, modals, undo/redo             |

**Prefer unit tests** for business logic. Add E2E only for integration paths unit tests cannot cover (navigation, overlays, persistence).

### High-value areas in this codebase

- **Cost engine** — `costCalculatorUtils.ts`, `unit.ts` (conversions, compounds, recipes)
- **Import/export** — `importUtils.ts` (validation, normalization); keep validation out of Svelte components
- **Persistence** — `localStorage.ts`, undo/redo via `history.ts` and `data.svelte.ts`
- **Unit conversions** — schema semantics: `conversionFactor` = how many **input** units equal one **output** unit (e.g. `125 g = 1 cup` → `{ inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }`)

---

## When implementing a feature

1. **Read existing tests** in the area you are changing. Understand what behavior they lock in.
2. **Add or extend tests** that describe the _new_ expected behavior.
3. **Run tests** while developing; fix failures before moving on.
4. **Extract testable logic** from components into `src/lib/utils/` when a `.svelte` file would be awkward to test (see `importUtils.ts` as the pattern).

### Test file conventions

- Unit tests: `src/tests/<module>.spec.ts`
- Mirror the module under test; reuse fixtures from `mockData.ts` or small inline factories (see `costCalculatorUtils.spec.ts`).
- E2E helpers: `e2e/helpers.ts` (e.g. seed localStorage before visiting `/dashboard`).

---

## Changing existing tests — think deeply first

**Do not update assertions just to make tests pass.** A failing test may be catching a real bug or documenting a contract users depend on.

Before modifying an existing test, answer:

1. **Did the product behavior intentionally change?**
   - Yes → update the test _and_ confirm the new behavior is correct (UI copy, schema, cost math, import format).
   - No → fix the implementation, not the test.

2. **Is the test wrong about domain rules?**  
   Example: unit conversion tests must match the schema documented in `ConversionRow.svelte` and `unit.ts`, not an intuitive but incorrect inverse.

3. **Is the test brittle (implementation detail)?**  
   Prefer testing outputs and public APIs over CSS classes or internal function names. If a test is brittle, refactor the test — not the feature — unless the feature itself was wrong.

4. **Will this weaken regression protection?**  
   Avoid deleting tests without replacement. Avoid overly broad mocks that hide integration failures.

### When changing tests is correct

- Renaming or moving code (update imports/paths only).
- Intentional product change agreed with the user (new validation rule, new cost formula, new import field).
- Fixing tests that were written against a bug (document the correct rule in a comment if non-obvious).

### When changing tests is wrong

- “The code works in the browser” but math/import/history is wrong.
- Removing failing tests to unblock CI.
- Loosening assertions (`toBeTruthy()` instead of exact values) without justification.

If unsure, **run the test, read the failure, trace to `src/lib/` implementation, and decide whether the test or the code is wrong** — default to trusting tests that encode documented schema/math rules.

---

## Writing good tests

- **Name tests by behavior**: `'rejects recipe referencing missing ingredient'`, not `'validation test 3'`.
- **One logical assertion per test** when possible; share setup via helpers/factories.
- **Use `mockData`** for realistic recipes/compounds; use minimal fixtures for edge cases.
- **E2E**: seed `localStorage` (`costra_welcome_choice`, `costra_app_data`) via `e2e/helpers.ts` to avoid flaky welcome modals.
- **Do not add tests** for trivial getters, pure layout, or third-party libraries.

---

## Common commands

```bash
# Single unit file
npm run test:unit -- --run src/tests/unit.spec.ts

# Server-only unit tests (no browser)
npm run test:unit -- --run --project server

# Single E2E file
npm run test:e2e -- e2e/dashboard.test.ts

# Watch mode while developing
npm run test:unit
```

---

# Internationalization (i18n)

Every user-facing string change **must stay in sync across locales**. Do not ship English-only copy.

## Stack

| Piece                          | Location                                         |
| ------------------------------ | ------------------------------------------------ |
| Message source (edit these)    | `messages/en.json`, `messages/ja.json`           |
| Generated output (do not edit) | `src/lib/paraglide/`                             |
| Project config                 | `project.inlang/settings.json`                   |
| Usage in code                  | `import { m } from '$lib/paraglide/messages.js'` |
| Localized routes               | `localPath()` from `$lib/i18n.ts`                |

Paraglide regenerates `src/lib/paraglide/` via the Vite plugin on `dev` / `build` / `check`. **Never hand-edit generated paraglide files.**

Base locale is **English** (`en`). **Japanese** (`ja`) must stay in parity.

## When implementing a feature

1. **No hardcoded user-facing strings** in `.svelte`, routes, or utils shown to users (labels, buttons, errors, toasts, placeholders, aria-labels, page titles).
2. **Add a message key** to `messages/en.json` first — use camelCase names consistent with existing keys (e.g. `importValidationMissingCostsRecipes`, `fieldTotalCost`).
3. **Add the same key** to `messages/ja.json` with a proper Japanese translation. If you cannot translate confidently, use a clear placeholder and note it for the user — but **never leave the key missing from `ja.json`**.
4. **Use parameterized messages** for dynamic text: `"fieldTotalCost": "Total Cost ({currency})"` → `m.fieldTotalCost({ currency })`.
5. **Use `m.*()` in TS too** when returning user-visible errors (see `importUtils.ts`).
6. **Use `localPath('/…')`** for internal links so locale prefix/cookie routing works (see `LandingNav.svelte`).

### Changing existing messages

- **Copy change** → update both `en.json` and `ja.json`.
- **Key rename** → update all `m.oldKey()` call sites; remove or migrate old keys from both locale files.
- **Do not change message meaning** in one locale only; keep EN/JA aligned in intent.

### What not to i18n

- Console logs, test fixtures, mock data ingredient names, JSON export field names, CSS, or internal developer comments.

## Verify locale parity

Before finishing, confirm every new or renamed key exists in **both** files:

```bash
# Keys in en but missing from ja (should print nothing)
comm -23 <(jq -r 'keys[]' messages/en.json | sort) <(jq -r 'keys[]' messages/ja.json | sort)

# Keys in ja but missing from en (should print nothing)
comm -13 <(jq -r 'keys[]' messages/en.json | sort) <(jq -r 'keys[]' messages/ja.json | sort)
```

Then run `npm run check` so Paraglide recompiles and TypeScript catches typos in `m.*()` calls.

---

# Schema & seed data

Types live in `src/lib/data/schema.ts`. When you **add, remove, or rename fields** on persisted documents (`IngredientDoc`, `RecipeDoc`, `RecipeSize`, `CompoundIngredientDoc`, etc.):

1. **Update normalization/migration** in the relevant utils (e.g. `recipeUtils.ts` `normalizeRecipeDoc`) so older imports and localStorage still load.
2. **Update starting seed data** so new installs and “load example data” match the current shape:
   - `src/lib/data/mockData.ts` — dashboard example data, E2E seeds, settings “reset to example”
   - `src/lib/data/current-data.json` — full reference export / prefilled dataset
3. **Update tests** that build fixtures inline (`src/tests/*.spec.ts`, `e2e/helpers.ts` if it bypasses `mockData`).

A schema change is **not complete** until seed JSON/TS fixtures match `schema.ts` and normalization handles legacy shapes where applicable.

---

## Checklist (copy before marking done)

- [ ] New/changed behavior has tests at the appropriate layer(s)
- [ ] Existing test changes are justified (intentional behavior change, not masking bugs)
- [ ] All new/changed user-facing strings use `m.*()` — nothing hardcoded
- [ ] New message keys added to **both** `messages/en.json` and `messages/ja.json`
- [ ] EN/JA key sets are in parity (see `comm` commands above)
- [ ] `npm run test:unit -- --run` passes
- [ ] `npm run test:e2e` passes (when touching UI flows, import/export, dashboard, or settings)
- [ ] `npm run check` and `npm run lint` pass
- [ ] Schema changes: `mockData.ts` and `current-data.json` updated; normalization handles legacy data if needed
