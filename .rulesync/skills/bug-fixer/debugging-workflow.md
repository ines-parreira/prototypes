# Debugging Workflow

A systematic approach to finding and fixing bugs.

## The Process

### 1. Understand the Bug

Before touching code:

- What is the expected behavior?
- What is the actual behavior?
- Can you reproduce it consistently?
- When did it start happening?

### 2. Isolate the Problem

Narrow down the scope:

- Which component/file is affected?
- Does it happen in tests or only in browser?
- Does it happen with specific data?
- Does it happen after a specific action?

### 3. Read the Error

Parse the error message:

```
TypeError: Cannot read property 'name' of undefined
    at UserProfile (src/components/UserProfile.tsx:23:15)
    at renderWithHooks (react-dom.js:1234)
```

Extract:

- Error type: `TypeError`
- What failed: reading `name` of `undefined`
- Where: `UserProfile.tsx` line 23
- Call stack: trace back to source

### 4. Form a Hypothesis

Based on the error, hypothesize:

- "The user object is undefined when we try to read name"
- "This happens because the query hasn't loaded yet"
- "We need to add a loading check"

### 5. Verify the Hypothesis

Add logging or debugging:

```tsx
// Temporary debugging
console.log('user:', user)
console.log('isLoading:', isLoading)

// Or use debugger
debugger // Will pause in browser DevTools
```

### 6. Implement the Fix

Make minimal changes:

```tsx
// Before
<div>{user.name}</div>

// After - add loading check
if (isLoading) return <Skeleton />
if (!user) return <ErrorState />
return <div>{user.name}</div>
```

### 7. Verify the Fix

Run relevant tests:

```bash
pnpm test <package-name> <path-to-test>
```

Check in browser if applicable.

### 8. Clean Up

Remove debugging code:

- Delete console.logs
- Remove debugger statements
- Remove commented code

---

## Debugging by Error Type

### Test Failures

1. Run single test in isolation

    ```bash
    pnpm test <package-name> <path> -t "test name"
    ```

2. Add `screen.debug()` to see DOM state

    ```tsx
    it('should show button', () => {
        render(<Component />)
        screen.debug() // Prints current DOM
    })
    ```

3. Check if async - add waitFor

    ```tsx
    await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
    })
    ```

4. Verify MSW handlers are set up
    ```tsx
    beforeEach(() => {
        server.use(...handlers)
    })
    ```

### TypeScript Errors

1. Hover over the error in IDE to see full message
2. Check the type definition
    ```tsx
    // Cmd+Click on type to see definition
    const user: User = ...
    ```
3. Verify import is from correct package
4. Check for null/undefined handling

### Runtime Errors

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use Network tab to see API requests
4. Use React DevTools to inspect component state
5. Add breakpoints in Sources tab

### API Errors

1. Check Network tab for request details
2. Verify request URL, method, body
3. Check response status and body
4. Compare with SDK type definitions
5. Test endpoint directly with curl/Postman

---

## Common Debugging Patterns

### The "Works in Isolation" Bug

Symptom: Test passes alone but fails with others

Cause: Shared state between tests

Fix:

```tsx
afterEach(() => {
    server.resetHandlers() // Reset MSW
    queryClient.clear() // Clear React Query cache
})
```

### The "Flaky Test" Bug

Symptom: Test passes sometimes, fails sometimes

Causes:

- Race conditions
- Time-dependent logic
- External dependencies

Fix:

```tsx
// Add proper waits
await waitFor(
    () => {
        expect(element).toBeInTheDocument()
    },
    { timeout: 5000 },
)

// Mock time if needed
jest.useFakeTimers()
```

### The "Works Locally" Bug

Symptom: Works on your machine, fails in CI

Causes:

- Environment differences
- Missing dependencies
- Timing issues (CI is slower)

Fix:

- Check CI logs carefully
- Match local environment to CI
- Add longer timeouts if needed

### The "Undefined is Not a Function" Bug

Symptom: Calling something that doesn't exist

Causes:

- Import failed silently
- Export name mismatch
- Module not found

Fix:

```tsx
// Check import
import { useGetUser } from '@gorgias/helpdesk-queries'

console.log(useGetUser) // Should be a function

// Check export in source
export { useGetUser } // Named export
export default useGetUser // Default export
```

---

## When You're Stuck

1. **Take a break** - Fresh eyes help
2. **Explain it** - Rubber duck debugging
3. **Search the codebase** - Someone may have solved similar issue
4. **Check recent changes** - `git log -p <file>`
5. **Simplify** - Remove code until it works, then add back
6. **Ask for help** - Describe what you tried
