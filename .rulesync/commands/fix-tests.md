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

- `<test-path>` - Path to the failing test file (e.g., `src/pages/settings/teams/tests/TeamForm.spec.tsx`)

## Instructions

When the user runs this command:

1. **Determine the package** from the file path:
    - `packages/<name>/...` → package is `@repo/<name>`
    - `apps/helpdesk/...` or `src/...` → package is `@repo/helpdesk`

2. **Run the test** to see the failure:

    ```bash
    pnpm test <package> <test-path>
    # e.g., pnpm test @repo/tickets TicketHeader.spec.tsx
    ```

3. **Analyze the error** and match to common patterns:

### Common Error Patterns and Fixes

#### 1. Act Warning - State Update Not Wrapped

**Error:**

```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Fix:** Ensure userEvent calls are awaited:

```typescript
// BEFORE (broken)
user.click(button) // missing await

// AFTER (fixed)
await user.click(button)
```

If, despite the fix, the warning is still present, then:

**Fix:** Wrap the user event in an act()

```typescript
// BEFORE
await user.click(button)
// AFTER
await act(() => user.click(button))
```

#### 2. Element Not Found - Async Data

**Error:**

```
Unable to find an element with the role "button"
TestingLibraryElementError: Unable to find...
```

**Fix:** Wait for element to appear after async data loads:

```typescript
// BEFORE (broken)
const button = screen.getByRole('button', { name: /save/i })

// AFTER (fixed)
await waitFor(() => {
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
})
const button = screen.getByRole('button', { name: /save/i })
```

#### 3. Multiple Elements Found

**Error:**

```
Found multiple elements with the role "button"
```

**Fix:** Be more specific with selector:

```typescript
// BEFORE (broken)
screen.getByRole('button')

// AFTER (fixed)
screen.getByRole('button', { name: /submit/i })
// or use within() for scoping
const form = screen.getByRole('form')
within(form).getByRole('button', { name: /submit/i })
```

#### 4. Network Request Not Mocked

**Error:**

```
Error: [MSW] Detected an unhandled request: GET /api/...
```

**Fix:** Add missing mock handler:

```typescript
// Add the missing handler
import { mockGetXxxHandler } from '@gorgias/helpdesk-mocks'

const mockGetXxx = mockGetXxxHandler()
const localHandlers = [
    ...existingHandlers,
    mockGetXxx.handler, // Add missing handler
]
```

#### 5. Snapshot Mismatch

**Error:**

```
Snapshot name: `Component should render correctly 1`
- Snapshot  - 5
+ Received  + 3
```

**Fix:** Review the diff and update if intentional:

```bash
# If changes are intentional
pnpm test <package> -u
```

#### 6. Mock Not Returning Expected Data

**Error:**

```
TypeError: Cannot read properties of undefined (reading 'name')
```

**Fix:** Ensure mock returns complete data structure:

```typescript
// BEFORE (broken - missing data)
const { handler } = mockGetTeamHandler(async () =>
    HttpResponse.json({ id: 1 })
)

// AFTER (fixed - complete data)
const { handler } = mockGetTeamHandler(async () =>
    HttpResponse.json({
        ...mockGetTeam.data, // Include default data
        id: 1,
        name: 'Team Name',
    })
)
```

#### 7. Async Assertion Timing

**Error:**

```
expect(received).toBeInTheDocument()
Expected element: <div>...</div>
Received: null
```

**Fix:** Use `waitFor` for assertions on async content:

```typescript
// BEFORE (broken)
expect(screen.getByText('Success')).toBeInTheDocument()

// AFTER (fixed)
await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument()
})
```

#### 8. Query Client Not Reset

**Error:**

```
Test data from previous test leaking into current test
```

**Fix:** Ensure proper test isolation:

```typescript
// Add to beforeEach
beforeEach(() => {
    queryClient.clear() // Clear query cache between tests
})
```

#### 9. Router Context Missing

**Error:**

```
useHistory() may only be used within a <Router> component
```

**Fix:** Wrap component in MemoryRouter:

```typescript
render(
    <MemoryRouter initialEntries={['/current-path']}>
        <Component />
    </MemoryRouter>
)
```

#### 10. Redux Store Missing

**Error:**

```
could not find react-redux context value
```

**Fix:** Wrap component in Provider:

```typescript
import { Provider } from 'react-redux'
import { mockStore } from '@/tests/mockStore'

render(
    <Provider store={mockStore()}>
        <Component />
    </Provider>
)
```

4. **Apply the fix** to the test file

5. **Re-run the test** to verify:

    ```bash
    pnpm test <package> <test-path>
    ```

6. **Report result**:
    - If fixed: Show what was changed
    - If still failing: Show remaining error and suggest next steps

## Example Session

```
Running test: src/pages/settings/teams/tests/TeamForm.spec.tsx

Error found:
  Warning: An update to TeamForm inside a test was not wrapped in act(...)
  at line 45: userEvent.click(submitButton)

Applying fix:
  Changed: userEvent.click(submitButton)
  To:      await user.click(submitButton)

Re-running test...

Result: PASS
Test fixed successfully.
```
