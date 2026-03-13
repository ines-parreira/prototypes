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

- `<path>` - Path to a test file or directory containing tests (e.g., `src/pages/settings/`)

## Instructions

When the user runs this command:

1. **Find test files** in the specified path:
    - Look for files matching `*.spec.tsx`, `*.spec.ts`, `*.test.tsx`, `*.test.ts`,

2. **Review each test file** for the following issues:

### Selector Priority (High Priority)

Check that selectors follow accessibility priority order:

1. `getByRole` - Best for accessibility
2. `getByText` - For text content
3. `getByLabelText` - For form inputs
4. `queryByText` - For conditional content
5. `getByPlaceholderText` - For inputs without labels
6. `getByTestId` - AVOID - only as last resort

**Flag as issue:**

```typescript
// BAD - using data-testid
screen.getByTestId('submit-button')
getByTestId('user-name')
```

**Suggest instead:**

```typescript
// GOOD - using accessible selectors
screen.getByRole('button', { name: /submit/i })
screen.getByText('User Name')
```

### Async Patterns (High Priority)

Check for proper async handling:

**Flag as issue:**

```typescript
// BAD - userEvent not awaited
userEvent.click(button)
user.click(button) // Missing await
fireEvent.click(button)
```

**Suggest instead:**

```typescript
// GOOD
await user.click(button)
await user.type(input, 'text')
```

### Mock Usage (Medium Priority)

Check for proper mock usage:

**Flag as issue:**

```typescript
// BAD - manual API mocks
jest.mock('../api', () => ({ fetchData: jest.fn() }))
const mockFetch = jest.fn()
```

**Suggest instead:**

```typescript
// GOOD - use SDK mocks
import { mockGetTicketHandler } from '@gorgias/helpdesk-mocks'

const mockGetTicket = mockGetTicketHandler()
server.use(mockGetTicket.handler)
```

### User Interaction Testing (Medium Priority)

Check for proper user interaction simulation:

**Flag as issue:**

```typescript
// BAD - using fireEvent for user interactions
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'text' } })
```

**Suggest instead:**

```typescript
// GOOD
await user.click(button)
await user.type(input, 'text')
```

### MSW Server Setup (Low Priority)

Check for proper server lifecycle:

**Expected pattern:**

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

3. **Generate report** with:
    - List of issues found, grouped by severity
    - File path and line number for each issue
    - Suggested fix for each issue
    - Summary count of issues by type

## Example Output

```
Test Review: src/pages/settings/teams/tests/TeamForm.spec.tsx
=============================================================

HIGH PRIORITY ISSUES:

1. Line 45: Using data-testid selector
   Found: getByTestId('team-name-input')
   Suggest: getByRole('textbox', { name: /team name/i })

2. Line 67: userEvent not awaited
   Found: user.click(submitButton)
   Suggest: await user.click(submitButton)

MEDIUM PRIORITY ISSUES:

3. Line 23: Using fireEvent instead of userEvent
   Found: fireEvent.change(input, { target: { value: 'New Team' } })
   Suggest: await user.type(input, 'New Team')

Summary: 2 high, 1 medium, 0 low priority issues found
```
