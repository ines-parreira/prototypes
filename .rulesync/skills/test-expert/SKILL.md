---
name: test-expert
description: >-
  Creates comprehensive integration tests and debugs test failures using MSW
  patterns, accessible selectors, and project conventions. Use when writing
  tests, investigating failures, or improving test coverage.
targets:
  - '*'
---
# Test Expert

This skill helps create robust integration tests and debug test failures following project conventions.

## When to Use

Apply this skill when the user asks to:

- Write tests for a component or hook
- Fix failing tests
- Debug test errors
- Improve test coverage
- Understand why a test is flaky

## Test Creation Workflow

### Step 1: Analyze the Component

Before writing tests:

1. Read the component code
2. Identify what API calls it makes
3. List user interactions (clicks, typing, etc.)
4. Identify different states (loading, error, empty, success)

### Step 2: Plan Test Cases

Create tests for:

- Initial render / loading state
- Success state with data
- Error state
- Empty state (if applicable)
- User interactions and their effects
- Edge cases specific to the component

### Step 3: Setup MSW Handlers

1. Import handlers from `@gorgias/helpdesk-mocks`
2. Configure server with `onUnhandledRequest: 'error'`
3. Set up handlers in `beforeEach`

### Step 4: Write Tests

Follow these patterns:

- Use accessible selectors (see `msw-patterns.md`)
- Await userEvent methods
- Use waitFor for async content
- One assertion focus per test

### Step 5: Run and Verify

```bash
pnpm test <package-name> <path-to-test>
```

## Test Debugging Workflow

### Step 1: Understand the Error

Common error types:

- Element not found → Check selector, timing, or render
- Act warning → Missing await or act wrapper
- Network error → Missing MSW handler
- Timeout → Async operation not completing

### Step 2: Diagnose

See `common-failures.md` for specific solutions.

### Step 3: Fix and Verify

Run the specific test in watch mode:

```bash
pnpm test <package-name> <path> --watch
```

## Reference Files

- `msw-patterns.md` - MSW handler setup and usage
- `common-failures.md` - Common test failures and solutions
- `coverage-strategy.md` - Approaching test coverage

## Quick Reference

### Test File Template

```tsx
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import { mockHandler } from '@gorgias/helpdesk-mocks'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => server.use(...handlers))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Selector Priority

1. `getByRole('button', { name: /text/i })`
2. `getByText('Text')`
3. `getByLabelText('Label')`
4. `getByTestId` - AVOID

### Async Patterns

```tsx
// Await interaction
await user.click(button)

// Wait for content
await waitFor(() => {
    expect(screen.getByText('Content')).toBeInTheDocument()
})
```
