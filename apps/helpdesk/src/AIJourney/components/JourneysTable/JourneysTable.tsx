import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Button,
    HeaderRowGroup,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import styles from './JourneysTable.less'

type journeysTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    isLoading?: boolean
}

export const JourneysTable = <TData, TValue>({
    columns,
    data,
    onEditColumns,
    isLoading = false,
}: journeysTableProps<TData, TValue>) => {
    const { currency } = useCurrency()

    const table = useTable({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
        },
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        globalFilterConfig: {
            enableGlobalFilter: true,
            globalFilterFn: 'includesString',
        },
        additionalOptions: {
            meta: {
                currency: currency,
            },
        },
    })

    return (
        <>
            <div className={styles.tableWrapper}>
                <TableToolbar<TData>
                    table={table}
                    bottomRow={{
                        left: ['search'],
                        right: [
                            'totalCount',
                            {
                                key: 'edit',
                                content: (
                                    <Button
                                        onClick={onEditColumns}
                                        intent="regular"
                                        leadingSlot="columns"
                                        size="md"
                                        variant="secondary"
                                    >
                                        Edit metrics
                                    </Button>
                                ),
                            },
                        ],
                    }}
                />
                <TableRoot withBorder>
                    <TableHeader>
                        <HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableBodyContent
                        isLoading={isLoading}
                        rows={table.getRowModel().rows}
                        columnCount={columns.length}
                        table={table}
                        renderEmptyStateComponent={() => (
                            <Box alignItems="center" justifyContent="center">
                                No journeys selected
                            </Box>
                        )}
                    />
                </TableRoot>
                <TableToolbar
                    table={table}
                    bottomRow={{ right: ['pagination'] }}
                />
            </div>
        </>
    )
}
