import type { ReactNode } from 'react'

import {
    Box,
    DataTable,
    DataTableActions,
    DataTableColumnEditing,
    DataTableToolbar,
} from '@gorgias/axiom'

import { NoDataPlaceholder } from '../NoDataPlaceholder/NoDataPlaceholder'
import { buildMetricColumnDefs, buildNameColDef } from './columnBuilders'
import type {
    MetricColumnConfig,
    MetricLoadingStates,
    NameColumnConfig,
} from './types'

export type { MetricColumnConfig, MetricLoadingStates, NameColumnConfig }
export { buildMetricColumnDefs }

type Props<TData> = {
    data: TData[]
    metricColumns: MetricColumnConfig[]
    loadingStates: MetricLoadingStates
    DownloadButton: ReactNode
    nameColumns: NameColumnConfig[]
}

export function ReportingMetricBreakdownTable<TData>({
    data,
    metricColumns,
    loadingStates,
    DownloadButton,
    nameColumns,
}: Props<TData>) {
    const columns = [
        ...nameColumns.map((col) => buildNameColDef<TData>(col)),
        ...buildMetricColumnDefs<TData>(metricColumns, loadingStates),
    ]

    const isAnyLoading = Object.values(loadingStates).some(Boolean)

    return (
        <Box display="flex" flex={1} flexDirection="column">
            <DataTable<TData>
                data={data}
                columns={columns}
                withBorder
                isLoading={isAnyLoading && data.length === 0}
                sorting={{ enable: true }}
                columnEditing={{ enable: true }}
                pagination={{
                    enable: data.length > 10,
                    value: {
                        pageSize: 10,
                        pageIndex: 0,
                    },
                }}
                renderEmptyState={() => (
                    <NoDataPlaceholder height={100} marginBottom={0} />
                )}
            >
                <DataTableToolbar>
                    <DataTableActions>{DownloadButton}</DataTableActions>
                    <DataTableColumnEditing label="Edit metrics" />
                </DataTableToolbar>
            </DataTable>
        </Box>
    )
}
