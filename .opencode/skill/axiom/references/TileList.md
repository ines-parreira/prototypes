# TileList

Accessible grid or stack of selectable tile items. Built on React Aria GridList.

## Import

```typescript
import { TileList, TileListItem, TileHeader, TileContent } from '@gorgias/axiom'
```

## TileList Props

```typescript
type TileListProps<T extends object> = {
    items: Iterable<T>
    children: (item: T) => ReactNode
    layout?: 'grid' | 'stack'          // default: 'grid'
    selectionMode?: 'single' | 'multiple'
    selectionBehavior?: 'replace' | 'toggle'  // default: 'toggle'
    selectedKeys?: Selection           // controlled
    defaultSelectedKeys?: Selection    // uncontrolled
    onSelectionChange?: (keys: Selection) => void
    onAction?: (key: Key) => void      // triggered on Enter/click (no selectionMode needed)
    renderEmptyState?: () => ReactNode
    disallowEmptySelection?: boolean
    onLoadMore?: () => void              // called when user scrolls near the bottom
    'aria-label'?: string
    'aria-labelledby'?: string
}
```

## TileListItem Props

`TileListItemProps` is a discriminated union on `as`, mirroring `TileProps`:

```typescript
// Default — static div (no as prop)
type TileListItemProps = {
    id: string | number
    textValue: string              // accessibility label for typeahead
    isDisabled?: boolean
    children: ReactNode | ((props: TileListItemRenderProps) => ReactNode)
    onFocusChange?: (isFocused: boolean) => void
    type?: 'no-border' | 'bottom-border' | 'full-border'  // Tile border style
    as?: 'button'
    onClick?: () => void
    // ...all Box layout props
}

// Link variant — renders an <a> via React Aria Link
type TileListItemProps = {
    // ...same base props...
    as: 'link'
    href: string
    routerOptions?: RouterOptions  // forwarded to AxiomProvider navigate
    rel?: string
    target?: string
}

// Custom component variant
type TileListItemProps = {
    // ...same base props...
    as: ComponentType
    [key: string]: unknown         // any extra props forwarded to the component
}

type TileListItemRenderProps = {
    isFocused: boolean
    isSelected: boolean
    isHovered: boolean
    isDisabled: boolean
    isPressed: boolean
}
```

## Examples

### Single Selection Grid

```typescript
<TileList
    items={templates}
    aria-label="Templates"
    selectionMode="single"
    selectedKeys={selected}
    onSelectionChange={setSelected}
>
    {(item) => (
        <TileListItem id={item.id} textValue={item.name} type="full-border">
            <TileHeader title={item.name} />
            <TileContent>
                <Text size="sm" color="content-neutral-secondary">
                    {item.description}
                </Text>
            </TileContent>
        </TileListItem>
    )}
</TileList>
```

### Stack Layout with Dividers

Use `layout="stack"` + `type="bottom-border"` for a list where items are separated by lines:

```typescript
<TileList items={items} aria-label="Items" layout="stack">
    {(item) => (
        <TileListItem id={item.id} textValue={item.name} type="bottom-border">
            <TileHeader
                title={item.name}
                leadingSlot="comm-chat"
                trailingSlot={
                    <Button icon={<Icon name="trash-empty" />} variant="tertiary" size="sm" />
                }
            />
            <TileContent>
                <Text size="sm" color="content-neutral-secondary">{item.description}</Text>
            </TileContent>
        </TileListItem>
    )}
</TileList>
```

### Render Prop Children

Access selection/hover/focus state via render props:

```typescript
<TileListItem id={item.id} textValue={item.name} type="full-border">
    {({ isSelected, isHovered }) => (
        <>
            <TileHeader
                title={item.name}
                leadingSlot={isSelected ? 'circle-check' : 'circle'}
            />
            <TileContent>
                <Text size="sm">{item.description}</Text>
            </TileContent>
        </>
    )}
</TileListItem>
```

### Load More (infinite scroll)

Pass `onLoadMore` to load additional items as the user scrolls near the bottom. React Aria fires the callback automatically — no intersection observer needed. Pass `undefined` once all items are loaded to stop further calls.

```typescript
const [items, setItems] = useState(initialPage)
const [hasMore, setHasMore] = useState(true)

const handleLoadMore = async () => {
    const next = await fetchNextPage()
    setItems((prev) => [...prev, ...next.items])
    if (!next.hasMore) setHasMore(false)
}

<TileList
    items={items}
    aria-label="Templates"
    layout="stack"
    onLoadMore={hasMore ? handleLoadMore : undefined}
>
    {(item) => (
        <TileListItem id={item.id} textValue={item.name} type="bottom-border">
            <TileHeader title={item.name} />
### Link Tiles

Use `as="link"` with `href` to make each tile a navigation link:

```typescript
<TileList items={templates} aria-label="Templates">
    {(item) => (
        <TileListItem
            id={item.id}
            textValue={item.name}
            type="full-border"
            as="link"
            href={`/templates/${item.id}`}
        >
            <TileHeader title={item.name} />
            <TileContent>
                <Text size="sm" color="content-neutral-secondary">
                    {item.description}
                </Text>
            </TileContent>
        </TileListItem>
    )}
</TileList>
```

### With Action (no selection)

```typescript
<TileList items={items} aria-label="Templates" onAction={(key) => openItem(key)}>
    {(item) => (
        <TileListItem id={item.id} textValue={item.name} type="full-border">
            <TileHeader title={item.name} />
        </TileListItem>
    )}
</TileList>
```

## TileHeader Props

```typescript
type TileHeaderProps = {
    title?: string
    subtitle?: string | ReactNode
    leadingSlot?: SlotProp     // icon name string or ReactNode
    trailingSlot?: SlotProp    // icon name string or ReactNode
    children?: ReactNode
    // ...Box layout props
}
```

## TileContent Props

```typescript
type TileContentProps = {
    children?: ReactNode
    // ...Box layout props (always flexDirection="column")
}
```

## Testing Queries

TileList renders as `role="grid"`, items as `role="row"`:

```typescript
// Get the grid
const grid = screen.getByRole('grid', { name: 'Templates' })

// Get all rows (items)
const rows = within(grid).getAllByRole('row')
expect(rows).toHaveLength(3)

// Click an item
await user.click(rows[0])

// Assert selection
expect(rows[0]).toHaveAttribute('aria-selected', 'true')

// Assert structural elements via data-name
expect(container.querySelector('[data-name="tile-list"]')).toBeInTheDocument()
expect(container.querySelectorAll('[data-name="tile-list-item"]')).toHaveLength(3)
```
