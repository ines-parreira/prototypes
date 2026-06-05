# ReorderableTable

Table with drag-and-drop row reordering. Extends the base Table component with native HTML5 drag API support.

## Import

```typescript
import {
    ReorderableTable,
    ReorderableTableRow,
    ReorderableTableHeaderCell,
    TableDragHandleCell,
} from '@gorgias/axiom'
```

## Props

### ReorderableTableProps

Extends `TableProps`.

```typescript
type ReorderableTableProps = TableProps & {
    onReorder: (event: ReorderEvent) => void // Required: callback when row is reordered
}

type ReorderEvent = {
    sourceId: string // The id of the row that was dragged
    targetId: string // The id of the row it was dropped on
    dropPosition: 'before' | 'after' // Whether to place before or after the target
}
```

### ReorderableTableRowProps

```typescript
type ReorderableTableRowProps = DataAttributes & {
    children?: ReactNode
    onClick?: MouseEventHandler<HTMLTableRowElement>
    id: string // Required: unique identifier for reorder tracking
}
```

### ReorderableTableHeaderCellProps

Wraps `TableHeaderCell` but removes sort-related props (sorting conflicts with reordering).

## Sub-Components

- **ReorderableTable** - Root table wrapper, provides reorder context
- **ReorderableTableRow** - Draggable row (requires `id` prop)
- **ReorderableTableHeaderCell** - Header cell without sorting
- **TableDragHandleCell** - Grip icon cell for drag affordance

## Usage

### Basic Reorderable Table

```typescript
import {
    ReorderableTable,
    ReorderableTableRow,
    ReorderableTableHeaderCell,
    TableDragHandleCell,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
} from '@gorgias/axiom'

function MyTable() {
    const [items, setItems] = useState(data)

    const handleReorder = (event: ReorderEvent) => {
        // Reorder items based on sourceId, targetId, dropPosition
    }

    return (
        <ReorderableTable onReorder={handleReorder}>
            <TableHeader>
                <TableRow>
                    <ReorderableTableHeaderCell hug />
                    <ReorderableTableHeaderCell>Name</ReorderableTableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <ReorderableTableRow key={item.id} id={item.id}>
                        <TableDragHandleCell />
                        <TableCell>{item.name}</TableCell>
                    </ReorderableTableRow>
                ))}
            </TableBody>
        </ReorderableTable>
    )
}
```

## Testing Queries

```typescript
// Table
screen.getByRole('table')

// Rows
screen.getAllByRole('row')

// Drag handles
document.querySelectorAll('[data-name="table-drag-handle"]')

// Verify draggable attribute
expect(row).toHaveAttribute('draggable', 'true')
```
