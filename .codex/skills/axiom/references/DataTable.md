# DataTable

Composable data table built on TanStack Table with built-in support for sorting, filtering, pagination, search, row selection, column editing/ordering, row reordering, column resizing, keyboard navigation, horizontal scrolling with sticky columns, and state persistence (URL + localStorage).

## Import

```typescript
import {
    DataTable,
    DataTableToolbar,
    DataTableSearch,
    DataTablePagination,
    DataTableActions,
    DataTableBulkActions,
    DataTableItemCount,
    DataTableSelectedCount,
    DataTableEmptyState,
    DataTableColumnEditing,
    // Cell components
    DataTableBaseCell,
    DataTableTextCell,
    DataTableCheckBoxCell,
    DataTableToggleCell,
    DataTableSelectCell,
    DataTableMultiSelectCell,
    DataTableActionsCell,
    DataTableOverflowListCell,
    // Filter components
    DataTableSelectFilter,
    DataTableMultiSelectFilter,
    DataTableBooleanFilter,
    // Utilities
    createColumnHelper,
    // Persistence
    createLocalStoragePersistence,
    createUrlPersistence,
    // TanStack re-exports
    type ColumnDef,
    type Row,
    type CellContext,         // typed cell render context (info in `cell: (info) => ...`)
    type HeaderContext,       // typed header render context (info in `header: (info) => ...`)
    type SortingState,
    type PaginationState,
    type RowSelectionState,
    type VisibilityState,
    type ColumnFiltersState,
} from '@gorgias/axiom'
```

Use `CellContext<TData, TValue>` and `HeaderContext<TData, TValue>` when extracting cell/header renderers into named components so they stay typed with the row data:

```typescript
function UserNameCell(info: CellContext<User, string>) {
    return <DataTableTextCell {...info} leadingSlot="user" />
}
```

## Props

### DataTableProps\<TData\>

```typescript
type DataTableProps<TData> = {
    data: TData[] // Array of data to display
    columns: DataTableColumnDef<TData>[] // Column definitions
    children?: ReactNode // Feature components (Toolbar, Pagination, etc.)

    // Feature configurations
    selection?: DataTableSelectionConfig // Row selection
    search?: DataTableSearchConfig // Global search/filter
    pagination?: DataTablePaginationConfig // Pagination
    sorting?: DataTableSortingConfig // Column sorting (mutually exclusive with reordering)
    columnEditing?: DataTableColumnEditingConfig // Column visibility/ordering
    filters?: DataTableFiltersConfig // Column-defined filters
    reordering?: DataTableReorderingConfig // Row reordering (mutually exclusive with sorting)
    columnResizing?: DataTableColumnResizingConfig // Interactive column resizing
    persistence?: DataTablePersistenceConfig // State persistence (URL, localStorage)
    virtualization?: DataTableVirtualizationConfig // Row virtualization (opt-in)

    // Display
    isLoading?: boolean // Show skeleton rows
    renderEmptyState?: () => ReactNode // Custom empty state
    onRowClick?: (row: TData) => void // Row click callback (also enables keyboard navigation)
    withBorder?: boolean // Border around table
    elevation?: Elevation // Shadow elevation
    overflow?: DataTableOverflow // 'constrain' (default) | 'scroll'
    stickyColumns?: number // Number of leading columns to stick when overflow="scroll"
    estimatedRowHeight?: number // Row height estimate (improves virtualization + skeleton sizing)
}
```

### DataTableColumnDef\<TData\>

Extends TanStack's `ColumnDef<TData>`:

```typescript
type DataTableColumnDef<TData> = ColumnDef<TData> & {
    filter?: ReactNode // Filter component for toolbar
    hug?: boolean // Shrink column to content width
}
```

### Configuration Types

