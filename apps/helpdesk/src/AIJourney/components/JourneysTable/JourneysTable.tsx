import { useHistory } from 'react-router-dom'

import type { ColumnDef, ToolbarRow } from '@gorgias/axiom'
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

import EmptyCampaignsState from 'AIJourney/components/JourneysTable/EmptyCampaignsState/EmptyCampaignsState'
import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

import styles from './JourneysTable.less'

type journeysTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    isLoading?: boolean
    isCampaign?: boolean
}

const TABLE_PAGE_SIZE = 10

export const JourneysTable = <TData, TValue>({
    columns,
    data,
    onEditColumns,
    isLoading = false,
    isCampaign = false,
}: journeysTableProps<TData, TValue>) => {
    const history = useHistory()
    const { currency, shopName } = useJourneyContext()

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
            pageSize: TABLE_PAGE_SIZE,
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

    const shouldRenderPaginationComponent =
        table.getRowModel().rows.length > TABLE_PAGE_SIZE
    const bottomToolbarElements: ToolbarRow = shouldRenderPaginationComponent
        ? { right: ['pagination'] }
        : {}

    const topToolbarElements: ToolbarRow = {
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
                        size="sm"
                        variant="tertiary"
                    >
                        Edit table
                    </Button>
                ),
            },
            ...(isCampaign
                ? [
                      {
                          key: 'create',
                          content: (
                              <Button
                                  onClick={() =>
                                      history.push(
                                          `/app/ai-journey/${shopName}/${JOURNEY_TYPES.CAMPAIGN}/${STEPS_NAMES.SETUP}`,
                                      )
                                  }
                              >
                                  Create campaign
                              </Button>
                          ),
                      },
                  ]
                : []),
        ],
    }

    return (
        <>
            <div className={styles.tableWrapper}>
                <TableToolbar<TData>
                    table={table}
                    bottomRow={topToolbarElements}
                />
                <TableRoot withBorder className={styles.tableRoot}>
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
                                <EmptyCampaignsState />
                            </Box>
                        )}
                    />
                </TableRoot>
                <TableToolbar table={table} bottomRow={bottomToolbarElements} />
            </div>
        </>
    )
}
