# Duration

Duration helpers convert human-readable units into finite millisecond numbers.

Use them when an API expects milliseconds but the call site is clearer with a larger unit.

## Imports

```ts
import { Duration } from '@gorgias/toolkit'
```

```ts
import * as Duration from '@gorgias/toolkit/duration'
```

## API

```ts
Duration.millis(value: number): number
Duration.seconds(value: number): number
Duration.minutes(value: number): number
Duration.hours(value: number): number
Duration.days(value: number): number
Duration.weeks(value: number): number
```

## Behavior

- All helpers return a number in milliseconds.
- `millis(value)` returns the same finite value.
- Larger units multiply by fixed millisecond factors.
- Decimal values are supported.
- Negative values are preserved.
- `NaN`, `Infinity`, and `-Infinity` throw an error.

## Examples

```ts
setTimeout(refreshSession, Duration.minutes(5))
```

```ts
const staleAfter = Duration.hours(1.5)
```

```ts
const retryDelay = Duration.seconds(30)
```

## Supported Units

| Helper | Millisecond factor |
| --- | ---: |
| `millis` | `1` |
| `seconds` | `1_000` |
| `minutes` | `60_000` |
| `hours` | `3_600_000` |
| `days` | `86_400_000` |
| `weeks` | `604_800_000` |

## Testing Notes

Use exact equality for deterministic conversions:

```ts
expect(Duration.minutes(2)).toBe(120_000)
```

Use throwing assertions for non-finite input:

```ts
expect(() => Duration.hours(Infinity)).toThrow()
```
