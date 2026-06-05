# Loader

Loading spinner or progress bar for indicating ongoing operations.

## Import

```typescript
import { Loader } from '@gorgias/axiom'
```

## Props

### LoaderProps

```typescript
type LoaderProps = {
    shape?: LoaderShape // Display shape (default: 'circular')
    size?: LoaderSize // Component size (default: 'md')
    intent?: LoaderIntent // Semantic intent (default: 'regular')
    'aria-label'?: string // Accessible label (default: 'Loading')
}

// Display shapes
type LoaderShape = 'circular' | 'linear'

// Size options (pixel dimensions)
type LoaderSize = 'sm' | 'md' | 'lg' | 'xl'
// sm: 16px, md: 24px, lg: 32px, xl: 40px

// Intent options
type LoaderIntent = 'regular' | 'ai'
```

## Usage

### Basic Spinner

```typescript
<Loader />
```

### Linear Progress Bar

```typescript
<Loader shape="linear" />
```

### AI Gradient

```typescript
<Loader intent="ai" />
<Loader shape="linear" intent="ai" />
```

### Sizes

```typescript
<Loader size="sm" />
<Loader size="md" />
<Loader size="lg" />
<Loader size="xl" />
```

### Custom Label

```typescript
<Loader aria-label="Processing request" />
```

## Testing Queries

```typescript
// Accessible query
screen.getByRole('progressbar')

// Data attribute
container.querySelector('[data-name="loader"]')

// Data attributes
expect(loader).toHaveAttribute('data-shape', 'circular')
expect(loader).toHaveAttribute('data-size', 'md')
expect(loader).toHaveAttribute('data-intent', 'regular')
```
