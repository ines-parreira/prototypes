# Image

Enhanced image component with automatic loading states and error handling.

## Import

```typescript
import { Image } from '@gorgias/axiom'
```

## Props

### ImageProps

Extends standard `img` element props (`ComponentPropsWithoutRef<'img'>`).

```typescript
type ImageProps = ComponentPropsWithoutRef<'img'> & {
    // Required
    src: string // URL of the image to display
    alt: string // Accessible description of the image
    fallback: ReactNode // Content to display if image fails to load

    // Display
    fit?: ObjectFit // How image should be sized (default: 'cover')

    // Sizing
    width?: number | string // Width of image container
    height?: number | string // Height of image container

    // Standard img props
    className?: string
    style?: CSSProperties
    // ... other img element props
}

// Object-fit options
type ObjectFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
```

## Usage

### Basic Image

```typescript
<Image
  src="https://example.com/photo.jpg"
  alt="User photo"
  fallback={<Text>Failed to load</Text>}
/>
```

### With Sizing

```typescript
// Number values (pixels)
<Image
  src="https://example.com/avatar.jpg"
  alt="Avatar"
  width={100}
  height={100}
  fallback={<Icon name="user" />}
/>

// String values
<Image
  src="https://example.com/banner.jpg"
  alt="Banner"
  width="300px"
  height="150px"
  fallback={<Text>Banner unavailable</Text>}
/>

// Percentage values
<Box width="400px" height="300px">
  <Image
    src="https://example.com/cover.jpg"
    alt="Cover"
    width="100%"
    height="100%"
    fallback={<Text>Cover unavailable</Text>}
  />
</Box>
```

### Object Fit

```typescript
// Cover (default) - fills container, may crop
<Image
  src="https://example.com/wide.jpg"
  alt="Wide image"
  width={200}
  height={200}
  fit="cover"
  fallback={<Icon name="media-image" />}
/>

// Contain - fits entirely within container
<Image
  src="https://example.com/portrait.jpg"
  alt="Portrait"
  width={200}
  height={200}
  fit="contain"
  fallback={<Icon name="media-image" />}
/>

// Fill - stretches to fill container
<Image
  src="https://example.com/logo.jpg"
  alt="Logo"
  width={300}
  height={100}
  fit="fill"
  fallback={<Icon name="media-image" />}
/>

// None - original size, may overflow
<Image
  src="https://example.com/icon.jpg"
  alt="Icon"
  width={200}
  height={200}
  fit="none"
  fallback={<Icon name="media-image" />}
/>

// Scale-down - smaller of 'none' or 'contain'
<Image
  src="https://example.com/thumbnail.jpg"
  alt="Thumbnail"
  width={200}
  height={200}
  fit="scale-down"
  fallback={<Icon name="media-image" />}
/>
```

### Custom Fallback

```typescript
// Text fallback
<Image
  src="https://example.com/missing.jpg"
  alt="Product image"
  fallback={
    <Box alignItems="center" justifyContent="center">
      <Text size="sm" color="text-tertiary">
        Image unavailable
      </Text>
    </Box>
  }
/>

// Icon fallback
<Image
  src="https://example.com/user.jpg"
  alt="User profile"
  fallback={<Icon name="user" size="lg" />}
/>

// Custom component fallback
<Image
  src="https://example.com/product.jpg"
  alt="Product"
  fallback={
    <Box flexDirection="column" alignItems="center" gap="sm" p="md">
      <Icon name="media-image" size="xl" />
      <Text size="sm">Product image not available</Text>
    </Box>
  }
/>
```

### With Custom Styles

```typescript
<Image
  src="https://example.com/avatar.jpg"
  alt="Avatar"
  width={100}
  height={100}
  className="rounded-avatar"
  fallback={<Icon name="user" />}
/>
```

## Loading Behavior

Image automatically handles three states:

1. **Loading**: Shows a loading indicator while image loads
2. **Error**: Shows fallback content if image fails to load
3. **Loaded**: Shows the actual image when successfully loaded

```typescript
// Loading state - shows spinner
<Image
  src="https://slow-server.com/image.jpg"
  alt="Loading example"
  fallback={<Text>Failed</Text>}
/>

// Error state - shows fallback
<Image
  src="https://invalid-url.com/missing.jpg"
  alt="Error example"
  fallback={<Text>Image not found</Text>}
/>

// Loaded state - shows image
<Image
  src="https://fast-server.com/image.jpg"
  alt="Success example"
  fallback={<Text>Failed</Text>}
/>
```

## Default Fallback

If no fallback is provided, Image displays a default media icon:

```typescript
<Image
  src="https://example.com/might-fail.jpg"
  alt="Image with default fallback"
  fallback={undefined}
/>
```

## Performance

Image automatically optimizes loading:

- **Lazy loading**: `loading="lazy"` defers offscreen images
- **Async decoding**: `decoding="async"` prevents blocking main thread
- These are applied automatically and cannot be overridden

## Common Patterns

### User Avatar

```typescript
function UserAvatar({ user }) {
  return (
    <Image
      src={user.avatarUrl}
      alt={user.name}
      width={40}
      height={40}
      fit="cover"
      fallback={<Avatar name={user.name} size="md" />}
    />
  )
}
```

### Product Gallery

```typescript
function ProductImage({ product }) {
  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={300}
      height={300}
      fit="contain"
      fallback={
        <Box alignItems="center" justifyContent="center" p="lg">
          <Icon name="media-image" size="xxl" />
          <Text size="sm" color="text-tertiary">
            Image not available
          </Text>
        </Box>
      }
    />
  )
}
```

### Profile Cover

```typescript
function ProfileCover({ coverUrl }) {
  return (
    <Image
      src={coverUrl}
      alt="Profile cover"
      width="100%"
      height="200px"
      fit="cover"
      fallback={
        <Box
          width="100%"
          height="200px"
          style={{ background: 'var(--color-grey-100)' }}
        />
      }
    />
  )
}
```

### Thumbnail Grid

```typescript
function ThumbnailGrid({ images }) {
  return (
    <Box flexDirection="row" gap="sm" flexWrap="wrap">
      {images.map((img) => (
        <Image
          key={img.id}
          src={img.url}
          alt={img.alt}
          width={80}
          height={80}
          fit="cover"
          fallback={<Icon name="media-image" size="md" />}
        />
      ))}
    </Box>
  )
}
```

## Related Components

- **Avatar**: For user profile images with initials fallback
- **Icon**: For vector icons and graphics
- **Box**: For layout containers

## Testing Queries

```typescript
// Loading state
const loading = screen.getByLabelText('Loading')
expect(loading).toBeInTheDocument()

// Custom fallback (when error)
screen.getByText('Image unavailable')
screen.getByText('Failed to load')

// Loaded image
const image = screen.getByRole('img', { name: 'Test image' })
expect(image).toBeInTheDocument()
expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
expect(image).toHaveAttribute('alt', 'Test image')

// Check fit class
expect(image.className).toContain('cover')
expect(image.className).toContain('contain')

// Check loading attributes
expect(image).toHaveAttribute('loading', 'lazy')
expect(image).toHaveAttribute('decoding', 'async')

// Check sizing on wrapper
const wrapper = container.querySelector('[class*="imageWrapper"]')
expect(wrapper).toHaveStyle({ width: '200px', height: '150px' })
```
