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
    buildEntityColumnDef,
    buildMetricColumnDefs,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { DownloadOrderManagementButton } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import css from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/OrderManagementTable.less'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

export const OrderManagementTable = () => {
    const { data = [], loadingStates } = useOrderManagementMetrics()
    const columns = useMemo(
        () => [buildEntityColumnDef(), ...buildMetricColumnDefs(loadingStates)],
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
            <Box
                className={css.tableContainer}
                display="flex"
                flexDirection="column"
                minWidth="0px"
            >
                <Box display="flex" justifyContent="flex-end">
                    <DownloadOrderManagementButton />
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
