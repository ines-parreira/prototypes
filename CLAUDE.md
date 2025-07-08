# Use pnpm for package management

- **ALWAYS use pnpm** for all package management operations
- Use `pnpm install` instead of `npm install` or `yarn install`
- Use `pnpm add <package>` instead of `npm install <package>` or `yarn add <package>`
- Use `pnpm remove <package>` instead of `npm uninstall <package>` or `yarn remove <package>`
- Use `pnpm run <script>` instead of `npm run <script>` or `yarn <script>`
- Use `pnpm exec <command>` instead of `npx <command>` or `yarn exec <command>`

## Development Workflow

- When suggesting package installations, always use pnpm commands
- When running scripts or commands, prefer pnpm over other package managers
- When creating new scripts in package.json, ensure they work with pnpm
- When debugging dependency issues, use `pnpm why <package>` for dependency analysis

## Code Generation

- When generating package.json scripts, ensure compatibility with pnpm
- When suggesting dependency updates, use pnpm-specific commands
- When creating new projects or components, use pnpm for dependency management

## Best Practices

- Leverage pnpm's efficient disk space usage and fast installation
- Use pnpm's workspace features for monorepo management if applicable
- Prefer pnpm's stricter dependency resolution for better security
- Use `pnpm audit` for security audits instead of npm audit

## Error Resolution

- If encountering package manager conflicts, default to pnpm solutions
- When troubleshooting installation issues, use pnpm-specific debugging commands
- Prefer pnpm's lockfile (pnpm-lock.yaml) over package-lock.json or yarn.lock

# Use accessible selectors in tests and avoid data-testid html attribute

The preferred way to target elements in tests is to use other queries from React Testing Library:

## Priority Order:

1. **getByRole** - Best for accessibility and user behavior simulation
2. **getByText** - For text content
3. **getByLabelText** - For form inputs with labels
4. **queryByText** - For conditional text content
5. **getByPlaceholderText** - For inputs without labels
6. **getByTestId** - Only as last resort

## Examples:

```tsx
// ❌ Avoid - focuses on implementation details
const element = screen.getByTestId('submit-button')

// ✅ Prefer - focuses on user behavior
const button = screen.getByRole('button', { name: /submit/i })
const submitButton = screen.getByText('Submit')
const form = screen.getByRole('form')
```

```tsx
// ❌ Avoid - implementation-focused
<div data-testid="user-avatar">
  <img src={avatarUrl} alt="User avatar" />
</div>

// ✅ Prefer - accessibility-focused
<div>
  <img src={avatarUrl} alt="User avatar" />
</div>
// Test with: screen.getByAltText('User avatar')
```

## Implementation Guidelines

### For Component Testing:

- Use semantic HTML elements with proper roles
- Add meaningful `alt` attributes to images
- Use proper `aria-*` attributes for accessibility
- Ensure form inputs have associated labels

### For Mock Components:

- Prefer testing through props and rendered content
- Consider refactoring mocks to be more testable
