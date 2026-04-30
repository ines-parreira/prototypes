# Common Test Failures and Solutions

## Runner Mismatch Errors

### `ReferenceError: vi is not defined`

### `ReferenceError: jest is not defined`

### `Cannot resolve '@repo/testing/vitest'`

**Cause:** The test is using helpers or globals from the wrong runner for that package.

**Solutions:**

- `apps/helpdesk/**` defaults to Jest and should follow neighboring monolith helpers plus `jest.*`
- Extracted `packages/**` usually use Vitest and should follow `@repo/testing/vitest`, local render helpers, and `vi.*`
- Local `package.json`, `jest.config.*`, `vitest.config.*`, and neighboring tests override the folder heuristic when a package is an exception

## Bypassed Package Render Helper

### Missing providers, router state, bridge context, user setup, or query client setup

**Cause:** A package test imported `render` or `renderHook` directly from `@testing-library/react` instead of the package-local `tests/render.utils` helper.

**Solutions:**

- In `packages/**`, use the nearest package-local `tests/render.utils` for `render` and `renderHook` when it exists
- Keep importing `screen`, `waitFor`, `within`, `act`, and types from `@testing-library/react`
- Fall back to `@repo/testing/vitest` only when there is no package-local helper

```tsx
import { screen, waitFor } from '@testing-library/react'

import { render, renderHook } from '../../tests/render.utils'
```

## Element Not Found Errors

### "Unable to find an element with the role..."

**Causes:**

1. Element hasn't rendered yet
2. The selector is too broad or too specific
3. The element is conditionally rendered
4. The test is querying the wrong part of the tree

**Solutions:**

```tsx
// 1. Wait for async content
expect(
    await screen.findByRole('button', { name: /submit/i }),
).toBeInTheDocument()

// 2. Scope the query
const dialog = screen.getByRole('dialog', { name: /edit profile/i })
within(dialog).getByRole('button', { name: /save/i })

// 3. Check the actual role
screen.debug()

// 4. Use queryBy for conditional elements
expect(screen.queryByText('Error')).not.toBeInTheDocument()
```

### "Unable to find role menuitem" after opening a menu

**Cause:** Portal-backed menus, dropdowns, modals, and submenus often render after the trigger interaction, or render more than one menu at once.

**Solutions:**

```tsx
await user.click(screen.getByRole('button', { name: /more actions/i }))

const menu = (await screen.findAllByRole('menu')).at(-1)!
await user.click(
    await within(menu).findByRole('menuitem', { name: /assign to team/i }),
)
```

If the next action depends on async options, wait for the option or enabled state before clicking:

```tsx
await user.click(screen.getByRole('button', { name: /status/i }))
await user.click(await screen.findByRole('option', { name: /lunch break/i }))
```

If the test closes and reopens a menu, dropdown, dialog, or async select, re-query the reopened UI. Handles captured before `Escape`, click-away, or unmount/remount can be stale:

```tsx
await user.keyboard('{Escape}')
await waitFor(() => {
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
})

await user.click(await screen.findByRole('button', { name: /tags/i }))
const searchbox = await screen.findByRole('searchbox')
await user.type(searchbox, 'vip')
```

Extract a helper when multiple tests need the same opening sequence, but make it return the fresh ready element it waited for. Do not add a generic "click again if it failed" fallback.

### "Unable to find an element with the text..."

**Solutions:**

```tsx
screen.getByText(/welcome/i)

expect(await screen.findByText(expectedText)).toBeInTheDocument()

screen.getByText((_, element) => {
    return element?.textContent === 'Full text here'
})
```

## Act Warnings

### "Warning: An update to Component inside a test was not wrapped in act(...)"

**Cause:** The test usually crossed the wrong async boundary. In this repo that is most often a missing `await`, a missing wait on an observable outcome, or manual timer/state advancement that React Testing Library does not wrap for you.

**Solutions:**

```tsx
// 1. Ensure userEvent is awaited
await user.click(button)

// 2. Wait for the visible result of the interaction
await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
})

// 3. Or wait for the request boundary
await waitForRequest(async (request) => {
    expect(await request.json()).toEqual(expectedPayload)
})

// 4. If using timers, act() is still required
act(() => {
    vi.advanceTimersByTime(1000) // Use jest.advanceTimersByTime(...) in apps/helpdesk
})
```

Use `act()` only for work React Testing Library does not already wrap, such as manual timer advancement or calling a hook callback directly:

```tsx
act(() => {
    result.current.openPanel()
})
```

Do **not** default to `await act(() => user.click(button))`. React's documentation notes that Testing Library helpers are already wrapped with `act()`: <https://react.dev/reference/react/act>.

### "Warning: You seem to have overlapping act() calls"

**Cause:** Nested or overlapping `act()` calls.

**Solution:**

```tsx
// Remove the extra act() wrapper and await the interaction directly
await user.click(button)
```

## Async / Timing Issues

### "Timeout - Async callback was not invoked within the timeout"

**Causes:**

