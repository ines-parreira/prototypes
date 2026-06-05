# Heading

Typography component for rendering semantic headings (h1-h5) with consistent sizing.

## Import

```typescript
import { Heading } from '@gorgias/axiom'
```

## Props

### HeadingProps

```typescript
type HeadingProps = {
    children: ReactNode // Heading content
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' // Default: 'lg'
    overflow?: 'ellipsis' // Truncate with ellipsis
    className?: string
} & Omit<React.HTMLAttributes<HTMLHeadingElement>, 'className'>
```

## Usage

### Basic Heading

```typescript
// Default: lg size (h3)
<Heading>This is a heading</Heading>
```

### Sizes and Semantic Mapping

```typescript
// xxl -> h1
<Heading size="xxl">Extra Extra Large Heading</Heading>

// xl -> h2
<Heading size="xl">Extra Large Heading</Heading>

// lg -> h3 (default)
<Heading size="lg">Large Heading</Heading>

// md -> h4
<Heading size="md">Medium Heading</Heading>

// sm -> h5
<Heading size="sm">Small Heading</Heading>
```

### Overflow Ellipsis

```typescript
// Truncate with ellipsis when heading overflows
<Heading overflow="ellipsis">
  This is a very long heading that will be truncated
</Heading>
```

### With Additional Props

```typescript
// Custom className
<Heading size="xl" className="custom-heading">
  Custom Styled Heading
</Heading>

// With HTML attributes
<Heading size="md" id="section-title" data-section="main">
  Section Title
</Heading>
```

## Size to Element Mapping

Heading sizes map to semantic HTML heading elements:

| Size | Element | Use Case                                 |
| ---- | ------- | ---------------------------------------- |
| xxl  | h1      | Page title (use sparingly, one per page) |
| xl   | h2      | Major section headings                   |
| lg   | h3      | Section headings (default)               |
| md   | h4      | Subsection headings                      |
| sm   | h5      | Minor subsection headings                |

## Related Components

- **Text**: For body text and non-heading content
- **PageHeader**: Uses Heading size="xl" for page titles

## Testing Queries

```typescript
// Query by role and text
screen.getByRole('heading', { name: 'This is a heading' })

// Query by specific level
screen.getByRole('heading', { name: 'Large Heading', level: 3 })

// Query different levels
screen.getByRole('heading', { name: 'Extra Large', level: 2 })
screen.getByRole('heading', { name: 'Medium', level: 4 })
screen.getByRole('heading', { name: 'Small', level: 5 })

// Check classes
const heading = screen.getByRole('heading', { name: 'Test' })
expect(heading).toHaveClass('typography-heading-lg')
```
