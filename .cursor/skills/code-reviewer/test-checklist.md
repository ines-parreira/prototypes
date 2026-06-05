# Test Quality Checklist

## Runner Selection

| Check                                                                                             | Status |
| ------------------------------------------------------------------------------------------------- | ------ |
| Runner matches the local package setup                                                            | ⬜     |
| `apps/helpdesk/**` uses neighboring Jest helpers and `jest.*` by default                         | ⬜     |
| Extracted `packages/**` use Vitest helpers and `vi.*` by default                                 | ⬜     |
| Local `package.json`, `jest.config.*`, `vitest.config.*`, or neighboring tests override as needed | ⬜     |

## Render Helpers

| Check                                                                                              | Status |
| -------------------------------------------------------------------------------------------------- | ------ |
| Package tests use local `tests/render.utils` `render` when available                               | ⬜     |
| Package hook tests use local `tests/render.utils` `renderHook` when available                      | ⬜     |
| No direct `@testing-library/react` `render` or `renderHook` imports when local helpers exist       | ⬜     |
| Testing Library remains the source for `screen`, `waitFor`, `within`, `act`, and types as needed   | ⬜     |

## Selectors

### Priority Order Compliance

| Check                                        | Status |
| -------------------------------------------- | ------ |
| Using `getByRole` as primary selector        | ⬜     |
| Using `getByText` for text content           | ⬜     |
| Using `getByLabelText` for form inputs       | ⬜     |
| NOT using `getByTestId` unless last resort   | ⬜     |
| No `data-testid` attributes in components    | ⬜     |

### Selector Examples

```tsx
// CORRECT
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByText('Welcome back')
screen.getByLabelText('Password')

// WRONG
screen.getByTestId('submit-button')
screen.getByTestId('email-input')
screen.getAllByRole('button')[1]
```

## Async Patterns

### userEvent Usage

| Check                                                                                     | Status |
| ----------------------------------------------------------------------------------------- | ------ |
| All `userEvent` calls are awaited                                                         | ⬜     |
| No default `act()` wrapper around `userEvent` interactions                                | ⬜     |
| `act()` is only used for manual timer or state transitions that RTL does not already wrap | ⬜     |
| No synchronous `userEvent` calls                                                          | ⬜     |

```tsx
// CORRECT
await user.click(button)
await user.type(input, 'text')
await user.clear(input)
await user.type(input, 'new value')

// WRONG
user.click(button)
await act(() => user.click(button))
```

If an `act()` warning still appears, the review should first ask whether the test is waiting for the right outcome:

```tsx
await user.click(button)
await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument()
})

await waitForRequest(async (request) => {
    expect(await request.json()).toEqual(expectedPayload)
})
```

### waitFor Usage

| Check                                                                                   | Status |
| --------------------------------------------------------------------------------------- | ------ |
| Using `waitFor` for async content                                                       | ⬜     |
| Assertions inside the `waitFor` callback                                                | ⬜     |
| Waiting on observable UI or `waitForRequest(server)` instead of query or mock internals | ⬜     |
| No empty `waitFor(() => {})` blocks                                                     | ⬜     |

```tsx
// CORRECT
await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
})

await waitForRequest(async (request) => {
    expect(await request.json()).toEqual(expectedPayload)
})

// WRONG
await waitFor(() => {
    expect(queryClient.isFetching()).toBe(0)
})

await waitFor(() => {})
```

## User Events

### userEvent vs fireEvent

| Check                                 | Status |
| ------------------------------------- | ------ |
| Using userEvent for user interactions | ⬜     |
| `userEvent.setup()` called in test    | ⬜     |
| NOT using fireEvent for clicks/typing | ⬜     |
| Portal menus, dropdowns, modals, and submenus are found before nested clicks | ⬜     |
| Async controls are enabled before clicking when they can load disabled       | ⬜     |
| Async appearances use `findBy*` instead of `waitFor(() => getBy*)`           | ⬜     |
| Close/reopen flows re-query fresh portal triggers, options, and searchboxes  | ⬜     |

```tsx
// CORRECT
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')

// WRONG
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'text' } })
```

## MSW Setup

### Server Configuration

| Check                                                                                    | Status |
| ---------------------------------------------------------------------------------------- | ------ |
| Using `setupServer()`                                                                    | ⬜     |
| `onUnhandledRequest: 'error'` in `listen()`                                              | ⬜     |
| `server.use()` in `beforeEach` or a shared setup file                                    | ⬜     |
| `server.resetHandlers()` in `afterEach`                                                  | ⬜     |
| `server.close()` in `afterAll`                                                           | ⬜     |
| Shared-query-client tests cancel and clear queries before resetting handlers             | ⬜     |
| No `ECONNREFUSED 127.0.0.1:3000` style teardown leaks caused by resetting MSW too early | ⬜     |

