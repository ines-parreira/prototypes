---
name: feature-builder
description: >-
  Guides multi-step feature implementation with components, hooks, tests, and
  API integration following project conventions. Use when creating new features,
  components, or functionality.
targets:
  - '*'
---
# Feature Builder

This skill guides you through creating new features following the project's established patterns and conventions.

## When to Use

Apply this skill when the user asks to:

- Add a new feature or functionality
- Create a new component
- Implement a new page or section
- Build something that requires multiple files (component, hook, test)

## Workflow

### Step 1: Understand the Feature

Before writing any code:

1. Clarify the feature requirements with the user
2. Identify which domain/module this belongs to
3. Check for existing similar components to follow patterns
4. Determine what API endpoints are needed (if any)

### Step 2: Plan the Files

A typical feature includes:

- Component file: `ComponentName.tsx`
- Styles: `ComponentName.module.less` (if needed)
- Test: `ComponentName.spec.tsx` or `tests/ComponentName.spec.tsx`
- Hook: `use<FeatureName>.ts` (if data fetching needed)
- Types: Add to existing types file or create if complex

### Step 3: Implement in Order

1. **Types first** - Define interfaces/types
2. **Hook second** - Create data fetching hook using SDK patterns (see `api-patterns.md`)
3. **Component third** - Build the UI component (see `component-patterns.md`)
4. **Tests last** - Write integration tests (see `test-patterns.md`)

### Step 4: Validate

Run validation after implementation:

```bash
pnpm lint <package-name>
pnpm typecheck <package-name>
pnpm test <package-name> <path-to-test>
```

## Reference Files

- `component-patterns.md` - Component structure and styling patterns
- `api-patterns.md` - SDK integration and data fetching patterns
- `test-patterns.md` - Testing patterns with MSW

## Key Conventions

### File Location

- Helpdesk components: `apps/helpdesk/src/<domain>/components/`
- Shared hooks: `apps/helpdesk/src/<domain>/queries/`
- Pages: `apps/helpdesk/src/pages/`

### Naming

- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useUserProfile.ts`)
- Tests: Same name with `.spec.tsx` suffix

### Imports

- Use absolute imports from `@gorgias/*` packages
- Use relative imports for local files within same module

## Axiom UI Components - MANDATORY

**All UI must use `@gorgias/axiom` components.** Never create custom implementations for:

- Buttons, inputs, selects, checkboxes, toggles
- Layout containers (use `Box`)
- Typography (use `Text`, `Heading`)
- Modals, side panels, tooltips
- Loading states (use `Skeleton`)
- Error/info messages (use `Banner`)

See `component-patterns.md` for correct props and usage patterns.

## Anti-patterns to Avoid

- Don't create custom UI components - always use Axiom
- Don't create manual API calls - always use SDK hooks
- Don't add `data-testid` attributes - use accessible selectors
- Don't mix data concerns with UI concerns in hooks
- Don't add unnecessary comments - write self-documenting code
- Don't over-engineer - only build what's requested
