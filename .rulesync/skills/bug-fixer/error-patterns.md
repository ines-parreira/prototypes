# Error Patterns

Common errors and their solutions organized by category.

## TypeScript Errors

### Property does not exist on type

**Error:**

```
Property 'foo' does not exist on type 'Bar'
```

**Causes:**

- Wrong property name (check SDK types)
- Missing type definition
- Object is narrower type than expected

**Solutions:**

```tsx
// Check the actual type definition
import { User } from '@gorgias/helpdesk-types'

// Verify property path
user.meta.profile_picture_url // not user.profilePicture

// Add optional chaining for possibly undefined
user?.settings?.theme
```

### Type 'X' is not assignable to type 'Y'

**Error:**

```
Type 'string | undefined' is not assignable to type 'string'
```

**Causes:**

- Missing null/undefined handling
- Wrong function signature
- Incorrect type assertion

**Solutions:**

```tsx
// Add null check
const value = maybeString ?? 'default'

// Use type guard
if (typeof value === 'string') {
    // value is string here
}

// Narrow with assertion (use sparingly)
const value = maybeString as string
```

### Cannot find module

**Error:**

```
Cannot find module '@gorgias/helpdesk-queries'
```

**Causes:**

- Package not installed
- Wrong import path
- Missing type definitions

**Solutions:**

```bash
# Check if installed
pnpm why @gorgias/helpdesk-queries

# Install if missing
pnpm add @gorgias/helpdesk-queries
```

---

## React Errors

### Invalid hook call

**Error:**

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**Causes:**

- Hook called conditionally
- Hook called in regular function (not component)
- Multiple React versions

**Solutions:**

```tsx
// Wrong: conditional hook
if (condition) {
    const data = useQuery() // ❌
}

// Right: call hook unconditionally
const data = useQuery()
if (condition) {
    // use data
}
```

### Maximum update depth exceeded

**Error:**

```
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect
```

**Causes:**

- Missing or wrong useEffect dependencies
- State update triggers re-render that triggers state update

**Solutions:**

```tsx
// Wrong: missing dependency causes infinite loop
useEffect(() => {
    setCount(count + 1)
}, []) // ❌ missing count

// Right: use functional update
useEffect(() => {
    setCount((prev) => prev + 1)
}, []) // ✅ no dependency needed

// Or: add proper condition
useEffect(() => {
    if (shouldUpdate) {
        setCount(count + 1)
    }
}, [count, shouldUpdate])
```

### Objects are not valid as a React child

**Error:**

```
Objects are not valid as a React child (found: object with keys {foo, bar})
```

**Causes:**

- Rendering object instead of primitive
- Rendering Date object directly
- Rendering array of objects without mapping

**Solutions:**

```tsx
// Wrong
<div>{user}</div>  // ❌ user is object

// Right
<div>{user.name}</div>  // ✅ render string property
<div>{JSON.stringify(user)}</div>  // ✅ for debugging
```

---

## Test Errors

### Unable to find element

**Error:**

```
Unable to find an element with the role "button" and name /save/i
```

**Causes:**

- Element not rendered yet (async)
- Wrong selector
- Element hidden or not in DOM

**Solutions:**

```tsx
// Add waitFor for async content
await waitFor(() => {
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
})

// Check if element exists
screen.debug() // Print DOM to console

// Try different selector
screen.getByText('Save')
screen.getByLabelText('Save button')
```

### act() warning

**Error:**

```
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Causes:**

- State update after test completes
- Missing await on async operation
- userEvent not awaited properly

**Solutions:**

```tsx
// Wrong
user.click(button) // ❌ Missing await

// Right
await user.click(button) // ✅

// For timer manipulations, act() IS still needed
act(() => {
    jest.advanceTimersByTime(1000)
    // or
    vitest.advanceTimersByTime(1000)
})
```

If, despite the fix, the warning is still present, then:

**Fix:** Wrap the user event in an act()

```typescript
// BEFORE
await user.click(button)
// AFTER
await act(() => user.click(button))
```

### Network request not handled

**Error:**

```
[MSW] Warning: intercepted a request without a matching request handler
```

**Causes:**

- Missing MSW handler
- Handler URL doesn't match request
- Handler not registered with server

**Solutions:**

```tsx
// Import handler from SDK mocks
import { mockGetUserHandler } from '@gorgias/helpdesk-mocks'

// Add to server
const handler = mockGetUserHandler()
server.use(handler.handler)

// Verify URL matches
// Check: GET /api/users/123 vs handler for /api/users/:id
```

---

## API/SDK Errors

### Query/Mutation error

**Error:**

```
Error: Request failed with status code 401
```

**Causes:**

- Authentication issue
- Wrong endpoint
- Invalid request body

**Solutions:**

```tsx
// Check error response
const { error } = useGetUser(userId)
if (error) {
    console.log(error.response?.data) // Server error message
}

// Verify authentication is set up
// Check if token is passed to client
```

### Cache not updating

**Error:**
Component shows stale data after mutation

**Causes:**

- Missing cache invalidation
- Wrong query key
- Optimistic update not applied

**Solutions:**

```tsx
// Invalidate after mutation
const queryClient = useQueryClient()

useMutation({
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] })
    },
})

// Or use optimistic update
onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['users'] })
    const previous = queryClient.getQueryData(['users'])
    queryClient.setQueryData(['users'], (old) => [...old, newData])
    return { previous }
}
```

---

## Build/Bundler Errors

### Module not found

**Error:**

```
Module not found: Can't resolve './Component'
```

**Causes:**

- File doesn't exist
- Wrong path (case sensitivity)
- Missing file extension

**Solutions:**

```bash
# Check file exists
ls -la src/components/Component.tsx

# Check import path matches exactly (case sensitive)
# Component.tsx vs component.tsx
```

### Unexpected token

**Error:**

```
SyntaxError: Unexpected token '<'
```

**Causes:**

- JSX in .js file (needs .tsx)
- Missing babel/typescript config
- Syntax error in code

**Solutions:**

- Rename .js to .tsx if using JSX
- Check for unclosed brackets/tags
- Verify tsconfig.json includes the file