```typescript
// All feature configs use ValueProps pattern: value/defaultValue/onChange
// for controlled/uncontrolled state management.

// Row selection
type DataTableSelectionConfig<TData> = ValueProps<RowSelectionState> & {
    enable?: boolean | ((row: Row<TData>) => boolean)
    multiple?: boolean // Adds checkbox column
    subRows?: boolean
}

// Search
type DataTableSearchConfig<TData> = ValueProps<string> & {
    enable?: boolean
    manual?: boolean // Server-side search
    filterFn?: FilterFnOption<TData>
    persist?: boolean | PersistenceAdapter
}

// Pagination
type DataTablePaginationConfig = ValueProps<PaginationState> & {
    enable?: boolean
    manual?: boolean // Server-side pagination
    pageCount?: number // Total pages (manual)
    rowCount?: number // Total rows (manual)
    hasNextPage?: boolean // Cursor-based
    hasPreviousPage?: boolean
    onPageChange?: (direction: 'next' | 'previous') => void
    onPageSizeChange?: (pageSize: number) => void
    persist?: boolean | PersistenceAdapter
}

// Sorting
type DataTableSortingConfig = ValueProps<SortingState> & {
    enable?: boolean
    manual?: boolean // Server-side sorting
    persist?: boolean | PersistenceAdapter
}

// Column editing (visibility + ordering)
type DataTableColumnEditingConfig = {
    enable?: boolean
    visibleColumns?: string[] // Controlled visible columns
    defaultVisibleColumns?: string[] // Uncontrolled initial visible columns
    onVisibleColumnsChange?: (visibleColumns: string[]) => void
    columnOrder?: string[] // Controlled column order
    defaultColumnOrder?: string[] // Uncontrolled initial column order
    onColumnOrderChange?: (columnOrder: string[]) => void
    persist?: boolean | PersistenceAdapter
}

// Filters (uses ValueProps pattern: value/defaultValue/onChange)
type DataTableFiltersConfig = ValueProps<Record<string, unknown>> & {
    enable?: boolean
    manual?: boolean // Server-side filtering
    persist?: boolean | PersistenceAdapter
}

// Column resizing
type DataTableColumnResizingConfig = ValueProps<Record<string, number>> & {
    enable?: boolean
    mode?: 'onChange' | 'onEnd' // Default: 'onChange'
    persist?: boolean | PersistenceAdapter
}

// Reordering (mutually exclusive with sorting)
type DataTableReorderingConfig<TData> = {
    enable?: boolean
    onReorder: (reorderedData: TData[], event: ReorderEvent) => void
}

// State persistence
type DataTablePersistenceConfig = {
    enable?: boolean
    url?: boolean | UrlPersistenceOptions | PersistenceAdapter
    localStorage?: boolean | LocalStoragePersistenceOptions | PersistenceAdapter
}

// Row virtualization (cannot be combined with `reordering`)
type DataTableVirtualizationConfig = {
    enable?: boolean
    overscan?: number // Rows rendered outside viewport on each side. Default 5.
}
```

## Usage

### Basic Table

```typescript
const columnHelper = createColumnHelper<User>()

const columns = [
    columnHelper.accessor('name', { header: 'Name' }),
    columnHelper.accessor('email', { header: 'Email' }),
]

<DataTable data={users} columns={columns} withBorder />
```

### Full-Featured Table

```typescript
<DataTable
    data={users}
    columns={columns}
    pagination={{ enable: true, pageSize: 10 }}
    search={{ enable: true }}
    selection={{ enable: true, multiple: true }}
    sorting={{ enable: true }}
    columnEditing={{ enable: true }}
    filters={{ value: filterValues, onChange: setFilterValues }}
    withBorder
>
    <DataTableToolbar title="Users">
        <DataTableSearch placeholder="Search users..." />
        <DataTableColumnEditing />
        <DataTableActions>
            <Button variant="primary" size="sm">Add User</Button>
        </DataTableActions>
        <DataTableBulkActions>
            {(rows) => <Button size="sm">Delete {rows.length}</Button>}
        </DataTableBulkActions>
    </DataTableToolbar>
    <DataTablePagination />
</DataTable>
```

