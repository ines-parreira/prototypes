# Common Test Failures and Solutions

## Element Not Found Errors

### "Unable to find an element with the role..."

**Causes:**

1. Element hasn't rendered yet (async)
2. Wrong selector
3. Element is conditionally rendered
4. Wrong element type

**Solutions:**

```tsx
// 1. Wait for async content
await waitFor(() => {
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
})

// 2. Check the actual role (use screen.debug())
screen.debug() // Prints current DOM

// 3. Use queryBy for conditional elements
const errorMessage = screen.queryByText('Error')
if (errorMessage) { ... }

// 4. Verify element type
// <div onClick> needs role="button"
// <button> has implicit button role
```

### "Unable to find an element with the text..."

**Solutions:**

```tsx
// 1. Use regex for partial match
screen.getByText(/welcome/i) // Case insensitive partial

// 2. Check for dynamic content
await waitFor(() => {
    expect(screen.getByText(expectedText)).toBeInTheDocument()
})

// 3. Text might be split across elements
screen.getByText((content, element) => {
    return element?.textContent === 'Full text here'
})
```

## Act Warnings

### "Warning: An update to Component inside a test was not wrapped in act(...)"

**Cause:** State update happened outside act() boundary.

**Solutions:**

```tsx
// 1. Ensure userEvent is awaited
await user.click(button)

// 2. Wait for async updates
await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument()
})

// 3. If using timers, act() IS required
act(() => {
    jest.advanceTimersByTime(1000)
})
```

If the warning persist then:

```tsx
// Wrap the userEvent in
await act(() => user.click(button))
```

### "Warning: You seem to have overlapping act() calls"

**Cause:** Nested or overlapping act() calls.

**Solution:**

```tsx
// ✅ CORRECT - Remove act() and just await userEvent
await user.click(button)
```

## Async/Timing Issues

### "Timeout - Async callback was not invoked within the 5000 ms timeout"

**Causes:**

1. API call not mocked
2. Promise never resolves
3. Wrong condition in waitFor

**Solutions:**

```tsx
// 1. Check MSW handler is registered
server.use(mockHandler.handler) // In beforeEach

// 2. Increase timeout for slow operations
await waitFor(
    () => {
        expect(screen.getByText('Done')).toBeInTheDocument()
    },
    { timeout: 10000 },
)

// 3. Verify condition will eventually be true
// Debug current state
console.log(screen.debug())
```

### Test passes individually but fails when run with other tests

**Cause:** Shared state not being reset.

**Solutions:**

```tsx
// 1. Reset query client
beforeEach(() => {
    queryClient.clear()
})

// 2. Reset MSW handlers
afterEach(() => {
    server.resetHandlers()
})

// 3. Clean up subscriptions
afterEach(() => {
    cleanup()
})
```

## MSW Errors

### "[MSW] Cannot bypass a request when using the 'error' strategy"

**Cause:** Unhandled network request.

**Solution:**

```tsx
// Add missing handler
const mockMissingEndpoint = mockMissingEndpointHandler()
server.use(mockMissingEndpoint.handler)

// Or check what request is being made
server.listen({
    onUnhandledRequest: (req) => {
        console.error('Unhandled:', req.method, req.url)
    },
})
```

### Handler not intercepting requests

**Causes:**

1. Handler not added to server
2. URL mismatch
3. Method mismatch

**Solution:**

```tsx
// Debug: Log all requests
server.events.on('request:start', ({ request }) => {
    console.log('Request:', request.method, request.url)
})
```

## userEvent Issues

### "Unable to perform pointer interaction as the element has `pointer-events: none`"

**Solution:**

```tsx
// Skip pointer-events check
await user.click(element, { pointerEventsCheck: 0 })

// Or fix the CSS
// Remove pointer-events: none from element
```

### userEvent.type not working

**Solutions:**

```tsx
// 1. Element must be focusable
await user.click(input) // Focus first
await user.type(input, 'text')

// 2. Clear first if needed
await user.clear(input)
await user.type(input, 'new text')

// 3. Check element is an input/textarea
screen.debug(input) // Verify element type
```

## Provider Errors

### "could not find react-redux context value"

**Solution:**

```tsx
// Wrap in Provider
render(
    <Provider store={mockStore}>
        <Component />
    </Provider>,
)
```

### "No QueryClient set, use QueryClientProvider"

**Solution:**

```tsx
// Wrap in QueryClientProvider
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
})

render(
    <QueryClientProvider client={queryClient}>
        <Component />
    </QueryClientProvider>,
)
```

## Debugging Tips

### Print Current DOM

```tsx
screen.debug() // Full DOM
screen.debug(element) // Specific element
```

### Log What's Available

```tsx
// See all buttons
screen.getAllByRole('button').forEach((btn) => {
    console.log(btn.textContent, btn.getAttribute('aria-label'))
})
```

### Check Component State

```tsx
// Add temporary logging in component
useEffect(() => {
    console.log('State:', { isLoading, data, error })
}, [isLoading, data, error])
```
