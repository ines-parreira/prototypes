---
name: refactor
description: >-
  Guides safe code refactoring with incremental changes, test verification, and
  migration patterns. Use when restructuring code, migrating patterns, or
  improving code quality.
targets:
  - '*'
---
# Refactor

This skill guides safe code refactoring with proper verification at each step.

## When to Use

Apply this skill when the user asks to:
- Refactor or restructure code
- Migrate from one pattern to another
- Improve code organization
- Update deprecated patterns
- Extract components or hooks

## Refactoring Principles

### 1. Safety First
- Always have tests before refactoring
- Make small, incremental changes
- Verify after each change
- Keep the code working at every step

### 2. One Thing at a Time
- Don't mix refactoring with feature changes
- Don't mix refactoring with bug fixes
- Each commit should be a single logical change

### 3. Preserve Behavior
- Tests should pass before and after
- External API should remain the same (unless intentionally changing)
- Side effects should remain identical

## Refactoring Workflow

### Step 1: Understand Current State

Before changing anything:
1. Read the code to refactor
2. Identify existing tests
3. Run tests to ensure they pass
4. Note the current behavior

### Step 2: Plan the Refactoring

Determine the approach (see `safe-patterns.md`):
- What pattern are we moving to?
- What are the intermediate steps?
- What could break?

### Step 3: Add Tests if Missing

If no tests exist:
1. Add tests for current behavior first
2. Verify tests pass
3. Now proceed with refactoring

### Step 4: Make Incremental Changes

For each change:
1. Make one small change
2. Run tests
3. If tests fail, fix or revert
4. Commit when stable

### Step 5: Clean Up

After refactoring:
1. Remove dead code
2. Update imports
3. Run validation for the affected package

```bash
pnpm lint <package>
pnpm typecheck <package>
pnpm test <package> <path-to-test>
```

## Reference Files

- `safe-patterns.md` - Safe refactoring techniques
- `migration-guides.md` - Common migration patterns (Redux → SDK, etc.)

## Quick Reference

### Extract Component
```tsx
// Before: inline JSX
<div>
    <h1>{title}</h1>
    <p>{description}</p>
</div>

// After: extracted component
<ContentHeader title={title} description={description} />
```

### Extract Hook
```tsx
// Before: logic in component
const [data, setData] = useState()
useEffect(() => { fetch()... }, [])

// After: extracted hook
const { data } = useContentData()
```

### Rename Symbol
1. Use IDE rename (F2 in VS Code)
2. Check all references updated
3. Run typecheck to verify

### Move File
1. Move file to new location
2. Update all imports
3. Run typecheck to verify