### Column Definitions with Cells and Filters

```typescript
const columnHelper = createColumnHelper<User>()

const columns = [
    columnHelper.accessor('name', {
        header: 'Name',
        enableSorting: true,
        cell: (info) => <DataTableTextCell {...info} leadingSlot="user" />,
    }),
    columnHelper.accessor('role', {
        header: 'Role',
        enableSorting: true,
        filter: (
            <DataTableSelectFilter items={roles}>
                {(role) => <ListItem label={role.name} />}
            </DataTableSelectFilter>
        ),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        filter: (
            <DataTableMultiSelectFilter items={statuses}>
                {(status) => <ListItem label={status.name} />}
            </DataTableMultiSelectFilter>
        ),
    }),
    columnHelper.accessor('active', {
        header: 'Active',
        cell: (info) => <DataTableToggleCell {...info} onChange={handleToggle} />,
    }),
    columnHelper.actions({
        cell: () => (
            <DataTableActionsCell>
                <Button variant="tertiary" size="sm" leadingSlot="pencil">Edit</Button>
            </DataTableActionsCell>
        ),
    }),
]
```

### Server-Side (Manual) Mode

```typescript
<DataTable
    data={users}
    columns={columns}
    search={{ enable: true, manual: true, onChange: handleSearchChange }}
    pagination={{
        enable: true,
        manual: true,
        pageCount: totalPages,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
    }}
    sorting={{ enable: true, manual: true, onChange: handleSortingChange }}
    filters={{ manual: true, value: filterValues, onChange: handleFiltersChange }}
>
    <DataTableToolbar title="Users">
        <DataTableSearch placeholder="Search..." />
    </DataTableToolbar>
    <DataTablePagination />
</DataTable>
```

### Row Reordering

```typescript
<DataTable
    data={items}
    columns={columns}
    reordering={{
        enable: true,
        onReorder: (reorderedData) => setItems(reorderedData),
    }}
    withBorder
/>
```

### Row Virtualization

Opt in via `virtualization={{ enable: true }}` to render only visible rows. The dispatcher resolves the scroll element automatically: first from the surrounding `StickyStack` (the viewport that a `Panel` with `overflow="auto"` registers), then by walking up the DOM for the nearest scrollable ancestor, falling back to window scroll. Pair with `estimatedRowHeight` for accurate scrollbar sizing.

Virtualization cannot be combined with `reordering` (drag targets must be in the DOM).

```typescript
<Panel overflow="auto" h={600}>
    <PanelHeader title="Large Table" />
    <DataTable
        data={largeDataset}
        columns={columns}
        virtualization={{ enable: true, overscan: 10 }}
        estimatedRowHeight={48}
    />
</Panel>
```

## Sub-Components

### Toolbar Components

- **DataTableToolbar** - 3-line header: title (line 1), controls (line 2), item count/bulk actions (line 3)
- **DataTableSearch** - Debounced search input (`placeholder`, `size`, `debounce` props)
- **DataTablePagination** - Pagination controls with page size selector (`pageSizeOptions`, `hasLinesPerPage` props)
- **DataTableActions** - Right-aligned action buttons container
- **DataTableBulkActions** - Renders children as `(rows: Row<TData>[]) => ReactNode` when rows are selected
- **DataTableColumnEditing** - Column visibility + ordering panel (`label`, `footer` props; footer accepts `SlotProp<DataTableColumnEditingRenderProps>`)
- **DataTableItemCount** - Auto-rendered count of visible items
- **DataTableSelectedCount** - Count of selected rows
- **DataTableEmptyState** - Custom empty state display

### Cell Components

All cell components accept spread `CellContext` props (`{...info}` from column cell function).

