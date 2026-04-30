---
targets:
  - '*'
---
# /review-tests - Test Review Against Guidelines

Review test files for CLAUDE.md compliance and testing best practices.

## Usage

```
/review-tests <path>
```

## Arguments

- `<path>` - Path to a test file or directory containing tests

## Instructions

When the user runs this command:

1. **Find test files** in the specified path.

2. **Review each test file** for the following issues.

### Runner Consistency (High Priority)

Check that the test uses the runner and helpers that match the local package setup.

**Flag as issue:**

```typescript
import { render } from '@repo/testing/vitest'
vi.mock('../thing')
jest.useFakeTimers()
```

Flag `@repo/testing/vitest` or `vi.*` inside `apps/helpdesk` tests unless the local package config explicitly uses Vitest. Flag `jest.*` inside extracted packages unless the local package config explicitly uses Jest.

### Render Helper Imports (High Priority)

In `apps/helpdesk/**`, `render` and `renderHook` should come from `@repo/testing`.

**Flag as issue in `apps/helpdesk/**`:**

```typescript
import { render, renderHook } from '@testing-library/react'
import { renderWithProviders } from '@/tests/renderWithProviders'
```

**Suggest instead:**

```typescript
import { render, renderHook } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
```

Direct Testing Library imports are still fine for `screen`, `waitFor`, `within`, `act`, and types. Test-local setup helpers may wrap `@repo/testing` `render` or `renderHook` when a spec needs extra providers or route state.

In `packages/**`, check whether the package has a local `tests/render.utils` helper.

**Flag as issue when a local helper exists:**

```typescript
import { render, renderHook } from '@testing-library/react'
```

**Suggest instead:**

```typescript
import { screen, waitFor, within } from '@testing-library/react'

import { render, renderHook } from '../../tests/render.utils'
```

Direct Testing Library imports are still fine for `screen`, `waitFor`, `within`, `act`, and types. The package helper should own `render` and `renderHook` because it carries the package providers, router defaults, bridge context, `QueryClient` lifecycle, and `userEvent` setup.

### Selector Priority (High Priority)

Check that selectors follow accessibility priority order:

1. `getByRole`
2. `getByText`
3. `getByLabelText`
4. `within(...)`
5. `getByPlaceholderText`
6. `getByTestId` only as last resort

**Flag as issue:**

```typescript
screen.getByTestId('submit-button')
getByTestId('user-name')
screen.getAllByRole('button')[1]
```

**Suggest instead:**

```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByText('User Name')
within(dialog).getByRole('button', { name: /submit/i })
```

### Async Patterns (High Priority)

Check for proper async handling.

**Flag as issue:**

```typescript
userEvent.click(button)
user.click(button)
fireEvent.click(button)

await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument()
})

await waitFor(() => screen.getByRole('dialog'))

await waitFor(() => {
    expect(queryClient.isFetching()).toBe(0)
})

await act(() => user.click(button))
```

**Suggest instead:**

```typescript
await user.click(button)
await user.type(input, 'text')

expect(await screen.findByText('Saved')).toBeInTheDocument()
const dialog = await screen.findByRole('dialog')

await waitFor(() => {
    expect(saveButton).toBeEnabled()
})
```

Prefer `findBy*` and `findAllBy*` when the test is waiting for an element, option, dialog, menu, or list to appear. Use `waitFor` when the assertion is about a state transition, callback assertion, request sequencing, disappearance, or enabled/disabled change.

Only treat `act()` as correct when the test is manually advancing timers or calling a hook callback/state setter that RTL does not already wrap.

### Query Client / Shared State (High Priority)

Check for cache leakage and test-order coupling.

**Flag as issue:**

```typescript
const queryClient = createTestQueryClient()
const requests: Request[] = []
```

**Suggest instead:**

```typescript
const { result } = renderHook(() => useThing())
```

The shared `render` and `renderHook` helpers should own `QueryClient` creation and cleanup. Do not suggest manual query client cleanup unless the test intentionally owns shared cache state.

### Timer / Debounce Patterns (Medium Priority)

Check for proper fake timer setup when the test drives debounce or timer behavior.

**Flag as issue:**

```typescript
vi.useFakeTimers()
const user = userEvent.setup()
```

**Suggest instead:**

```typescript
vi.useFakeTimers()
const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime,
})

act(() => {
    vi.advanceTimersByTime(300)
})
```

