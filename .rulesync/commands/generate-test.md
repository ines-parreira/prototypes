---
targets:
  - '*'
---
# /generate-test - Component/Hook Test Generator

Generate integration tests following project patterns and CLAUDE.md guidelines.

## Usage

```
/generate-test <file-path>
```

## Arguments

- `<file-path>` - Path to the component or hook to test (e.g. `src/pages/settings/teams/TeamForm.tsx`)

## Instructions

When the user runs this command:

1. **Read the target file** to understand:
   - Component or hook structure
   - Props and types
   - API calls
   - User interactions
   - State management

2. **Read neighboring tests and shared helpers before generating anything**:
   - Confirm the active runner from the target path, local `package.json`, local `jest.config.*` or `vitest.config.*`, and neighboring tests
   - `apps/helpdesk/**` defaults to Jest and should import `render` and `renderHook` from `@repo/testing` with `jest.*`
   - Extracted `packages/**` usually use Vitest and should follow `@repo/testing/vitest`, package-local `tests/render.utils`, and `vi.*`
   - In `apps/helpdesk/**`, do not import `render` or `renderHook` from `@testing-library/react`. Test-local setup helpers may wrap `@repo/testing` `render` or `renderHook` when needed.
   - In `packages/**`, import `render` and `renderHook` from the nearest package-local `tests/render.utils` when it exists. Do not import those helpers directly from `@testing-library/react` when a local helper is available.
   - Reuse existing package `setup.ts` and `server.ts` patterns when present
   - Reuse package-level `src/tests/server.ts` MSW setup when present instead of creating a new `setupServer()` in every file
   - Put reusable jsdom browser API shims in package `src/tests/setup.ts`, not in every individual spec
   - Do **not** invent a shared module-scoped `QueryClient` template if the package already has a safer helper
   - Do **not** mock `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` packages. Use shared render helpers for providers/router/query setup and SDK MSW handlers for server data.

3. **Identify SDK hooks used** to determine which mocks are needed:
   - `@gorgias/helpdesk-queries` hooks -> `@gorgias/helpdesk-mocks`
   - `@gorgias/knowledge-service-queries` hooks -> `@gorgias/knowledge-service-mocks`
   - `@gorgias/help-center-queries` hooks -> `@gorgias/help-center-mocks`
   - `@gorgias/convert-queries` hooks -> `@gorgias/convert-mocks`
   - `@gorgias/ecommerce-storage-queries` hooks -> `@gorgias/ecommerce-storage-mocks`
   - `@gorgias/customer-segmentation-queries` hooks -> `@gorgias/customer-segmentation-mocks`