### Mock Handlers

| Check                                               | Status |
| --------------------------------------------------- | ------ |
| Using SDK mock handlers (`@gorgias/helpdesk-mocks`) | ⬜     |
| NOT creating manual API mocks                       | ⬜     |
| Handler overrides use `server.use()`                | ⬜     |
| Shared package `src/tests/server.ts` is reused when it exists | ⬜     |

## Browser API Shims

| Check                                                                           | Status |
| ------------------------------------------------------------------------------- | ------ |
| Reusable jsdom shims live in package `src/tests/setup.ts`                       | ⬜     |
| Specs do not repeatedly redefine shared browser APIs such as `prompt` or observers | ⬜     |
| Per-test shims are only local when the behavior under test needs a unique override | ⬜     |

## Test Structure

### Organization

| Check                                                           | Status |
| --------------------------------------------------------------- | ------ |
| Handlers defined at top of file                                 | ⬜     |
| Related tests grouped in `describe()`                           | ⬜     |
| Descriptive test names                                          | ⬜     |
| One main behavior per test                                      | ⬜     |
| No module-scoped mutable test state unless cleanup is explicit  | ⬜     |

### Render Helper

| Check                                                                                     | Status |
| ----------------------------------------------------------------------------------------- | ------ |
| Using shared test utilities where they exist                                              | ⬜     |
| Shared helpers or local wrappers create a fresh `QueryClient` per render/test by default  | ⬜     |
| Shared `QueryClient` instances are only used intentionally and are fully canceled/cleared | ⬜     |
| All required providers are included                                                       | ⬜     |

## Timer / Debounce Patterns

| Check                                                                                 | Status |
| ------------------------------------------------------------------------------------- | ------ |
| Fake timers are scoped only to timer-driven behavior                                  | ⬜     |
| `userEvent.setup({ advanceTimers: ... })` uses the active runner's timer API          | ⬜     |
| Pending timers are flushed before restoring real timers                               | ⬜     |
| No uncontrolled debounce tests that rely on wall-clock sleeps                         | ⬜     |

```tsx
// CORRECT
const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
})

act(() => {
    vi.advanceTimersByTime(300)
})

afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
})
```

In `apps/helpdesk`, the same pattern should use `jest.*`.

## Flaky Smells

| Check                                                                                            | Status |
| ------------------------------------------------------------------------------------------------ | ------ |
| No retry-click helpers or "click twice if needed" patterns                                       | ⬜     |
| Reusable opener helpers prove readiness instead of hiding races                                  | ⬜     |
| No index-based selectors when a role/name or `within(...)` query would work                      | ⬜     |
| No tests that only restate React Query internals instead of user-visible behavior                | ⬜     |
| No module-scoped `QueryClient`, arrays, counters, or mutable fixtures that depend on test order  | ⬜     |

## Common Violations

1. **Using getByTestId instead of getByRole**
   - Fix: Use role-based query with a name matcher

2. **Missing await on userEvent calls**
   - Fix: Always `await user.click(...)` and `await user.type(...)`

3. **fireEvent instead of userEvent**
   - Fix: Setup `userEvent` and use click/type methods

4. **Manual API mocks**
   - Fix: Use `@gorgias/helpdesk-mocks` handlers

5. **Missing server lifecycle hooks**
   - Fix: Add beforeAll/beforeEach/afterEach/afterAll

6. **Wrapping `userEvent` in `act()`**
   - Fix: Await the interaction and wait for a visible result or request boundary instead

7. **Waiting on query internals**
   - Fix: Assert on rendered UI or `waitForRequest(server)`

8. **Module-scoped query client**
   - Fix: Move query client creation into the render helper or the individual test

9. **Retry-click or click-twice helpers**
   - Fix: Wait for the button to become enabled/open and click once

10. **Uncontrolled debounce tests**
   - Fix: Use the active runner's scoped fake timers with `advanceTimers`

11. **Runner mismatch**
   - Fix: `apps/helpdesk` should use Jest by default, extracted `packages/**` should use Vitest by default, and local package config wins for exceptions

12. **Bypassing package render helpers**
   - Fix: Import `render` and `renderHook` from the package-local `tests/render.utils` when available, not directly from `@testing-library/react`

13. **Clicking nested portal items too early**
   - Fix: Wait for the menu, dropdown, modal, or submenu with `findByRole` or scoped `within(...)` before clicking nested items

## Related Checklists

- [SDK Compliance](sdk-checklist.md) - Data fetching and mutation patterns
- [Axiom UI Kit](axiom-checklist.md) - Component and styling compliance
- [Accessibility](accessibility.md) - Accessible selectors and semantic HTML
