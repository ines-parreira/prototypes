---
name: toolkit
description: >-
  Guide for using the @gorgias/toolkit utility package. Use when working with
  shared TypeScript utilities from @gorgias/toolkit, including Schema utilities,
  duration helpers, package exports, supported APIs, or usage examples.
---
# @gorgias/toolkit Guide

This skill documents the public API of `@gorgias/toolkit`.

## Package Purpose

`@gorgias/toolkit` contains low-level TypeScript utilities shared across Gorgias codebases.

Utilities in this package should be:

- Dependency-light
- Strongly typed
- Useful across multiple codebases
- Small enough to keep API behavior obvious

## Quick Start

Use the package root when several utilities are needed:

```ts
import { Duration, Schema } from '@gorgias/toolkit'
```

Use subpath imports when only one utility namespace is needed:

```ts
import * as Duration from '@gorgias/toolkit/duration'
import * as Schema from '@gorgias/toolkit/schema'
```

```ts
const retryDelay = Duration.seconds(30)
const isTicket = Schema.is(TicketSchema)
```

## Finding API Documentation

When a user asks about a specific Toolkit utility:

1. Check `references/<UtilityName>.md` first.
2. If no reference exists, read the source under `src/<utility>/`.
3. Check the package exports in `package.json` before suggesting an import path.
4. Prefer examples that use the public package API over internal source paths.

## Available References

- [Duration](references/Duration.md): Millisecond-backed duration helper functions.
- [Schema](references/Schema.md): Standard Schema-compatible parsing, type guards, and ordered matching.
- [Package exports](references/package-exports.md): Supported import paths and API boundaries.
