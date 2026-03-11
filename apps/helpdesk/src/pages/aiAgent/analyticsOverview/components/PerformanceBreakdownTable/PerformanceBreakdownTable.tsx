import { useMemo } from 'react'

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

import {
    buildFeatureColumnDef,
    buildMetricColumnDefs,
    PERFORMANCE_BREAKDOWN_TABLE,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownButton } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'
import css from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable.less'
import { usePerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

export const PerformanceBreakdownTable = () => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeature()
    const columns = useMemo(
        () => [
            buildFeatureColumnDef(),
            ...buildMetricColumnDefs(loadingStates),
        ],
        [loadingStates],
    )

    const table = useTable({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: false,
        },
    })

    const showEmptyState =
        data.length === 0 && !Object.values(loadingStates).some(Boolean)

    return (
        <Box
            display="flex"
            flexDirection="column"
            flex={1}
            gap="xxxs"
            minWidth="0px"
        >
            <Box className={css.header}>
                <Heading size="sm" className={css.title}>
                    {PERFORMANCE_BREAKDOWN_TABLE.title}
                </Heading>
            </Box>
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                <Box display="flex" justifyContent="flex-end">
                    <DownloadPerformanceBreakdownButton />
                </Box>
                <TableToolbar
                    table={table}
                    bottomRow={{
                        left: ['totalCount'],
                        right: ['settings'],
                    }}
                />
                <Box className={css.tableWrapper}>
                    <TableRoot withBorder className={css.table}>
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
                                <Text size="md" color="secondary">
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
