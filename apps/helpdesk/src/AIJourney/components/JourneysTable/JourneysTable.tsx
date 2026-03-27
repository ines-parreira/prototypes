import type { ColumnDef, ToolbarRow } from '@gorgias/axiom'
import {
    Box,
    Button,
    HeaderRowGroup,
    Size,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    useTable,
} from '@gorgias/axiom'

import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import styles from './JourneysTable.less'

type journeysTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    isLoading?: boolean
    integrationId?: number
}

export const JourneysTable = <TData, TValue>({
    columns,
    data,
    onEditColumns,
    isLoading = false,
    integrationId,
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
                integrationId: integrationId,
            },
        },
    })

    const shouldRenderPaginationComponent =
        table.getFilteredRowModel().rows.length > 10
    const tableToolbarBottonRowElements: ToolbarRow =
        shouldRenderPaginationComponent ? { right: ['pagination'] } : {}

    return (
        <>
            <div className={styles.tableWrapper}>
                <Box
                    paddingLeft={Size.Lg}
                    paddingRight={Size.Lg}
                    display="block"
                >
                    <TableToolbar<TData>
                        table={table}
                        topRow={{ left: ['search'] }}
                        bottomRow={{
                            left: ['totalCount'],
                            right: [
                                {
                                    key: 'edit',
                                    content: (
                                        <Button
                                            onClick={onEditColumns}
                                            intent="regular"
                                            leadingSlot="columns"
                                            size="sm"
                                            variant="tertiary"
                                        >
                                            Edit table
                                        </Button>
                                    ),
                                },
                            ],
                        }}
                    />
                </Box>

                <TableRoot withBorder={false} className={styles.tableRoot}>
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
                <Box
                    paddingRight={Size.Lg}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <TableToolbar
                        table={table}
                        bottomRow={tableToolbarBottonRowElements}
                    />
                </Box>
            </div>
            <DrillDownModal />
        </>
    )
}
