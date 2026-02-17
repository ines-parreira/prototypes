# Testing Patterns

Integration testing patterns using React Testing Library and MSW.

## Test Structure

### Basic Setup

```typescript
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Setup server
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

### Render Helper

```typescript
const renderComponent = (props = {}) => {
    const user = userEvent.setup()
    const queryClient = mockQueryClient()
    const store = mockStore()

    const result = render(
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <YourComponent {...props} />
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )

    return { ...result, user }
}
```

## Selectors (Priority Order)

1. **getByRole** - Best for accessibility

    ```tsx
    screen.getByRole('button', { name: /submit/i })
    screen.getByRole('textbox', { name: /email/i })
    screen.getByRole('heading', { level: 1 })
    ```

2. **getByText** - For text content

    ```tsx
    screen.getByText('Welcome')
    screen.getByText(/hello world/i)
    ```

3. **getByLabelText** - For form inputs

    ```tsx
    screen.getByLabelText('Email address')
    screen.getByLabelText(/password/i)
    ```

4. **getByPlaceholderText** - For inputs without labels

    ```tsx
    screen.getByPlaceholderText('Search...')
    ```

5. **getByTestId** - Last resort only

    ```tsx
    // ❌ Avoid
    screen.getByTestId('submit-button')
    ```

## Async Patterns

### User Interactions

Await `userEvent` methods interactions.

```typescript
const { user } = renderComponent()

// Click
await user.click(screen.getByRole('button'))

// Type
await user.type(screen.getByRole('textbox'), 'hello')

// Clear and type
await user.clear(screen.getByRole('textbox'))
await user.type(screen.getByRole('textbox'), 'new value')

// Select
await user.selectOptions(screen.getByRole('combobox'), 'option1')
```

### Waiting for Content

Use `waitFor` for async content:

```typescript
// Wait for element to appear
await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// Wait for element to disappear
await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
})

// With timeout
await waitFor(
    () => {
        expect(screen.getByText('Data')).toBeInTheDocument()
    },
    { timeout: 5000 },
)
```

## MSW Handler Patterns

### Basic Usage

```typescript
import {
    mockGetUserHandler,
    mockUpdateUserHandler,
} from '@gorgias/helpdesk-mocks'

const mockGetUser = mockGetUserHandler()
const mockUpdateUser = mockUpdateUserHandler()

const localHandlers = [mockGetUser.handler, mockUpdateUser.handler]
```

### Override for Specific Test

```typescript
it('should handle error', async () => {
    const { handler } = mockGetUserHandler(async () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 }),
    )
    server.use(handler)

    renderComponent()

    await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
})
```

### Custom Response Data

```typescript
it('should show premium user', async () => {
    const { handler } = mockGetUserHandler(async () =>
        HttpResponse.json({
            ...mockGetUser.data,
            isPremium: true,
        }),
    )
    server.use(handler)

    // ...
})
```

### Assert on Request

```typescript
const waitForRequest = mockUpdateUser.waitForRequest(server)

await user.click(screen.getByRole('button', { name: /save/i }))

await waitForRequest(async (request) => {
    const body = await request.json()
    expect(body.name).toBe('New Name')
})
```

## Common Test Patterns

### Loading State

```typescript
it('should show loading state', () => {
    renderComponent()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
})
```

### Error State

```typescript
it('should show error when API fails', async () => {
    const { handler } = mockGetDataHandler(async () =>
        HttpResponse.json({ error: 'Failed' }, { status: 500 }),
    )
    server.use(handler)

    renderComponent()

    await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
})
```

### Form Submission

```typescript
it('should submit form', async () => {
    const { user } = renderComponent()

    await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument()
    })

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'John')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
})
```

## Test Value Rules (Required)

These rules exist to prevent low-signal, redundant tests. If a test violates any rule below, delete it or rewrite it.

### One Test = One Behavior

✅ Each test must prove **one meaningful behavior** (a user-visible outcome or a critical contract like a callback payload).

❌ Avoid “padding tests” that don’t prove anything new:
- “renders successfully”
- “container is in the document”
- “rerender works”
- “buttons length > 0”
- “hook is called” without asserting an outcome

**Rule of thumb:** if a regression could happen and the test would still pass, the test is not useful.

---

### No Duplicate Tests

❌ Don't write two tests that assert the same thing with different names.

✅ If two tests share the same setup and the same key expectations, merge or delete one.

**BEFORE adding ANY test, you MUST:**
1. Read the entire existing test file
2. Search for tests that exercise the same user interaction (click, type, etc.) on the same element
3. If the interaction is already tested (even in a different scenario/context), DO NOT add it again

**Same behavior in different contexts is usually still a duplicate:**

```ts
// ❌ BAD: Toggle already tested in auto-expand scenario
describe('auto-expand', () => {
  it('allows user to collapse after auto-expansion', async () => {
    // ... setup with errors ...
    await user.click(screen.getByText('Show less'))
    expect(screen.getByText('Show more')).toBeInTheDocument()
  })
})