4. **Generate the test file** with the safer defaults reflected in the current shared test helpers, the [React `act` docs](https://react.dev/reference/react/act), Testing Library's [guiding principles](https://testing-library.com/docs/guiding-principles/), [fake timers guide](https://testing-library.com/docs/using-fake-timers/), [`advanceTimers` option](https://testing-library.com/docs/user-event/options/#advancetimers), and the [TanStack Query testing guide](https://tanstack.com/query/v4/docs/framework/react/guides/testing).

### Vitest Package Example

```typescript
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@repo/testing/vitest'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'

import { ThemeProvider } from '@gorgias/axiom'
import { mockGetXxxHandler, mockUpdateXxxHandler } from '@gorgias/helpdesk-mocks'

import { ComponentName } from './ComponentName'

import { mockStore } from '@/tests/mockStore'

const mockGetXxx = mockGetXxxHandler()
const mockUpdateXxx = mockUpdateXxxHandler()

const localHandlers = [mockGetXxx.handler, mockUpdateXxx.handler]

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

describe('ComponentName', () => {
    it('renders with initial data', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /expected title/i }),
            ).toBeInTheDocument()
        })
    })

    it('handles form submission', async () => {
        const { user } = renderComponent()
        const waitForRequest = mockUpdateXxx.waitForRequest(server)

        await user.clear(screen.getByRole('textbox', { name: /name/i }))
        await user.type(
            screen.getByRole('textbox', { name: /name/i }),
            'New Value',
        )
        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.name).toBe('New Value')
        })

        await waitFor(() => {
            expect(
                screen.getByText(/saved successfully/i),
            ).toBeInTheDocument()
        })
    })

    it('shows the error state', async () => {
        const { handler } = mockGetXxxHandler(async () =>
            HttpResponse.json({ error: 'Failed' }, { status: 500 }),
        )
        server.use(handler)

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument()
        })
    })
})
```

For `apps/helpdesk`, keep the same behavior but import `render` and `renderHook` from `@repo/testing` and use `jest.*` globals instead of Vitest-specific ones.

### Key Patterns to Follow

1. **No snapshots** - Never use `toMatchSnapshot()` or `toMatchInlineSnapshot()`. Always use explicit assertions.

2. **Accessible selectors** - Use `getByRole`, `getByText`, `getByLabelText`, and `within(...)` before falling back to `getByTestId`.

3. **Shared render helpers first** - Prefer the helper that matches the active runner. In `apps/helpdesk`, import `render` and `renderHook` from `@repo/testing`. In extracted packages, use the nearest package-local `tests/render.utils` `render` or `renderHook` when it exists, then fall back to `@repo/testing/vitest`. Keep `screen`, `waitFor`, `within`, and `act` imports from Testing Library. Shared helpers should own a fresh `QueryClient` per render by default.

4. **User interactions** - Always await `userEvent` methods.

   ```typescript
   await user.click(button)
   await user.type(input, 'text')
   ```

5. **Do not wrap `userEvent` in `act()` as a fallback** - If you see an `act()` warning, first wait for a visible outcome or a `waitForRequest(server)` assertion. Use `act()` only for timer advancement or manual state transitions that Testing Library does not already wrap.

   ```typescript
   act(() => {
       vi.advanceTimersByTime(300) // Use jest.advanceTimersByTime(...) in apps/helpdesk
   })
   ```

6. **Async data** - Prefer `findBy*` when waiting for an element, option, dialog, or list to appear. Use `waitFor()` for state transitions, disappearance, callback assertions, request sequencing, or enabled/disabled changes.

7. **Request assertions** - Prefer `waitForRequest(server)` when the network boundary is the behavior under test.

8. **Portal and async controls** - For menus, dropdowns, modals, submenus, and async option lists, wait for the opened UI before interacting with nested items. Use `findByRole`, scoped `within(menu).findByRole(...)`, and `toBeEnabled()` waits when a control becomes interactive after async work.

9. **Close/reopen flows need fresh handles** - If a test closes a dropdown, dialog, menu, or async select and opens it again, query the trigger and opened content again after the close. Do not reuse searchboxes, options, or menu handles captured before the unmount.

10. **Ready opener helpers beat retries** - Reusable helpers may check `aria-expanded`, click only when closed, and return a fresh element from `findByRole`. Do not create generic retry-click or click-twice helpers.

11. **Fake timers only when necessary** - For debounce or timer-driven tests, use the active runner's scoped fake timers plus `userEvent.setup({ advanceTimers })`, and flush pending timers before restoring real timers. In `apps/helpdesk`, use `jest.*`. In extracted packages, use `vi.*`.

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
   ```

12. **Mock overrides** - Override handlers per test with `server.use(handler)`.

13. **Do not mock core providers or query hooks** - Never mock `@gorgias/axiom`, `react-router`, `react-router-dom`, `@tanstack/react-query`, or `@gorgias/*-queries` packages. This bypasses the behavior the integration test should exercise. Add the missing provider/router state through the render helper and mock API responses with the corresponding `@gorgias/*-mocks` package instead.

14. **Place the test file appropriately**:
    - For components: same directory as component or in `tests/`
    - File name: `ComponentName.spec.tsx` or `ComponentName.test.tsx`

15. **Review for flaky smells before finishing**:
    - No waits on `queryClient.isFetching()` or mock-call polling when a UI or request assertion would work
    - No stale portal handles reused after close/reopen flows
    - No generic retry-click helpers or click-twice patterns
    - No index-based selectors when role/name or `within(...)` queries are available
    - No module-scoped mutable test state unless the cleanup is explicit and intentional

## Important: No Snapshot Testing

This project does not use snapshot testing. Always use explicit assertions:

```typescript
expect(screen.getByRole('heading')).toHaveTextContent('Welcome')
expect(screen.getByRole('button')).toBeDisabled()
expect(screen.getByRole('list').children).toHaveLength(3)
```
