# Axiom UI Kit Checklist

## Component Usage

### Use Axiom Components

| Check | Status |
|-------|--------|
| Using axiom components instead of custom implementations | ⬜ |
| No custom button implementations (div with onClick) | ⬜ |
| No custom input implementations | ⬜ |
| No custom modal/dialog implementations | ⬜ |

### Prefer New API Over Legacy

| Check | Status |
|-------|--------|
| Using `Button` not `LegacyButton` | ⬜ |
| Using `Tooltip`/`TooltipContent` with `trigger` prop, not `LegacyTooltip` | ⬜ |
| Using `Badge` not `LegacyBadge` | ⬜ |
| Using `Icon` not `LegacyIcon` | ⬜ |

### Correct Import Pattern

```tsx
// ✅ CORRECT - New API
import { Button, Box, Heading, Text, Skeleton } from '@gorgias/axiom'

// ❌ WRONG - Legacy import
import { LegacyButton as Button } from '@gorgias/axiom'
```

## Typography

### Use Heading for Titles

| Check | Status |
|-------|--------|
| Page titles use `Heading` component | ⬜ |
| Section headers use `Heading` component | ⬜ |
| `Heading` uses `size` prop (not `level`) | ⬜ |

### Use Text for Body Content

| Check | Status |
|-------|--------|
| Body text uses `Text` component | ⬜ |
| Not using raw `<p>` or `<span>` for styled text | ⬜ |

```tsx
// ✅ CORRECT
<Heading size="lg">Page Title</Heading>
<Text>This is body text content.</Text>

// ❌ WRONG
<h1 className={styles.title}>Page Title</h1>
<p className={styles.body}>This is body text content.</p>
```

## Layout

### Use Box for Flexbox Layouts

| Check | Status |
|-------|--------|
| Flexbox layouts use `Box` component | ⬜ |
| Spacing uses design token props (gap, padding) | ⬜ |
| Not using custom div with flex styles | ⬜ |

```tsx
// ✅ CORRECT
<Box flexDirection="column" gap="md" padding="lg">
    {children}
</Box>

// ❌ WRONG
<div className={styles.container}>
    {children}
</div>
// with .container { display: flex; gap: 16px; }
```

## Design Tokens

### Use CSS Variables for Styling

| Check | Status |
|-------|--------|
| Spacing uses `var(--spacing-*)` tokens | ⬜ |
| Colors use semantic tokens (`--content-*`, `--surface-*`, `--border-*`) | ⬜ |
| Border radius uses `var(--radius-*)` tokens | ⬜ |
| No hardcoded pixel values for spacing | ⬜ |
| No hardcoded hex colors | ⬜ |

### Spacing Tokens

`--spacing-xxxxs` | `--spacing-xxxs` | `--spacing-xxs` | `--spacing-xs` | `--spacing-sm` | `--spacing-md` | `--spacing-lg`

### Color Tokens (Semantic)

**Content** (text colors):
- `--content-neutral-default` - Primary text
- `--content-neutral-secondary` - Secondary text
- `--content-inverted-default` - Text on dark backgrounds
- `--content-accent-default` - Accent/link color
- `--content-error-primary` - Error text
- `--content-warning-primary` - Warning text

**Surface** (backgrounds):
- `--surface-neutral-primary` - Primary background
- `--surface-neutral-secondary` - Secondary background
- `--surface-success-primary` - Success background
- `--surface-error-primary` - Error background
- `--surface-warning-primary` - Warning background

**Border**:
- `--border-neutral-default` - Default border color

**Elevation**:
- `--elevation-neutral-default` - Elevated surface background

```less
/* ✅ CORRECT */
.card {
    padding: var(--spacing-md);
    color: var(--content-neutral-default);
    background-color: var(--surface-neutral-primary);
    border: 1px solid var(--border-neutral-default);
    border-radius: var(--radius-xxxs);
}

.secondaryText {
    color: var(--content-neutral-secondary);
}

.errorBanner {
    background-color: var(--surface-error-primary);
    color: var(--content-inverted-default);
}

/* ❌ WRONG */
.card {
    padding: 16px;
    color: #333333;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}
```

## Common Violations

### 1. Custom Button Instead of Axiom Button

```tsx
// ❌ WRONG
<div className={styles.button} onClick={onClick}>
    Click me
</div>

// ✅ FIX
import { Button } from '@gorgias/axiom'
<Button onClick={onClick}>Click me</Button>
```

### 2. Legacy Component Import

```tsx
// ❌ WRONG
import { LegacyButton as Button } from '@gorgias/axiom'

// ✅ FIX
import { Button } from '@gorgias/axiom'
```

### 3. Raw HTML for Typography

```tsx
// ❌ WRONG
<h2 className={styles.sectionTitle}>{title}</h2>

// ✅ FIX
import { Heading } from '@gorgias/axiom'
<Heading size="md">{title}</Heading>
```

### 4. Custom Flex Container

```tsx
// ❌ WRONG
<div className={styles.flexContainer}>

// ✅ FIX
import { Box } from '@gorgias/axiom'
<Box flexDirection="row" gap="md">
```

### 5. Hardcoded Styling Values

```less
/* ❌ WRONG */
.element {
    margin: 8px;
    color: #666;
    background-color: #f5f5f5;
}

/* ✅ FIX */
.element {
    margin: var(--spacing-xs);
    color: var(--content-neutral-secondary);
    background-color: var(--surface-neutral-secondary);
}
```

## When Custom Components Are Acceptable

- Domain-specific visualizations (charts, graphs)
- Complex business logic components with no axiom equivalent
- Third-party widget integrations (Shopify, Recharge, etc.)
- Highly specialized UI that doesn't fit standard patterns

## Legacy to New API Migration Guide

When migrating Legacy components to the new API:

### Button

```tsx
// Before
import { LegacyButton as Button } from '@gorgias/axiom'
<LegacyButton variant="primary" onClick={onClick}>Save</LegacyButton>

// After
import { Button } from '@gorgias/axiom'
<Button onClick={onClick}>Save</Button>
```

### Tooltip

```tsx
// Before
import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
<Tooltip content="Help text">
    <button>Hover me</button>
</Tooltip>

// After
import { Tooltip, TooltipContent } from '@gorgias/axiom'
<Tooltip trigger={<button>Hover me</button>}>
    <TooltipContent>Help text</TooltipContent>
</Tooltip>
```

### Badge

```tsx
// Before
import { LegacyBadge as Badge } from '@gorgias/axiom'
<LegacyBadge color="green">Active</LegacyBadge>

// After
import { Badge } from '@gorgias/axiom'
<Badge variant="success">Active</Badge>
```

### Migration Steps

1. **Identify Legacy imports**: Search for `Legacy` in import statements
2. **Check new API docs**: Verify new component exists with similar functionality
3. **Update imports**: Change to new API import
4. **Adjust props**: New components may have different prop names/values
5. **Test behavior**: Verify functionality is preserved after migration

## Related Checklists

- [SDK Compliance](sdk-checklist.md) - Data fetching and mutation patterns
- [Test Quality](test-checklist.md) - Testing patterns and async handling
- [Accessibility](accessibility.md) - Accessible selectors and semantic HTML
