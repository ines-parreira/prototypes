# Test Quality Checklist

## Selectors

### Priority Order Compliance

| Check                                        | Status |
| -------------------------------------------- | ------ |
| Using `getByRole` as primary selector        | ⬜     |
| Using `getByText` for text content           | ⬜     |
| Using `getByLabelText` for form inputs       | ⬜     |
| NOT using `getByTestId` (unless last resort) | ⬜     |
| No `data-testid` attributes in components    | ⬜     |

### Selector Examples

```tsx
// ✅ CORRECT - Accessible selectors
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByText('Welcome back')
screen.getByLabelText('Password')

// ❌ WRONG - Implementation detail
screen.getByTestId('submit-button')
screen.getByTestId('email-input')
```

## Async Patterns

### userEvent Usage

| Check                                                                                                     | Status |
| --------------------------------------------------------------------------------------------------------- | ------ |
| All userEvent calls are awaited                                                                           | ⬜     |
| userEvent calls that still trigger "Warning: An update to Component is a test was not wrapped in act(...) | ⬜     |
| No synchronous userEvent calls                                                                            | ⬜     |

```tsx
// ✅ CORRECT
await user.click(button)
await user.type(input, 'text')

// ✅ CORRECT - Multiple interactions
await user.clear(input)
await user.type(input, 'new value')

// ❌ WRONG - Missing await
user.click(button)
```

In case of act() warnings

```tsx
// ✅ CORRECT
await act(() => user.click(button))
```

### waitFor Usage

| Check                                 | Status |
| ------------------------------------- | ------ |
| Using waitFor for async content       | ⬜     |
| Not using waitFor when act() suffices | ⬜     |
| Assertions inside waitFor callback    | ⬜     |

```tsx
// ✅ CORRECT - Wait for async content
await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// ❌ WRONG - Empty waitFor
await waitFor(() => {})
expect(screen.getByText('Loaded')).toBeInTheDocument()
```

## User Events

### userEvent vs fireEvent

| Check                                 | Status |
| ------------------------------------- | ------ |
| Using userEvent for user interactions | ⬜     |
| userEvent.setup() called in test      | ⬜     |
| NOT using fireEvent for clicks/typing | ⬜     |

```tsx
// ✅ CORRECT
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')

// ❌ WRONG
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'text' } })
```

## MSW Setup

### Server Configuration

| Check                                     | Status |
| ----------------------------------------- | ------ |
| Using setupServer()                       | ⬜     |
| `onUnhandledRequest: 'error'` in listen() | ⬜     |
| server.use() in beforeEach                | ⬜     |
| server.resetHandlers() in afterEach       | ⬜     |
| server.close() in afterAll                | ⬜     |

### Mock Handlers

| Check                                               | Status |
| --------------------------------------------------- | ------ |
| Using SDK mock handlers (`@gorgias/helpdesk-mocks`) | ⬜     |
| NOT creating manual jest.mock for API               | ⬜     |
| Handler overrides use server.use()                  | ⬜     |

```tsx
// ✅ CORRECT
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const mockGetTicket = mockGetTicketHandler()
server.use(mockGetTicket.handler)

// ❌ WRONG - Manual mock
jest.mock('@gorgias/helpdesk-client', () => ({
    getTicket: jest.fn(),
}))
```

## Test Structure

### Organization

| Check                               | Status |
| ----------------------------------- | ------ |
| Handlers defined at top of file     | ⬜     |
| Related tests grouped in describe() | ⬜     |
| Descriptive test names              | ⬜     |
| One behavior per test               | ⬜     |

### Render Helper

| Check                                                      | Status |
| ---------------------------------------------------------- | ------ |
| All providers included (Router, Redux, QueryClient, Theme) | ⬜     |
| Using shared test utilities                                | ⬜     |

## Common Violations

1. **Using getByTestId instead of getByRole**
    - Fix: Use role-based query with name matcher

2. **Missing await on userEvent calls**
    - Fix: Always `await user.click(...)` etc.

3. **fireEvent instead of userEvent**
    - Fix: Setup userEvent and use click/type methods

4. **Manual API mocks**
    - Fix: Use `@gorgias/helpdesk-mocks` handlers

5. **Missing server lifecycle hooks**
    - Fix: Add beforeAll/beforeEach/afterEach/afterAll

## Related Checklists

- [SDK Compliance](sdk-checklist.md) - Data fetching and mutation patterns
- [Axiom UI Kit](axiom-checklist.md) - Component and styling compliance
- [Accessibility](accessibility.md) - Accessible selectors and semantic HTML
