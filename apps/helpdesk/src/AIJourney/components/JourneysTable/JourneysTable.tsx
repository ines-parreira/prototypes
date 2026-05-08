import type { ColumnDef, SortingState, TableV1ToolbarRow } from '@gorgias/axiom'
import {
    Box,
    Button,
    Size,
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    TableV1Toolbar,
    useTableV1,
} from '@gorgias/axiom'

import { DateFormatToggle } from 'AIJourney/components/DateFormatToggle/DateFormatToggle'
import type { JourneysTableMeta } from 'AIJourney/components/JourneysTable/JourneysColumns/JourneysColumns'
import { useDateFormatPreference } from 'AIJourney/hooks'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import styles from './JourneysTable.less'

type journeysTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    onAddCustomFlow?: () => void
    showAddCustomFlow?: boolean
    isLoading?: boolean
    integrationId?: number
    initialSorting?: SortingState
}

export const JourneysTable = <TData, TValue>({
    columns,
    data,
    onEditColumns,
    onAddCustomFlow,
    showAddCustomFlow = false,
    isLoading = false,
    integrationId,
    initialSorting,
}: journeysTableProps<TData, TValue>) => {
    const { currency } = useCurrency()
    const { format: dateFormat, toggleFormat } = useDateFormatPreference()

    const table = useTableV1({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
            initialSorting,
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
                dateFormat,
            } satisfies JourneysTableMeta,
        },
    })

    const shouldRenderPaginationComponent =
        table.getFilteredRowModel().rows.length > 10
    const tableToolbarBottonRowElements: TableV1ToolbarRow =
        shouldRenderPaginationComponent ? { right: ['pagination'] } : {}

    return (
        <>
            <div className={styles.tableWrapper}>
                <Box
                    paddingLeft={Size.Lg}
                    paddingRight={Size.Lg}
                    display="block"
                >
                    <TableV1Toolbar<TData>
                        table={table}
                        topRow={{ left: ['search'] }}
                        bottomRow={{
                            left: ['totalCount'],
                            right: [
                                ...(showAddCustomFlow
                                    ? [
                                          {
                                              key: 'add-custom-flow',
                                              content: (
                                                  <Button
                                                      onClick={onAddCustomFlow}
                                                      intent="regular"
                                                      leadingSlot="add"
                                                      size="sm"
                                                      variant="secondary"
                                                  >
                                                      Add Custom Flow
                                                  </Button>
                                              ),
                                          },
                                      ]
                                    : []),
                                {
                                    key: 'date-format',
                                    content: (
                                        <DateFormatToggle
                                            format={dateFormat}
                                            onToggle={toggleFormat}
                                        />
                                    ),
                                },
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

                <TableV1Root withBorder={false} className={styles.tableRoot}>
                    <TableHeader>
                        <TableV1HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableV1BodyContent
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
                </TableV1Root>
                <Box
                    paddingRight={Size.Lg}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <TableV1Toolbar
                        table={table}
                        bottomRow={tableToolbarBottonRowElements}
                    />
                </Box>
            </div>
            <DrillDownModal />
        </>
    )
}
