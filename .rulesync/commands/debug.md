---
targets:
  - '*'
---
# /debug - Debug Assistant

Analyze errors and suggest fixes based on project patterns.

## Usage

```
/debug [error-message-or-file-path]
```

## Arguments

- `<error>` - Error message, stack trace, or file path with failing test

## Instructions

When the user runs this command:

### Step 1: Identify the Error Type

Categorize the error:

1. **TypeScript Error** - Type mismatches, missing properties, inference issues
2. **Test Failure** - Jest/Vitest test not passing
3. **Runtime Error** - React errors, null references, async issues
4. **Build Error** - Bundler, transpilation issues
5. **Lint Error** - ESLint, formatting issues

### Step 2: Gather Context

For the error, collect:

- Full error message and stack trace
- Relevant file contents
- Related imports and dependencies
- Recent changes (if available)

### Step 3: Diagnose Based on Error Type

#### TypeScript Errors

**Common patterns:**

| Error                                    | Likely Cause                            | Fix                                                    |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `Property 'x' does not exist`            | Missing type definition or wrong import | Check types package, verify import path                |
| `Type 'X' is not assignable to 'Y'`      | Type mismatch                           | Check function signatures, add type assertions if safe |
| `Cannot find module`                     | Missing dependency or wrong path        | Check package.json, verify import path                 |
| `Argument of type 'X' is not assignable` | Wrong parameter type                    | Check SDK types, verify API usage                      |

#### Test Failures

**Common patterns:**

| Error                    | Likely Cause                   | Fix                                  |
| ------------------------ | ------------------------------ | ------------------------------------ |
| `Unable to find element` | Wrong selector or timing       | Use accessible selector, add waitFor |
| `act() warning`          | Missing await or act wrapper   | Wrap userEvent in `await act()`      |
| `Network request failed` | Missing MSW handler            | Add handler from SDK mocks           |
| `Timeout`                | Async operation not completing | Check mock setup, increase timeout   |

#### Runtime Errors

**Common patterns:**

| Error                                  | Likely Cause                         | Fix                                       |
| -------------------------------------- | ------------------------------------ | ----------------------------------------- |
| `Cannot read property of undefined`    | Missing null check                   | Add optional chaining, check data loading |
| `Invalid hook call`                    | Hook outside component or wrong deps | Verify hook usage, check dependency array |
| `Maximum update depth exceeded`        | Infinite re-render loop              | Check useEffect dependencies              |
| `Objects are not valid as React child` | Rendering object instead of string   | Convert to string or extract property     |

#### Build Errors

**Common patterns:**

| Error              | Likely Cause                 | Fix                                    |
| ------------------ | ---------------------------- | -------------------------------------- |
| `Module not found` | Missing dependency           | Run `pnpm install`, check package.json |
| `Unexpected token` | Syntax error or wrong config | Check file syntax, verify tsconfig     |
| `Export not found` | Wrong export/import          | Check named vs default export          |

### Step 4: Suggest Fix

Provide:

1. **Root cause** - Why the error occurred
2. **Solution** - Specific code changes to make
3. **Prevention** - How to avoid this in future

**Format:**

```
## Diagnosis

**Error type:** <type>
**Root cause:** <explanation>

## Fix

**File:** `path/to/file.tsx`
**Line:** <line number if known>

<code block with fix>

## Explanation

<Why this fixes the issue>

## Prevention

<How to avoid this in future>
```

### Step 5: Verify Fix

After applying fix:

```bash
# For TypeScript errors
pnpm typecheck <package>

# For test failures
pnpm test <package> <path-to-test>

# For lint errors
pnpm lint <package>
```

## Quick Reference: Test Debugging

### Element Not Found

```tsx
// Problem: getByRole finds nothing
screen.getByRole('button', { name: /save/i })

// Solution: Wait for async content
await waitFor(() => {
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
})
```

### Act Warning

```tsx
// Problem: Missing await on userEvent
user.click(button)

// Solution: Await userEvent
await user.click(button)
```

### MSW Handler Missing

```tsx
// Problem: Network request fails
// Error: "Request to /api/users was not handled"
// Solution: Add handler
import { mockGetUsersHandler } from '@gorgias/helpdesk-mocks'

server.use(mockGetUsersHandler().handler)
```

## Quick Reference: TypeScript

### Missing Property

```tsx
// Error: Property 'profilePicture' does not exist
// Solution: Check correct property name in types
import { User } from '@gorgias/helpdesk-types'

// Problem: Property doesn't exist
user.profilePicture // Error: Property 'profilePicture' does not exist

// Look at User type definition
user.meta.profile_picture_url // Correct path
```

### Type Assertion

```tsx
// Use sparingly when you know more than TypeScript
const response = data as ExpectedType

// Better: Use type guards
function isExpectedType(data: unknown): data is ExpectedType {
    return typeof data === 'object' && data !== null && 'requiredProp' in data
}
```
