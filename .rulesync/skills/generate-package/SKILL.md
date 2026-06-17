---
name: generate-package
description: >-
    Generate a new helpdesk-web-app monorepo package under packages/{name}. Use
    when the user asks to create, scaffold, or codegen a new @repo package.
targets:
    - '*'
---

# Generate Package

Use the repository package generator instead of hand-writing package scaffolding.

## Workflow

1. Choose a lowercase kebab-case package name.
2. From the repo root, run:

```bash
pnpm platform:codegen:package <name>
```

The generator creates `packages/<name>`, runs `pnpm install`, runs the generated package `format:fix` script, and prints a success message only if those steps pass.

## Notes

- The generated package is named `@repo/<name>`.
- The script refuses to overwrite an existing package folder.
- Expected generated files are `package.json`, `tsconfig.json`, `.oxlintrc.json`, `vitest.config.ts`, and `src/index.ts`.
- After generation, review `git status` and keep the generated package plus any install-updated dependency metadata scoped to the package creation.