In `apps/helpdesk`, the same pattern should use `jest.*` instead of `vi.*`.

Also flag tests that never flush pending timers before restoring real timers.

### Portal Menus and Async Controls (Medium Priority)

Check that tests wait for opened portal UI and async controls before interacting with nested items.

**Flag as issue:**

```typescript
await user.click(screen.getByRole('button', { name: /more actions/i }))
await user.click(screen.getByRole('menuitem', { name: /delete/i }))
```

**Suggest instead:**

```typescript
await user.click(screen.getByRole('button', { name: /more actions/i }))

const menu = (await screen.findAllByRole('menu')).at(-1)!
await user.click(
    await within(menu).findByRole('menuitem', { name: /delete/i }),
)
```

Also flag:

- Clicks on controls that can be disabled while async data loads unless the test waits for `toBeEnabled()`
- `waitFor(() => screen.getByRole(...))` or `waitFor(() => screen.getByText(...))` when `findByRole`, `findByText`, or `findAllByRole` would directly express the awaited appearance
- Reusing a trigger, menu, option, or searchbox handle after a close/reopen flow instead of querying the reopened UI
- Generic retry-click or click-twice helpers that hide races instead of waiting for readiness

Reusable opener helpers are fine when they are narrow and prove readiness. Prefer helpers that check `aria-expanded`, click only when closed, and return a fresh element from `findByRole`.

### Mock Usage (High Priority)

Check for proper mock usage.

**Flag as issue:**

```typescript
vi.mock('../api', () => ({ fetchData: vi.fn() }))
const mockFetch = vi.fn()

jest.mock('@gorgias/axiom')
vi.mock('react-router-dom')
vi.mock('@tanstack/react-query')
vi.mock('@gorgias/helpdesk-queries', () => ({
    useListTickets: vi.fn(),
}))
```

**Suggest instead:**

```typescript
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const mockGetTicket = mockGetTicketHandler()
server.use(mockGetTicket.handler)
```

Mocking `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` is a severe anti-pattern. These mocks hide provider, routing, cache, and network behavior that the test should exercise. Use the shared render helper for providers and router state, and use SDK MSW handlers from the matching `@gorgias/*-mocks` package for server data.

Also flag runner-mismatched mock globals unless the local package config explicitly uses that runner.

### User Interaction Testing (Medium Priority)

Check for proper user interaction simulation.

**Flag as issue:**

```typescript
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'text' } })

await user.click(button)
await user.click(button)
```

**Suggest instead:**

```typescript
await waitFor(() => {
    expect(button).toBeEnabled()
})
await user.click(button)
await user.type(input, 'text')
```

### MSW Server Setup (Low Priority)

Check for proper server lifecycle:

```typescript
const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
```

If the package has a shared `src/tests/server.ts`, flag new file-local `setupServer()` usage and suggest importing the shared `server`.

### Browser API Shims (Low Priority)

Check that reusable jsdom shims live in package setup files.

**Flag as issue when repeated across specs:**

```typescript
Object.defineProperty(document, 'execCommand', { value: vi.fn() })
Object.defineProperty(window, 'prompt', { value: vi.fn() })
```

**Suggest instead:** move shared browser API shims to the package `src/tests/setup.ts`, then keep individual specs focused on behavior.

3. **Generate a report** with:
   - Issues found, grouped by severity
   - File path and line number for each issue
   - Suggested fix for each issue
   - Summary count of issues by type
   - Explicit callouts for flaky smells such as shared query clients, waits on internals, retry-click helpers, index-based selectors, and uncontrolled timer tests

## Example Output

```
Test Review: src/pages/settings/teams/tests/TeamForm.spec.tsx
=============================================================

HIGH PRIORITY ISSUES:

1. Line 45: using data-testid selector
   Found: getByTestId('team-name-input')
   Suggest: getByRole('textbox', { name: /team name/i })

2. Line 67: waiting on query internals
   Found: waitFor(() => expect(queryClient.isFetching()).toBe(0))
   Suggest: wait for the success toast or request payload instead

MEDIUM PRIORITY ISSUES:

3. Line 23: using fireEvent instead of userEvent
   Found: fireEvent.change(input, { target: { value: 'New Team' } })
   Suggest: await user.type(input, 'New Team')

Summary: 2 high, 1 medium, 0 low priority issues found
```
