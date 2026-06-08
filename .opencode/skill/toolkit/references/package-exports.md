# Package Exports

Toolkit intentionally exposes a small public API through package exports.

## Root Export

```ts
import { Duration, Schema } from '@gorgias/toolkit'
```

The root export groups utility namespaces. Today it exports:

- `Duration`
- `Schema`

## Subpath Exports

```ts
import * as Duration from '@gorgias/toolkit/duration'
import * as Schema from '@gorgias/toolkit/schema'
```

Use subpath exports when a consumer wants a focused utility namespace.

## API Boundary

Do not suggest importing from internal source paths such as:

```ts
import { minutes } from '@gorgias/toolkit/src/duration/duration'
```

Only package exports declared in `package.json` are supported public API.
