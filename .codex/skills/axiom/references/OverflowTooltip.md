# OverflowTooltip

Automatically shows a tooltip with the full text when content is truncated.

## Import

```typescript
import { OverflowTooltip } from '@gorgias/axiom'
```

## Props

### OverflowTooltipProps

```typescript
type OverflowTooltipProps = {
    children: ReactElement
    delay?: number // default: 300
    closeDelay?: number // default: 300
    placement?: Placement // default: 'top'
}
```

## Usage

### Basic

```typescript
<OverflowTooltip>
    <Text overflow="ellipsis">Very long text that might get truncated...</Text>
</OverflowTooltip>
```

### With Heading

```typescript
<OverflowTooltip>
    <Heading overflow="ellipsis">Very long heading that overflows</Heading>
</OverflowTooltip>
```

### Custom Placement

```typescript
<OverflowTooltip placement="bottom">
    <Text overflow="ellipsis">Long text with tooltip below</Text>
</OverflowTooltip>
```

### In Constrained Container

```typescript
<Box w={150}>
    <OverflowTooltip>
        <Text overflow="ellipsis">Content truncated in narrow container</Text>
    </OverflowTooltip>
</Box>
```

## Testing Queries

```typescript
container.querySelector('[data-name="overflow-tooltip-trigger"]')
```
