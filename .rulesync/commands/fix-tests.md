---
targets:
  - '*'
---
# /fix-tests - Test Fixer

Analyze and fix failing tests based on common patterns.

## Usage

```
/fix-tests <test-path>
```

## Arguments

- `<test-path>` - Path to the failing test file (e.g. `src/pages/settings/teams/tests/TeamForm.spec.tsx`)

## Instructions

When the user runs this command:

1. **Determine the package** from the file path:
   - `packages/<name>/...` -> package is `@repo/<name>`
   - `apps/helpdesk/...` or `src/...` -> package is `@repo/helpdesk`
   - Then confirm the active runner from the local `package.json`, local `jest.config.*` or `vitest.config.*`, and neighboring tests
   - `apps/helpdesk/**` defaults to Jest, extracted `packages/**` usually default to Vitest, and local config wins for exceptions

2. **Run the test** to see the failure:

   ```bash
   pnpm --filter <package> test -- <test-path>
   ```

3. **Analyze the error** and match it to common patterns.

### Common Error Patterns and Fixes

#### 1. Wrong Runner Utilities / Helpers

**Error:**

```typescript
ReferenceError: vi is not defined
Cannot resolve module '@repo/testing/vitest'
ReferenceError: jest is not defined
```

**Fix:** Match the local test runner and helpers before changing the test logic.

- `apps/helpdesk/**` should normally import `render` and `renderHook` from `@repo/testing` and use `jest.*`
- Extracted `packages/**` should normally use Vitest helpers and `vi.*`
- Local `package.json`, `jest.config.*`, `vitest.config.*`, and neighboring tests override the folder heuristic for exceptions

#### 2. Bypassing Render Helpers

**Error:**

```typescript
Missing provider, router, bridge context, user setup, or query client setup in a test
```

**Fix:** In `apps/helpdesk/**`, import `render` and `renderHook` from `@repo/testing`.

```typescript
// BEFORE
import { render, renderHook, screen } from '@testing-library/react'

// AFTER
import { render, renderHook } from '@repo/testing'
import { screen } from '@testing-library/react'
```

Test-local setup helpers may wrap `@repo/testing` `render` or `renderHook` when a spec needs extra providers or route state.

In `packages/**`, import `render` and `renderHook` from the nearest package-local `tests/render.utils` when it exists.

```typescript
// BEFORE
import { render, renderHook, screen } from '@testing-library/react'

// AFTER
import { screen } from '@testing-library/react'
import { render, renderHook } from '../../tests/render.utils'
```

Keep importing `screen`, `waitFor`, `within`, `act`, and types from Testing Library.

#### 3. Act Warning - State Update Not Wrapped

**Error:**

```typescript
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Fix:** Ensure `userEvent` calls are awaited.

```typescript
// BEFORE
user.click(button)

// AFTER
await user.click(button)
```

If the warning is still present, fix the async boundary before reaching for `act()`:

```typescript
await user.click(button)

await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument()
})

await waitForRequest(async (request) => {
    expect(await request.json()).toEqual(expectedPayload)
})

act(() => {
    vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
})
```

Do **not** default to `await act(() => user.click(button))`. React's `act` docs note that Testing Library helpers are already wrapped with `act()`: <https://react.dev/reference/react/act>.

#### 4. Element Not Found - Async Data

**Error:**

```typescript
Unable to find an element with the role "button"
TestingLibraryElementError: Unable to find...
```

**Fix:** Wait for the element to appear after async data loads.

```typescript
await waitFor(() => {
    expect(
        screen.getByRole('button', { name: /save/i }),
    ).toBeInTheDocument()
})
```

#### 5. Multiple Elements Found

**Error:**

```typescript
Found multiple elements with the role "button"
```

**Fix:** Use a more specific or more scoped selector.

```typescript
screen.getByRole('button', { name: /submit/i })

const form = screen.getByRole('form')
within(form).getByRole('button', { name: /submit/i })
```

#### 6. Network Request Not Mocked or Escaping MSW

**Error:**

```typescript
Error: [MSW] Detected an unhandled request: GET /api/...
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Fix:** Add the missing handler or fix teardown order.

```typescript
import { mockGetXxxHandler } from '@gorgias/helpdesk-mocks'

const mockGetXxx = mockGetXxxHandler()
const localHandlers = [...existingHandlers, mockGetXxx.handler]

afterEach(() => {
    server.resetHandlers()
})
```

Shared `render` and `renderHook` helpers should own `QueryClient` creation and cleanup. Consumer specs should add the missing SDK MSW handler instead of creating or clearing query clients directly.

#### 6a. Core Provider or Query Package Mocked

**Error:**

```typescript
jest.mock('@gorgias/axiom')
vi.mock('react-router-dom')
vi.mock('@tanstack/react-query')
vi.mock('@gorgias/helpdesk-queries', () => ({ useListTickets: vi.fn() }))
```

**Fix:** Remove the module mock. Mocking `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` is a severe anti-pattern because it bypasses provider, routing, cache, and network behavior. Use the shared render helper for providers/router/query setup and SDK MSW handlers for server data.

#### 7. Debounce / Timer Flake

