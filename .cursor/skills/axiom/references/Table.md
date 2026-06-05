# Table

Simple HTML table wrapper with border, elevation, and sticky header support. For advanced features (sorting, filtering, pagination), use DataTable instead.

## Import

```typescript
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHeaderCell,
    TableCell,
} from '@gorgias/axiom'
```

## Props

### TableProps

```typescript
type TableProps = DataAttributes & {
    children?: ReactNode
    withBorder?: boolean // Border around table
    elevation?: Elevation // Shadow elevation ('default' | 'mid' | 'high')
    layout?: TableLayout // 'auto' | 'fixed' (default: 'auto')
}
```

### TableHeaderCellProps

```typescript
type TableHeaderCellProps = DataAttributes & {
    children?: ReactNode
    hug?: boolean // Shrink to content width
    sortDirection?: SortDirection // 'ascending' | 'descending'
    onSortChange?: () => void // Sort toggle callback
}
```

### TableCellProps

```typescript
type TableCellProps = DataAttributes & {
    children?: ReactNode
    hug?: boolean // Shrink to content width
}
```

### TableRowProps

```typescript
type TableRowProps = DataAttributes & {
    children?: ReactNode
    onClick?: MouseEventHandler<HTMLTableRowElement>
}
```

## Usage

### Basic Table

```typescript
<Table>
    <TableHeader>
        <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
        </TableRow>
        <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>bob@example.com</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

### With Border and Elevation

```typescript
<Table withBorder elevation="mid">
    <TableHeader>
        <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Active</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

### With Sortable Columns

```typescript
<Table>
    <TableHeader>
        <TableRow>
            <TableHeaderCell
                sortDirection="ascending"
                onSortChange={() => toggleSort('name')}
            >
                Name
            </TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <TableBody>
        {sortedData.map(row => (
            <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

### Fixed Layout

```typescript
<Table layout="fixed">
    <TableHeader>
        <TableRow>
            <TableHeaderCell hug>ID</TableHeaderCell>
            <TableHeaderCell>Name</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell hug>1</TableCell>
            <TableCell>Alice</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

### Clickable Rows

```typescript
<Table>
    <TableHeader>
        <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
        </TableRow>
    </TableHeader>
    <TableBody>
        {data.map(row => (
            <TableRow key={row.id} onClick={() => handleRowClick(row)}>
                <TableCell>{row.name}</TableCell>
            </TableRow>
        ))}
    </TableBody>
</Table>
```

## Notes

- Table headers are **sticky** by default (stick to top when scrolling)
- Use `hug` on cells to shrink them to content width (useful for action columns)
- For advanced table features, prefer **DataTable** which provides built-in sorting, filtering, pagination, search, selection, and column editing

## Related Components

- **DataTable**: Full-featured composable table with TanStack Table
- **ReorderableTable**: Table with drag-and-drop row reordering
- **Pagination**: For paginating table data

## Testing Queries

```typescript
screen.getByRole('table')
screen.getAllByRole('row')
screen.getByRole('columnheader', { name: 'Name' })
screen.getAllByRole('cell')
container.querySelector('[data-name="table"]')
```
