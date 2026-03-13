---
name: code-reviewer
description: >-
  Reviews code for compliance with project conventions including SDK usage,
  axiom UI components, accessible selectors, testing patterns, and comment
  hygiene. Use when reviewing code changes or checking if code follows best
  practices.
targets:
  - '*'
---
# Code Reviewer

This skill reviews code against the project's established conventions and provides actionable feedback.

## When to Use

Apply this skill when the user asks to:

- Review code or a pull request
- Check if code follows best practices
- Validate implementation approach
- Get feedback on code quality

## Review Process

### Step 1: Identify Code to Review

- Ask user to specify files or code blocks if not clear
- For PRs, identify changed files

### Step 2: Apply Checklists

Review code against these checklists in order:

1. **SDK Compliance** (see `sdk-checklist.md`)
    - Using SDK hooks instead of direct API calls
    - Proper separation of data and UI concerns
    - Correct cache management patterns

2. **Axiom UI Kit** (see `axiom-checklist.md`)
    - Using axiom components instead of custom implementations
    - Preferring new API over Legacy components
    - Using design tokens for styling

3. **Test Quality** (see `test-checklist.md`)
    - Using accessible selectors
    - Proper async patterns with act/waitFor
    - MSW mock setup

4. **Accessibility** (see `accessibility.md`)
    - Semantic HTML elements
    - ARIA attributes where needed
    - Testable without data-testid

5. **General Quality**
    - No unnecessary comments
    - Self-documenting code
    - Proper TypeScript types
    - No over-engineering

### Step 3: Provide Feedback

Format feedback as:

````
## Review Summary

### Issues Found
- [CRITICAL] Description of critical issue
- [WARNING] Description of warning
- [SUGGESTION] Suggestion for improvement

### Specific Feedback

**File: path/to/file.tsx**
- Line X: Issue description
  ```tsx
  // Current code
````

```tsx
// Suggested fix
```

```

## Severity Levels

- **CRITICAL**: Must fix (security, data fetching anti-patterns, breaking bugs)
- **WARNING**: Should fix (convention violations, test anti-patterns)
- **SUGGESTION**: Nice to have (style improvements, minor optimizations)

## Reference Files

- `sdk-checklist.md` - SDK usage compliance
- `axiom-checklist.md` - Axiom UI kit compliance
- `test-checklist.md` - Testing best practices
- `accessibility.md` - Accessible selector guidelines

## Quick Checks

### SDK Usage
- No `fetch()` or `axios` calls in components
- No Redux for server state
- Mutations have proper cache invalidation
- UI concerns handled in components, not hooks

### Axiom UI Kit
- Using `Button`, `Box`, `Heading`, `Text` from axiom
- No Legacy imports (`LegacyButton`, `LegacyTooltip`) in new code
- Design tokens for colors (`--content-*`, `--surface-*`, `--border-*`)
- Design tokens for spacing (`--spacing-*`)

### Tests
- Using `getByRole` over `getByTestId`
- `await` on all userEvent calls
- MSW handlers from SDK mocks package
- No manual API mocks

### Code Quality
- No obvious/redundant comments
- Clear variable and function names
- Proper TypeScript types (no `any`)
- Appropriate error handling
```
