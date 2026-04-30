---
name: test-expert
description: >-
  Creates comprehensive integration tests and debugs test failures using MSW
  patterns, accessible selectors, and project conventions. Use when writing
  tests, investigating failures, or improving test coverage.
targets:
  - '*'
---
# Test Expert

This skill helps create robust integration tests and debug test failures following project conventions.

## When to Use

Apply this skill when the user asks to:

- Write tests for a component or hook
- Fix failing tests
- Debug test errors
- Improve test coverage
- Understand why a test is flaky

## Safer Defaults

- Choose the runner from the target path before copying any example. `apps/helpdesk/**` defaults to Jest, extracted `packages/**` usually default to Vitest, and local package config plus neighboring tests are the final source of truth for exceptions.
- Prefer existing shared render helpers that match the active runner. In `apps/helpdesk/**`, always import `render` and `renderHook` from `@repo/testing`. In extracted packages, that is often `@repo/testing/vitest` or package-local `tests/render.utils`. Those helpers should own a fresh `QueryClient` per render, which matches the [TanStack Query testing guide](https://tanstack.com/query/v4/docs/framework/react/guides/testing).
- In `apps/helpdesk/**`, do not import `render` or `renderHook` directly from `@testing-library/react`. Test-local setup helpers may wrap `@repo/testing` `render` or `renderHook` when a spec needs extra providers or route state.
- In `packages/**`, import `render` and `renderHook` from the nearest package-local `tests/render.utils` when it exists. Do not import those two helpers directly from `@testing-library/react` when a local helper can provide package providers, router state, bridge context, `QueryClient` ownership, and `userEvent` setup. Keep importing `screen`, `waitFor`, `within`, and `act` from Testing Library as needed.
- If you must own a query client in the test, create it inside the render helper or inside the test. Only keep a shared client when the test is intentionally about shared cache behavior, and then cancel and clear it explicitly.
- Await `userEvent` calls and wait for observable UI state or captured requests. React notes that libraries like Testing Library already wrap their helpers in `act()`, so do not wrap `userEvent` in `act()` as a default fallback. See the [React `act` reference](https://react.dev/reference/react/act) and Testing Library's [guiding principles](https://testing-library.com/docs/guiding-principles/).
- For async content, prefer `findBy*` queries when you are waiting for an element or option list to appear. Use `waitFor` when the assertion is about a state transition, callback, request payload, enabled/disabled state, or disappearance.
- For portal-backed menus, dropdowns, modals, and submenus, wait for the opened UI with `findByRole` or scoped `within(...).findByRole(...)` before interacting with nested options. If a control can be loading or permission-gated, wait for it to be enabled before clicking.
- Re-query portal triggers, searchboxes, menus, and options after closing and reopening them. Previously captured DOM handles can be stale after Escape, click-away, unmount/remount, or async option reloads.
- Reusable open helpers are encouraged when they encode readiness, such as checking `aria-expanded`, clicking only when needed, and returning a fresh ready element from `findByRole`. Do not use generic retry-click or click-twice fallbacks that hide the missing wait.
- Put missing jsdom browser API shims in the package test setup file when multiple tests need them. Avoid repeating `document.execCommand`, `window.prompt`, observer, media, or storage shims inside individual specs unless the behavior is truly local to one test.
- Do not mock `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` packages. Treat those module mocks as a severe anti-pattern. Use shared render helpers for providers/router/query setup and SDK MSW handlers for server responses.
- When reproducing package flakes with constrained CI-style loops, clear stale Nx terminal output and per-package coverage artifacts between iterations. Prefer hardening the test behavior before changing Vitest worker parallelism.
- Use fake timers only for debounce or timer-driven behavior. Pair the active runner's fake timers with `userEvent.setup({ advanceTimers })`, then flush pending timers before restoring real timers. In `apps/helpdesk`, use `jest.useFakeTimers()` and `jest.advanceTimersByTime(...)`. In extracted Vitest packages, use `vi.useFakeTimers()` and `vi.advanceTimersByTime(...)`. See Testing Library's [fake timers guide](https://testing-library.com/docs/using-fake-timers/) and [`advanceTimers` option](https://testing-library.com/docs/user-event/options/#advancetimers).

## Test Creation Workflow

### Step 1: Analyze the Component

Before writing tests:

1. Read the component code
2. Identify what API calls it makes
3. List user interactions (clicks, typing, etc.)
4. Identify different states (loading, error, empty, success)
5. Read neighboring tests and existing test helpers before inventing new setup

### Step 2: Plan Test Cases

Create tests for:

- Initial render / loading state
- Success state with data
- Error state
- Empty state (if applicable)
- User interactions and their effects
- Edge cases specific to the component

### Step 3: Setup MSW Handlers

1. Import handlers from the matching SDK mocks package
2. Prefer package-level shared server setup when it already exists, such as `src/tests/server.ts`
3. Configure local servers with `onUnhandledRequest: 'error'`
4. Register default handlers in `beforeEach`
5. Use `waitForRequest(server)` when asserting network payloads or sequencing

### Step 4: Write Tests

Follow these patterns:

- Use accessible selectors and scoped queries (see `msw-patterns.md`)
- Prefer shared render helpers that create a fresh `QueryClient` for each render
- Await `userEvent` methods and use `waitFor` for observable async outcomes
- Wait for menus, dropdowns, modals, and async options to appear before interacting with nested items
- Use `findBy*` for async appearances, and re-query controls after close/reopen flows instead of reusing stale handles
- Prefer user-visible assertions or request assertions over internals such as `queryClient.isFetching()` or mock-call polling
- Keep one main behavior under test per test case
- Do not add generic retry-click helpers, click-twice fallbacks, or module-scoped mutable test state
- Do not mock Axiom, router packages, TanStack Query, or SDK query packages
- Use snapshots only when the user explicitly asks for them

### Step 5: Run and Verify

```bash
pnpm --filter @repo/<package-name> test -- <path-to-test>
```

`apps/helpdesk` uses its local Jest scripts today, extracted packages usually use local Vitest scripts, and the local package config wins when a package is an exception.

## Test Debugging Workflow

### Step 1: Understand the Error

Common error types:

- Element not found -> Check selector, timing, or render
- Act warning -> Missing await, waiting on the wrong signal, or manual timer advancement outside `act()`
- Network error -> Missing MSW handler or leaked request after teardown
- Timeout -> Async operation not completing or test is polling an internal signal instead of a user-visible outcome

### Step 2: Diagnose

See `common-failures.md` for specific solutions.

### Step 3: Fix and Verify

Run the specific test in watch mode:

```bash
pnpm --filter @repo/helpdesk test:watch -- <path>
pnpm --filter @repo/<package-name> test:watch -- <path>
```

## Reference Files

- `msw-patterns.md` - MSW handler setup and usage
- `common-failures.md` - Common test failures and solutions
- `coverage-strategy.md` - Approaching test coverage

## Quick Reference

### Vitest Package Example

```tsx
import { render, screen, waitFor } from '@repo/testing/vitest'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import { mockHandler } from '@gorgias/helpdesk-mocks'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => server.use(...handlers))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const renderComponent = (props = {}) => {
    const store = mockStore()
    return render(<ComponentName {...props} />, {
        wrapper: ({ children }) => (
            <Provider store={store}>
                <ThemeProvider>{children}</ThemeProvider>
            </Provider>
        ),
    })
}
```

### Selector Priority

1. `getByRole('button', { name: /text/i })`
2. `getByText('Text')`
3. `getByLabelText('Label')`
4. `within(section).getByRole(...)`
5. `getByTestId` - last resort only

### Async Patterns

```tsx
const { user } = renderComponent()

// Await interaction
await user.click(button)

// Wait for visible content
expect(await screen.findByText('Content')).toBeInTheDocument()

// Wait for a state transition
await waitFor(() => {
    expect(saveButton).toBeEnabled()
})

// Or wait for the request boundary
await mockUpdateThing.waitForRequest(server)(async (request) => {
    expect(await request.json()).toEqual(expectedPayload)
})
```

### QueryClient Ownership

Shared `render` and `renderHook` helpers should own `QueryClient` creation and cleanup. Consumer specs should not create, seed, poll, or clear query clients directly; drive server data through SDK MSW handlers and assert visible UI or captured requests instead.

For `apps/helpdesk`, keep the same behavior but import `render` and `renderHook` from `@repo/testing` and use `jest.*` globals instead of Vitest-specific imports or timer APIs.
