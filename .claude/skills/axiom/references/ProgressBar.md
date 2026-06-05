# ProgressBar

Horizontal progress indicator for displaying task completion.

## Import

```typescript
import { ProgressBar } from '@gorgias/axiom'
```

## Props

### ProgressBarProps

Extends React Aria's `ProgressBar` props.

```typescript
type ProgressBarProps = {
    size?: ProgressBarSize // default: 'xs'
    value?: number // Current progress
    minValue?: number // default: 0
    maxValue?: number // default: 100
    'aria-label'?: string
}

type ProgressBarSize = 'xs' | 'sm'
```

## Usage

### Basic

```typescript
<ProgressBar value={50} />
```

### With Label

```typescript
<ProgressBar value={75} aria-label="File upload progress" />
```

### Size Variants

```typescript
<ProgressBar size="xs" value={42} />
<ProgressBar size="sm" value={42} />
```

## Testing Queries

```typescript
screen.getByRole('progressbar')
screen.getByRole('progressbar', { name: 'File upload progress' })
expect(progressBar).toHaveAttribute('aria-valuenow', '50')
```
