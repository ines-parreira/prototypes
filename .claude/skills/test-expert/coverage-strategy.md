# Test Coverage Strategy

## What to Test

### High Priority (Always Test)

1. **User interactions** - What happens when users click, type, submit
2. **Data display** - Correct data renders from API responses
3. **Error states** - Error messages display correctly
4. **Loading states** - Loading indicators appear and disappear
5. **Form validation** - Invalid inputs show appropriate feedback

### Medium Priority

1. **Edge cases** - Empty states, boundary values
2. **Conditional rendering** - Different views based on user role/state
3. **Navigation** - Links and redirects work correctly

### Low Priority (Usually Skip)

1. **Styling** - Avoid testing CSS classes
2. **Implementation details** - Internal state, private methods
3. **Third-party components** - Trust them to work

## Test Case Planning

### For a Form Component

```
1. Renders form fields correctly
2. Shows validation errors on invalid input
3. Submits form with valid data
4. Shows success message after submission
5. Shows error message on API failure
6. Disables submit button while loading
```

### For a List Component

```
1. Shows loading state initially
2. Renders list items when data loads
3. Shows empty state when no items
4. Handles pagination (if applicable)
5. Filters/sorts correctly (if applicable)
6. Item actions work (delete, edit, etc.)
```

### For a Detail Page

```
1. Shows loading state
2. Displays entity details correctly
3. Handles not found (404)
4. Edit button opens edit mode
5. Delete triggers confirmation
```

## Testing User Flows

### Focus on Behavior, Not Implementation

```tsx
// ❌ WRONG - Testing implementation
expect(component.state.isSubmitting).toBe(true)
expect(mockFetch).toHaveBeenCalledWith(...)

// ✅ CORRECT - Testing behavior
expect(screen.getByRole('button')).toBeDisabled() // Loading state
await waitFor(() => {
    expect(screen.getByText('Saved!')).toBeInTheDocument() // Success
})
```

### Test the Happy Path First

```tsx
describe('UserForm', () => {
    // Happy path first
    it('should submit form successfully', async () => {
        // Setup success handler (default)
        renderComponent()

        await user.type(nameInput, 'John')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Saved!')).toBeInTheDocument()
        })
    })

    // Then error cases
    it('should show error on failure', async () => {
        // Override with error handler
        server.use(errorHandler)
        // ...
    })
})
```

## Coverage Gaps to Watch

### State Variations

```tsx
// Test different states
describe('TicketStatus', () => {
    it.each(['open', 'pending', 'closed'])(
        'should render %s status',
        (status) => {
            const { handler } = mockGetTicketHandler(async () =>
                HttpResponse.json({ ...mockData, status }),
            )
            server.use(handler)
            // Test
        },
    )
})
```

### User Roles

```tsx
describe('AdminPanel', () => {
    it('should show admin controls for admin users', async () => {
        server.use(adminUserHandler)
        // Test admin features visible
    })

    it('should hide admin controls for regular users', async () => {
        server.use(regularUserHandler)
        // Test admin features hidden
    })
})
```

### Error Boundaries

```tsx
it('should recover from error', async () => {
    // First render fails
    server.use(errorHandler)
    renderComponent()

    await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    // Retry succeeds
    server.use(successHandler)
    await user.click(screen.getByRole('button', { name: /retry/i }))

    await waitFor(() => {
        expect(screen.getByText('Content loaded')).toBeInTheDocument()
    })
})
```

## When NOT to Add Tests

1. **Simple presentational components** - Pure display, no logic
2. **Wrappers** - Components that just pass props through
3. **Third-party integrations** - Test at integration level instead
4. **Deprecated code** - If it's being removed soon

## Measuring Coverage

```bash
# Run with coverage
pnpm test <package-name> --coverage <path>

# Focus on meaningful coverage
# - Branch coverage > Line coverage
# - Critical paths fully covered
# - Error handling tested
```

## Test Maintenance

### Keep Tests Focused

```tsx
// ❌ WRONG - Testing too much
it('should render form, validate, submit, and show success', async () => {
    // 50 lines of test
})

// ✅ CORRECT - One behavior each
it('should show validation error for empty name')
it('should disable submit while loading')
it('should show success message after submit')
```

### Use Descriptive Names

```tsx
// ❌ WRONG
it('should work')
it('test button')

// ✅ CORRECT
it('should show error message when API returns 404')
it('should navigate to detail page when row is clicked')
```