- **DataTableBaseCell** - Base cell wrapper with flex Box layout (`gap`, `flexDirection`)
- **DataTableTextCell** - Text display with `variant`, `size`, `color`, `overflow`, `leadingSlot`, `trailingSlot`
- **DataTableCheckBoxCell** - Inline checkbox
- **DataTableToggleCell** - Inline toggle switch
- **DataTableSelectCell** - Inline single-select (`items` + `children` render fn + `onChange`)
- **DataTableMultiSelectCell** - Inline multi-select (`items` + `children` render fn + `onChange`)
- **DataTableOverflowListCell** - Renders items in an OverflowList that collapses with "+N" when column is narrow
- **DataTableActionsCell** - Container for action buttons

### Filter Components

Attached via column `filter` property. Automatically collected and rendered in toolbar.

- **DataTableSelectFilter** - Single-select filter (`items` + `children` render fn)
- **DataTableMultiSelectFilter** - Multi-select filter (`items` + `children` render fn)
- **DataTableBooleanFilter** - Boolean toggle filter

### Horizontal Scrolling with Sticky Columns

```typescript
<DataTable
    data={users}
    columns={columns}
    overflow="scroll"
    stickyColumns={2} // First 2 data columns stay fixed
    selection={{ enable: true, multiple: true }} // Selection column is auto-sticky
    withBorder
>
    <DataTableToolbar title="Wide Table" />
</DataTable>
```

### DataTableOverflowListCell

Renders items in an OverflowList that automatically collapses with "+N" when the column is too narrow:

```typescript
columnHelper.accessor('tags', {
    header: 'Tags',
    cell: (info) => (
        <DataTableOverflowListCell {...info} items={info.getValue()} gap="xxxs">
            {(tag) => <Tag>{tag.name}</Tag>}
        </DataTableOverflowListCell>
    ),
})
```

### State Persistence

DataTable supports automatic state persistence to URL and localStorage:

```typescript
<DataTable
    data={users}
    columns={columns}
    persistence={{
        enable: true,
        url: { prefix: 'users', historyMode: 'push' }, // sorting, search, filters → URL params
        localStorage: { id: 'users-table' }, // pageSize, columnOrder, visibleColumns → localStorage
    }}
    sorting={{ enable: true }} // Sorting state auto-persisted to URL
    search={{ enable: true }} // Search state auto-persisted to URL
    pagination={{ enable: true }} // Page index → URL, page size → localStorage
    columnEditing={{ enable: true }} // Column order/visibility → localStorage
>
    <DataTableToolbar title="Users">
        <DataTableSearch />
        <DataTableColumnEditing />
    </DataTableToolbar>
    <DataTablePagination />
</DataTable>
```

Per-feature `persist` prop overrides defaults: `true` uses the default adapter, `false` disables, or pass a custom `PersistenceAdapter`.

### Column Editing with Custom Footer

```typescript
<DataTableColumnEditing
    label="Edit columns"
    footer={({ visibleColumns, orderedColumns, setVisibleColumns }) => (
        <Button variant="tertiary" onPress={() => setVisibleColumns(allColumnIds)}>
            Reset to defaults
        </Button>
    )}
/>
```

### Keyboard Navigation

When `onRowClick` or `selection` is enabled, DataTable supports keyboard navigation:

- **Arrow Down/Up**: Navigate between rows (wraps at boundaries)
- **Arrow Left/Right**: Horizontal scroll when `overflow="scroll"`
- **Space**: Toggle selection on active row
- **Enter**: Trigger `onRowClick` on active row

## Testing Queries

```typescript
// Table structure
screen.getByRole('table')
screen.getAllByRole('row')
screen.getAllByRole('columnheader')

// Selection
screen.getByRole('checkbox', { name: 'Select all rows' })
screen.getByRole('checkbox', { name: /Select row/ })

// Search
screen.getByRole('searchbox')

// Pagination
screen.getByRole('button', { name: /next/i })
screen.getByRole('button', { name: /previous/i })
```
