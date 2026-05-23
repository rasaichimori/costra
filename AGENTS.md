# Agent guide: testing

Every feature, bug fix, or refactor that changes behavior **must include test updates**. A feature is not done until tests pass locally and in CI.

## Before you finish

Run the full verification suite and confirm green output:

```bash
npm run check
npm run lint
npm run test:unit -- --run
npm run test:e2e
```

CI runs these on every PR. Do not mark work complete with failing or skipped tests unless the user explicitly accepts that tradeoff.

---

## What to test (by layer)

Use the **smallest layer that catches real regressions**:

| Layer | Location | Use for |
|-------|----------|---------|
| **Unit** | `src/tests/*.spec.ts` | Pure logic in `src/lib/utils/`, validation, calculations, history |
| **Component** | `src/**/*.svelte.spec.ts` | Svelte UI that needs a browser (wrap with providers; see `TestProviders.svelte`) |
| **E2E** | `e2e/*.test.ts` | Critical user journeys across pages, localStorage, modals, undo/redo |

**Prefer unit tests** for business logic. Add E2E only for integration paths unit tests cannot cover (navigation, overlays, persistence).

### High-value areas in this codebase

- **Cost engine** — `costCalculatorUtils.ts`, `unit.ts` (conversions, compounds, recipes)
- **Import/export** — `importUtils.ts` (validation, normalization); keep validation out of Svelte components
- **Persistence** — `localStorage.ts`, undo/redo via `history.ts` and `data.svelte.ts`
- **Unit conversions** — schema semantics: `conversionFactor` = how many **input** units equal one **output** unit (e.g. `125 g = 1 cup` → `{ inputUnit: 'g', outputUnit: 'cup', conversionFactor: 125 }`)

---

## When implementing a feature

1. **Read existing tests** in the area you are changing. Understand what behavior they lock in.
2. **Add or extend tests** that describe the *new* expected behavior.
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
   - Yes → update the test *and* confirm the new behavior is correct (UI copy, schema, cost math, import format).  
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

## Checklist (copy before marking done)

- [ ] New/changed behavior has tests at the appropriate layer(s)
- [ ] Existing test changes are justified (intentional behavior change, not masking bugs)
- [ ] `npm run test:unit -- --run` passes
- [ ] `npm run test:e2e` passes (when touching UI flows, import/export, dashboard, or settings)
- [ ] `npm run check` and `npm run lint` pass
