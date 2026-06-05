# Link

Inline navigation link with optional icon slots.

## Import

```typescript
import { Link } from '@gorgias/axiom'
```

## Props

### LinkProps

```typescript
type LinkProps = {
    size?: LinkSize // default: 'md'
    children: ReactNode
    leadingSlot?: IconName | ReactNode
    trailingSlot?: IconName | ReactNode
    isDisabled?: boolean
    href?: string
    rel?: string
    target?: string
    id?: string
    'aria-label'?: string
    onClick?: (e: MouseEvent) => void
}

type LinkSize = 'sm' | 'md'
```

## Usage

### Basic

```typescript
<Link href="https://example.com">Visit site</Link>
```

### With Icon Slots

```typescript
<Link href="https://example.com" trailingSlot="external-link">External link</Link>
<Link href="/tickets" leadingSlot="tickets">View tickets</Link>
```

### Inline in Text

```typescript
<Text size="md">
    Read our{' '}
    <Link href="/terms" size="md">terms of service</Link>
    {' '}for details.
</Text>
```

### Sizes

```typescript
<Link href="/path" size="sm">Small link</Link>
<Link href="/path" size="md">Medium link</Link>
```

## Testing Queries

```typescript
screen.getByRole('link', { name: 'Visit site' })
expect(link).toHaveAttribute('href', 'https://example.com')
container.querySelector('[data-name="link"]')
```