describe('basic toggle', () => {
  it('should collapse when clicking Show less', async () => {
    // ❌ DUPLICATE - toggle already proven above
    await user.click(screen.getByText('Show less'))
    expect(screen.getByText('Show more')).toBeInTheDocument()
  })
})
```

✅ One test proving the toggle works is enough, regardless of scenario.

---

### Test Name Must Match Assertions

✅ The test title must describe the **primary asserted outcome**.

❌ If assertions don’t match the name, fix the name or fix the assertions.

---

### Don’t Claim You Test Something Without Directly Asserting It

If the test name mentions any of the following, you must include a **direct assertion** for it:

- **Props / attributes / aria** → `toHaveAttribute`, or query by role+name that depends on the attribute
- **Order / sorting** → assert DOM order (not just presence)
- **Integration** with a dependency → assert arguments, calls, or a user-visible effect caused by it
- **Search results / fetched data** → assert results appear/are selectable, not just that a hook ran

Examples:

```ts
// ✅ aria / attribute is directly asserted
expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Tags')

// ✅ order is directly asserted
const items = screen.getAllByRole('option')
expect(items.map((x) => x.textContent)).toEqual(['A', 'B', 'C'])
```

---

### Don’t Test “Integration” When Everything Is Mocked

If a dependency is mocked, don’t claim you tested integration unless you assert:
- the dependency is called with the correct arguments, **or**
- the component changes behavior based on the dependency output.

---

### Reuse Fixtures Unless Variation Is Required

✅ Reuse existing mock fixtures by default.

✅ Only introduce new mock data when it proves a different behavior (edge case, missing fields, special decorations, etc).

---

### “Search Results” Tests Must Assert Results Usage

If testing that results from a hook/API are used:

✅ Must include a user action (typing, opening dropdown, clicking a result) and an assertion that:
- results appear in the UI, and/or
- selecting a result updates UI/calls `onChange`, and/or
- the correct request is sent (via MSW `waitForRequest`)

❌ Must not only assert rerender/call counts.

---

## Anti-Patterns

❌ **Don't use snapshots** - Use explicit assertions

```typescript
// Bad
expect(container).toMatchSnapshot()

// Good
expect(screen.getByRole('heading')).toHaveTextContent('Title')
expect(screen.getByRole('button')).toBeDisabled()
```

❌ **Don't use fireEvent** - Use userEvent instead

```typescript
// Bad
fireEvent.click(button)

// Good
await user.click(button)
```

❌ **Don't use data-testid** - Use accessible selectors

```typescript
// Bad
screen.getByTestId('submit-btn')

// Good
screen.getByRole('button', { name: /submit/i })
```

❌ **Don't create manual mocks** - Use SDK mocks

```typescript
// Good
import { mockGetUserHandler } from '@gorgias/helpdesk-mocks'

// Bad
jest.mock('../api', () => ({ getUser: jest.fn() }))
```

❌ **Don't forget to await userEvent** - Methods are async

```typescript
// Bad
user.click(button) // missing await

// Good
await user.click(button)
```

❌ **Don't test framework mechanics ("testing React")**

```ts
// Bad: proves nothing about our behavior
const { container, rerender } = renderComponent()
expect(container).toBeInTheDocument()
rerender(<YourComponent />)
expect(container).toBeInTheDocument()
```

✅ Replace with assertions that would fail on a real regression:

```ts
// Good: proves a user-visible contract
expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
```

❌ **Don't assert “presence only” when the requirement is stronger (e.g., ordering)**

```ts
// Bad: says order but checks only presence
expect(screen.getByText('A')).toBeInTheDocument()
expect(screen.getByText('B')).toBeInTheDocument()
```

✅ Assert the actual requirement:

```ts
const items = screen.getAllByRole('listitem')
expect(items.map((x) => x.textContent)).toEqual(['A', 'B'])
```
