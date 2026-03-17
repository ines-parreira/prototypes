import type { ReactNode } from 'react'

import {
    Box,
    HeaderRowGroup,
    Heading,
    TableBodyContent,
    TableHeader,
    TableRoot,
    TableToolbar,
    Text,
    useTable,
} from '@gorgias/axiom'

import { buildMetricColumnDefs, buildNameColDef } from './columnBuilders'
import type {
    MetricColumnConfig,
    MetricLoadingStates,
    NameColumnConfig,
} from './types'

import css from './ReportingMetricBreakdownTable.less'

export type { MetricColumnConfig, MetricLoadingStates, NameColumnConfig }
export { buildMetricColumnDefs }

type Props<TData> = {
    data: TData[]
    metricColumns: MetricColumnConfig[]
    loadingStates: MetricLoadingStates
    getRowKey: (row: TData) => string
    DownloadButton: ReactNode
    nameColumn: NameColumnConfig<TData>
}

export function ReportingMetricBreakdownTable<TData>({
    data,
    metricColumns,
    loadingStates,
    getRowKey,
    DownloadButton,
    nameColumn,
}: Props<TData>) {
    const columns = [
        buildNameColDef(nameColumn),
        ...buildMetricColumnDefs(metricColumns, loadingStates, getRowKey),
    ]

    const isAnyLoading = Object.values(loadingStates).some(Boolean)

    const table = useTable({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
    })

    const showEmptyState = data.length === 0 && !isAnyLoading

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                <Box display="flex" justifyContent="flex-end">
                    {DownloadButton}
                </Box>
                <TableToolbar
                    table={table}
                    bottomRow={{
                        left: ['totalCount'],
                        right: ['settings'],
                    }}
                />
                <Box className={css.tableWrapper}>
                    <TableRoot withBorder>
                        {showEmptyState ? (
                            <Box
                                width="100%"
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                padding="xxxl"
                                gap="xs"
                            >
                                <Heading size="sm">No data found</Heading>
                                <Text
                                    size="md"
                                    color="content-neutral-secondary"
                                >
                                    Try to adjust your report filters.
                                </Text>
                            </Box>
                        ) : (
                            <>
                                <TableHeader>
                                    <HeaderRowGroup
                                        headerGroups={table.getHeaderGroups()}
                                    />
                                </TableHeader>
                                <TableBodyContent
                                    rows={table.getRowModel().rows}
                                    columnCount={table.getAllColumns().length}
                                    table={table}
                                />
                            </>
                        )}
                    </TableRoot>
                </Box>
            </Box>
        </Box>
    )
}
