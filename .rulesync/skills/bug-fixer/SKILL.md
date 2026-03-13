---
name: bug-fixer
description: >-
  Systematically debugs issues using error pattern recognition, root cause
  analysis, and verification. Use when fixing bugs, investigating errors, or
  troubleshooting failing tests.
targets:
  - '*'
---
# Bug Fixer

This skill provides a systematic approach to debugging issues in the codebase.

## When to Use

Apply this skill when the user asks to:

- Fix a bug or issue
- Investigate an error
- Troubleshoot a failing test
- Debug unexpected behavior
- Understand why something isn't working

## Debugging Workflow

### Step 1: Reproduce the Issue

Before fixing anything:

1. Understand how to reproduce the bug
2. Get the exact error message or unexpected behavior
3. Identify the affected file(s) and component(s)

### Step 2: Gather Evidence

Collect information:

- Error messages and stack traces
- Relevant code files
- Recent changes to affected areas
- Test output if applicable

### Step 3: Identify Error Pattern

Categorize the issue (see `error-patterns.md`):

- TypeScript/Type errors
- React/Component errors
- Test failures
- API/Data fetching issues
- State management issues

### Step 4: Root Cause Analysis

Follow the debugging workflow in `debugging-workflow.md`:

1. Start from the error location
2. Trace backwards through the call stack
3. Check data flow and state
4. Verify assumptions about inputs/outputs

### Step 5: Implement Fix

Apply the fix:

1. Make minimal, targeted changes
2. Don't refactor unrelated code
3. Add defensive checks if appropriate
4. Consider edge cases

### Step 6: Verify Fix

Confirm the fix works:

```bash
# For test failures
pnpm test <package-name> <path-to-test>

# For type errors
pnpm typecheck:affected

# For lint errors
pnpm lint:code:affected
```

### Step 7: Prevent Regression

Consider:

- Does this need a new test?
- Could this happen elsewhere?
- Should we add defensive coding?

## Reference Files

- `error-patterns.md` - Common error types and their solutions
- `debugging-workflow.md` - Detailed debugging process

## Quick Diagnosis

### Test Not Finding Element

→ Check selector, add `waitFor`, verify component renders

### Type Error

→ Check SDK types, verify import paths, check null handling

### API Call Failing

→ Check MSW handler, verify request format, check auth

### Component Not Rendering

→ Check conditional logic, verify data loading, check error boundaries

### State Not Updating

→ Check mutation, verify cache invalidation, check re-render triggers