1. The API call is not mocked
2. A promise never resolves
3. The test is waiting on the wrong condition
4. The test is polling an internal signal instead of an observable outcome

**Solutions:**

```tsx
// 1. Check MSW handler registration
server.use(mockHandler.handler)

// 2. Increase timeout only after confirming the wait is correct
await waitFor(
    () => {
        expect(screen.getByText('Done')).toBeInTheDocument()
    },
    { timeout: 10000 },
)

// 3. Prefer user-visible or request assertions over internal polling
await waitFor(() => {
    expect(
        screen.getByRole('status', { name: /saved/i }),
    ).toBeInTheDocument()
})
```

### Test passes individually but fails when run with other tests

**Cause:** Shared state is leaking between tests. The main sources are usually module-scoped `QueryClient` instances, mutable fixtures, request arrays, counters, or file-local server setup that bypasses shared package helpers.

**Solutions:**

```tsx
// Prefer a render helper that owns a fresh QueryClient per render
const { result } = renderHook(() => useThing())
```

Move API state into SDK MSW handlers, remove consumer-owned query clients, and reuse the package server/render helpers so lifecycle is centralized.

## MSW Errors

### "[MSW] Cannot bypass a request when using the 'error' strategy"

**Cause:** Unhandled network request.

**Solution:**

```tsx
const mockMissingEndpoint = mockMissingEndpointHandler()
server.use(mockMissingEndpoint.handler)

server.listen({
    onUnhandledRequest: (request) => {
        console.error('Unhandled:', request.method, request.url)
    },
})
```

### Handler not intercepting requests

**Causes:**

1. Handler not added to server
2. URL mismatch
3. Method mismatch
4. Test created a file-local `setupServer()` while the package uses a shared `src/tests/server.ts`

**Solution:**

```tsx
server.events.on('request:start', ({ request }) => {
    console.log('Request:', request.method, request.url)
})
```

If the package has `src/tests/server.ts`, import that shared `server`, register file handlers with `server.use(...localHandlers)`, and reset handlers in `afterEach`.

## Browser API Shim Errors

### `document.execCommand is not a function`

### `window.prompt is not a function`

**Cause:** jsdom does not implement every browser API a package interaction may touch.

**Solution:** Add reusable browser API shims to the package test setup file when multiple tests need them.

```tsx
Object.defineProperty(document, 'execCommand', {
    configurable: true,
    writable: true,
    value: vi.fn(() => true),
})
```

Use the active runner's mock API. In `apps/helpdesk`, use `jest.fn()`. In Vitest packages, use `vi.fn()`.

## userEvent Issues

### "Unable to perform pointer interaction as the element has `pointer-events: none`"

**Solution:**

```tsx
// Usually better: wait for the control to become enabled
await waitFor(() => {
    expect(button).toBeEnabled()
})

await user.click(button)
```

### userEvent.type not working

**Solutions:**

```tsx
await user.click(input)
await user.type(input, 'text')

await user.clear(input)
await user.type(input, 'new text')

screen.debug(input)
```

## Fake Timer / Debounce Issues

### Debounce or timer test is flaky

**Cause:** Fake timers are not scoped tightly enough, `userEvent` is still using real time, or pending timers are being abandoned at teardown.

**Solution:**

```tsx
beforeEach(() => {
    vi.useFakeTimers() // Use jest.useFakeTimers() in apps/helpdesk
})

afterEach(() => {
    vi.runOnlyPendingTimers() // Use jest.runOnlyPendingTimers() in apps/helpdesk
    vi.useRealTimers() // Use jest.useRealTimers() in apps/helpdesk
})

it('submits after the debounce window', async () => {
    const user = userEvent.setup({
        advanceTimers: vi.advanceTimersByTime,
    })

    render(<DebouncedForm />)

    await user.type(
        screen.getByRole('textbox', { name: /search/i }),
        'shoe',
    )

    act(() => {
        vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
    })

    await waitFor(() => {
        expect(screen.getByText('Results')).toBeInTheDocument()
    })
})
```

Testing Library recommends `advanceTimers` and flushing pending timers before switching back to real timers: <https://testing-library.com/docs/using-fake-timers/> and <https://testing-library.com/docs/user-event/options/#advancetimers>.

## Provider Errors

### "could not find react-redux context value"

**Solution:**

```tsx
render(
    <Provider store={mockStore()}>
        <Component />
    </Provider>,
)
```

### "No QueryClient set"

**Solution:**

```tsx
render(<Component />)
```

Use the existing shared `render` or `renderHook` helper instead of importing directly from Testing Library. If the helper does not provide the required query provider, update the helper rather than wiring `QueryClientProvider` in each consumer spec.

## Debugging Tips

### Print Current DOM

```tsx
screen.debug()
screen.debug(element)
```

### Log What's Available

```tsx
screen.getAllByRole('button').forEach((button) => {
    console.log(button.textContent, button.getAttribute('aria-label'))
})
```

### Check Component State

```tsx
useEffect(() => {
    console.log('State:', { isLoading, data, error })
}, [isLoading, data, error])
```
