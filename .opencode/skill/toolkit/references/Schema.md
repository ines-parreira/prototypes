# Schema

Schema helpers provide parsing, schema-backed type guards, and ordered schema dispatch for Standard Schema-compatible validators.

The utility is schema-builder agnostic. It works with any validator library that exposes a Standard Schema-compatible schema.

## Imports

```ts
import { Schema } from '@gorgias/toolkit'
```

```ts
import * as Schema from '@gorgias/toolkit/schema'
```

## Sync Boundary

Toolkit Schema helpers are sync-only. If `~standard.validate` returns a Promise, the helper throws `TypeError`.

Use async validation at the call site instead of passing async schemas to toolkit.

## `Schema.parse`

Use `Schema.parse` when the parsed output value is needed.

It supports both schema-first forms:

```ts
Schema.parse(TicketSchema, value)
Schema.parse(TicketSchema)(value)
```

`parse` returns `{ ok: true, data }` on success and `{ ok: false, issues }` with the raw Standard Schema issues on validation failure.

Unsupported async schemas still throw `TypeError`; this is treated as invalid sync API usage, not a failed parse. Provider-thrown exceptions also remain raw thrown exceptions.

Use this API for untrusted or unknown input values. It is also the right API for schemas with transforms, defaults, or coercions because it returns the produced value.

```ts
const parseTicket = Schema.parse(TicketSchema)
const result = parseTicket(payload)

if (result.ok) {
    result.data
} else {
    result.issues
}
```

## `Schema.is`

Use `Schema.is` for schema-backed type guards.

It supports both schema-first forms:

```ts
Schema.is(TicketSchema, value)
Schema.is(TicketSchema)(value)
```

When the input is `unknown`, `Schema.is` narrows to the exact schema output.

When the input is already typed, it preserves the original value shape and intersects the schema-proven output fields.

Use this for subset checks where the original value has fields that are not in the proof schema:

```ts
const persistedChatTickets = tickets.filter(Schema.is(ChatTicketFieldsSchema))
```

Avoid `Schema.is` with transforming/defaulting schemas when the transformed value matters. Use `Schema.parse` instead.

## `Schema.match`

Use `Schema.match(value)` for ordered schema dispatch.

The first matching schema wins. By default, each `.with()` callback receives the original value narrowed by the schema output, like `Schema.is`.

Use the default mode for subset proof schemas where the original typed value has useful fields that are not part of the proof schema:

```ts
return Schema.match(ticket)
    .with(ChatTicketSchema, (ticket) => handleChat(ticket))
    .with(EmailTicketSchema, (ticket) => handleEmail(ticket))
    .otherwise(() => handleUnknown())
```

Use `Schema.match(value, { strict: true })` when handlers need the parsed schema output. This is the right mode for transforms, defaults, coercions, or intentionally stripped output:

```ts
return Schema.match(ticket, { strict: true })
    .with(NormalizedTicketSchema, (ticket) => handleNormalized(ticket))
    .otherwise(() => handleUnknown())
```

Avoid default matching with transforming/defaulting schemas when the transformed value matters. Default matching validates the schema, but the callback receives the original value.

The return type is the union of the `.with()` callback return types and the `.otherwise()` callback return type.

## Testing Notes

Use type tests for callback inference and narrowing behavior.

Use runtime tests for:

- Valid parse output
- Direct and curried `Schema.parse`
- Invalid validation errors
- Curried and data-first `Schema.is`
- First-match and later-match `Schema.match` branches
- Default `Schema.match` preserving original value shape
- Strict `Schema.match` passing parsed output
- Async schema rejection
