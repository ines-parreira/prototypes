# Package Management

This project uses **pnpm** exclusively for all package management operations.

## Commands Reference

### Package Operations

| Task                     | Command                 |
| ------------------------ | ----------------------- |
| Install all dependencies | `pnpm install`          |
| Add a package            | `pnpm add <package>`    |
| Add dev dependency       | `pnpm add -D <package>` |
| Remove a package         | `pnpm remove <package>` |
| Update a package         | `pnpm update <package>` |

### Running Scripts

| Task                     | Command                                |
| ------------------------ | -------------------------------------- |
| Run a script             | `pnpm run <script>` or `pnpm <script>` |
| Run package binary       | `pnpm exec <command>`                  |
| Run in workspace package | `pnpm --filter <package> <script>`     |

### Debugging

| Task                        | Command              |
| --------------------------- | -------------------- |
| Check why package installed | `pnpm why <package>` |
| List all packages           | `pnpm list`          |
| Security audit              | `pnpm audit`         |

## Workspace Structure

This is a pnpm workspace monorepo:

```
/apps
  └── helpdesk/        # Main application (@repo/helpdesk)

/packages
  ├── agent-status     # @repo/agent-status
  ├── ai-agent         # @repo/ai-agent
  ├── customer         # @repo/customer
  ├── feature-flags    # @repo/feature-flags
  ├── forms            # @repo/forms
  ├── hooks            # @repo/hooks
  ├── logging          # @repo/logging
  ├── navigation       # @repo/navigation
  ├── reporting        # @repo/reporting
  ├── routing          # @repo/routing
  ├── testing          # @repo/testing
  ├── tickets          # @repo/tickets
  ├── types            # @repo/types
  └── utils            # @repo/utils
```

## Common Development Tasks

### Testing

Always prefer running tests for specific files being worked on:

```bash
# Specific file (PREFERRED)
pnpm test <package-name> <path-or-filename>
# e.g., pnpm test @repo/tickets TicketHeader.spec.tsx

# Specific package (when needed)
pnpm test <package-name>

# Update snapshots for specific file
pnpm test <package-name> <path> -u
```

### Linting

```bash
# All packages
pnpm lint:code:all

# Affected packages
pnpm lint:code:affected

# Specific package
pnpm lint <package-name>
```

### Formatting

```bash
# Check formatting
pnpm format:check @repo/tickets

# Fix formatting
pnpm format:fix @repo/tickets
pnpm format:fix:all
pnpm format:fix:affected
```

### Type Checking

```bash
# All packages
pnpm typecheck:all

# Affected packages
pnpm typecheck:affected

# Specific package
pnpm typecheck <package-name>
```

## Best Practices

1. **Always use pnpm** - Never npm or yarn
2. **Use workspace protocol** - Reference local packages with `workspace:*`
3. **Test specific files** - Always run tests for specific files being worked on
4. **Use pnpm catalogs** - For consistent version management
