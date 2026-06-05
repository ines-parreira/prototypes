# Panel

Scrollable panel container with sticky header and footer. Wraps Card with a StickyStack context so `PanelHeader`/`PanelFooter` can pin to the top/bottom as content scrolls.

## Import

```typescript
import { Panel, PanelHeader, PanelFooter } from '@gorgias/axiom'
```

## Panel Props

Extends all Card/Box props. Key additions:

```typescript
type PanelProps = {
    overflow?: 'auto' | 'scroll'  // enables internal scrolling (OverlayScrollbars)
    children?: ReactNode
    // ...all Card props: elevation, w, h, p, gap, etc.
    // defaults: w="100%", p={0}, gap={0}, elevation="default"
}
```

Set `overflow="auto"` to enable internal scrolling. With a sticky `PanelHeader`, the header pins to the top as content scrolls.

## PanelHeader Props

```typescript
type PanelHeaderProps = {
    title: string | ReactNode    // required
    caption?: string | ReactNode
    leadingSlot?: SlotProp       // before title (back button, icon, etc.)
    trailingSlot?: SlotProp      // right-aligned actions
    isSticky?: boolean           // default: true
    children?: ReactNode
    // ...Box layout props (p/px/py default to 'lg')
}
```

Children rendering rules:
- `<SearchField>` children render inline in the title row (to the left of `trailingSlot`)
- All other children render in a row **below** the title (use for tabs, filters, breadcrumbs)

To place an icon button adjacent to the title text (not far-right), pass `title` as a ReactNode:

```typescript
title={
    <Box gap="xxxs" alignItems="center">
        <Heading size="xl">Panel Title</Heading>
        <Button icon={<Icon name="settings" />} variant="tertiary" size="sm" />
    </Box>
}
```

## PanelFooter Props

```typescript
type PanelFooterProps = {
    isSticky?: boolean  // default: true
    children?: ReactNode
    // ...Box layout props
}
```

## Examples

### Basic scrollable panel

```typescript
<Panel w={400} h={600} overflow="auto">
    <PanelHeader title="Notifications" />
    {/* scrollable content */}
</Panel>
```

### Header with filter row and actions

```typescript
<Panel w={400} h={600} overflow="auto">
    <PanelHeader
        title="Notifications"
        trailingSlot={
            <Button icon={<Icon name="close" />} variant="tertiary" size="sm" aria-label="Close" />
        }
    >
        {/* renders below title row */}
        <Box gap="md" alignItems="center">
            <Box flex="1">
                <Select items={filterItems} selectedItem={filter} onSelect={setFilter} aria-label="Filter">
                    {(item) => <ListItem label={item.name} />}
                </Select>
            </Box>
            <Button variant="tertiary" size="sm">Mark all as read</Button>
        </Box>
    </PanelHeader>
    {/* content */}
</Panel>
```

### TileList inside a Panel

Use `layout="stack"` + `type="bottom-border"` tiles. `Panel.module.less` removes the default TileList gap so bottom-border items are flush:

```typescript
<Panel w={400} h={600} overflow="auto">
    <PanelHeader title="Items" />
    <TileList items={items} aria-label="Items" layout="stack">
        {(item) => (
            <TileListItem id={item.id} textValue={item.name} type="bottom-border">
                <TileHeader title={item.name} leadingSlot="chat" />
            </TileListItem>
        )}
    </TileList>
</Panel>
```

### With footer

```typescript
<Panel h={500} overflow="auto">
    <PanelHeader title="Settings" />
    {/* content */}
    <PanelFooter>
        <Box gap="sm" justifyContent="flex-end">
            <Button variant="secondary">Cancel</Button>
            <Button>Save</Button>
        </Box>
    </PanelFooter>
</Panel>
```

## Testing Queries

```typescript
// Assert panel is rendered
expect(container.querySelector('[data-name="panel"]')).toBeInTheDocument()

// Assert header title
expect(screen.getByText('Panel Title')).toBeInTheDocument()

// Assert header wrapper
expect(container.querySelector('[data-name="panel-header"]')).toBeInTheDocument()
```