**Error:**

```typescript
Timeout - Async callback was not invoked within the timeout
```

**Fix:** Use scoped Vitest fake timers with Testing Library's `advanceTimers` option.

```typescript
beforeEach(() => {
    vi.useFakeTimers() // Use jest.useFakeTimers() in apps/helpdesk
})

afterEach(() => {
    vi.runOnlyPendingTimers() // Use jest.runOnlyPendingTimers() in apps/helpdesk
    vi.useRealTimers() // Use jest.useRealTimers() in apps/helpdesk
})

const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
})

await user.type(input, 'shoe')

act(() => {
    vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
})
```

#### 8. Snapshot Mismatch

**Error:**

```typescript
Snapshot name: `Component should render correctly 1`
- Snapshot  - 5
+ Received  + 3
```

**Fix:** This repo generally prefers explicit assertions over snapshots. Replace the snapshot if practical. If the snapshot is still intentional, review and update it carefully.

#### 9. Mock Not Returning Expected Data

**Error:**

```typescript
TypeError: Cannot read properties of undefined (reading 'name')
```

**Fix:** Ensure the mock returns a complete data structure.

```typescript
const { handler } = mockGetTeamHandler(async () =>
    HttpResponse.json({
        ...mockGetTeam.data,
        id: 1,
        name: 'Team Name',
    }),
)
```

#### 10. Async Assertion Timing

**Error:**

```typescript
expect(received).toBeInTheDocument()
Expected element: <div>...</div>
Received: null
```

**Fix:** Use `waitFor` for async content.

```typescript
await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
})
```

#### 11. Query Client Leak or Shared Mutable Test State

**Error:**

```typescript
Test data from previous test leaking into current test
```

**Fix:** Prefer safer test isolation.

```typescript
// Preferred: use a shared render helper that creates a fresh QueryClient per render
const { result } = renderHook(() => useThing())
```

Also remove module-scoped mutable fixtures, counters, arrays, and consumer-owned query clients when the test outcome depends on execution order.

#### 12. Router Context Missing

**Error:**

```typescript
useHistory() may only be used within a <Router> component
```

**Fix:** Wrap the component in a router or use the existing shared render helper that already provides one.

```typescript
render(
    <MemoryRouter initialEntries={['/current-path']}>
        <Component />
    </MemoryRouter>,
)
```

#### 13. Redux Store Missing

**Error:**

```typescript
could not find react-redux context value
```

**Fix:** Wrap the component in a provider or reuse the existing shared test helper.

```typescript
render(
    <Provider store={mockStore()}>
        <Component />
    </Provider>,
)
```

#### 14. Waiting on Internals Instead of Behavior

**Error:**

```typescript
Flaky waits around queryClient.isFetching(), mock call counts, or retry-click helpers
```

**Fix:** Replace internal polling with observable behavior.

```typescript
// BEFORE
await waitFor(() => {
    expect(queryClient.isFetching()).toBe(0)
})
await user.click(button)
await user.click(button)

// AFTER
await waitFor(() => {
    expect(button).toBeEnabled()
})
await user.click(button)
await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument()
})
```

#### 15. Portal Menu or Async Control Race

**Error:**

```typescript
Unable to find role "menuitem"
Unable to find role "option"
Unable to perform pointer interaction as the element is disabled
```

**Fix:** Wait for the opened UI or enabled control before clicking nested items. Use `findBy*` for elements/options that appear asynchronously, and use `waitFor` for enabled/disabled changes or disappearance.

```typescript
await user.click(screen.getByRole('button', { name: /more actions/i }))

const menu = (await screen.findAllByRole('menu')).at(-1)!
await user.click(
    await within(menu).findByRole('menuitem', { name: /delete/i }),
)

const submitButton = await screen.findByRole('button', { name: /merge/i })
await waitFor(() => {
    expect(submitButton).toBeEnabled()
})
await user.click(submitButton)
```

If the failing test closes and reopens a portal-backed control, do not keep using handles captured before the close:

```typescript
await user.keyboard('{Escape}')
await waitFor(() => {
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
})

await user.click(await screen.findByRole('button', { name: /tags/i }))
const reopenedSearchbox = await screen.findByRole('searchbox')
await user.type(reopenedSearchbox, 'vip')
```

If several tests need the same setup, extract an opener that proves readiness by returning the fresh element it waited for. Avoid generic retry-click helpers; a helper can check `aria-expanded` and click only when the trigger is closed.

4. **Apply the fix** to the test file.

5. **Re-run the test** to verify:

   ```bash
   pnpm --filter <package> test -- <test-path>
   ```

6. **Report the result**:
   - If fixed: show what changed
   - If still failing: show the remaining error and the next likely step

## Example Session

```
Running test: src/pages/settings/teams/tests/TeamForm.spec.tsx

Error found:
  Warning: An update to TeamForm inside a test was not wrapped in act(...)
  at line 45: userEvent.click(submitButton)

Applying fix:
  Changed: userEvent.click(submitButton)
  To:      await user.click(submitButton)
  Added:   wait for the success toast instead of polling internals

Re-running test...

Result: PASS
Test fixed successfully.
```
