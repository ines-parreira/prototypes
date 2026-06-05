# DateRangeField

Date range picker form field with calendar, presets, and timezone support.

## Import

```typescript
import { DateRangeField } from '@gorgias/axiom'
import type { RangeValue } from '@gorgias/axiom'
import { ZonedDateTime, fromDate } from '@internationalized/date'
```

## Props

### DateRangeFieldProps

Extends `FieldProps<RangeValue<ZonedDateTime> | null>`.

```typescript
type DateRangeFieldProps = {
    // Value (from FieldProps)
    value?: RangeValue<ZonedDateTime> | null
    onChange?: (value: RangeValue<ZonedDateTime> | null, source: DateRangePickerChangeEventSource) => void

    // Field (from FieldProps)
    label?: string
    caption?: string
    error?: string
    isRequired?: boolean
    isDisabled?: boolean
    isInvalid?: boolean

    // Date-specific
    timeZone?: string // default: local
    placement?: DatePickerPlacement // default: 'top'
    shouldFlip?: boolean // default: true
    isDateUnavailable?: (date: DateValue) => boolean
    presets?: DatePickerPresetTemplate | DatePickerPreset[] | ((props: DateRangePickerPresetsRenderProps) => ReactNode)
    defaultOpen?: boolean
}

type RangeValue<T> = { start: T; end: T }
type DateRangePickerChangeEventSource = 'input' | 'calendar'
```

## Usage

### Basic

```typescript
const [range, setRange] = useState<RangeValue<ZonedDateTime> | null>(null)

<DateRangeField
    label="Date range"
    value={range}
    onChange={setRange}
/>
```

### With Presets

```typescript
<DateRangeField
    label="Date range"
    presets="past-week"
    value={range}
    onChange={setRange}
/>
```

### With Validation

```typescript
<DateRangeField
    label="Date range"
    isRequired
    error="This field is required."
    value={range}
    onChange={setRange}
/>
```

### With Unavailable Dates

```typescript
<DateRangeField
    label="Future dates only"
    isDateUnavailable={(date) => date.toDate('UTC') < new Date()}
    value={range}
    onChange={setRange}
/>
```

## Testing Queries

```typescript
screen.getByLabelText('Date range')
```
