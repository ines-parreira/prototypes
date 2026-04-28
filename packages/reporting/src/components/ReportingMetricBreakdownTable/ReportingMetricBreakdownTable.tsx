import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { DataTableColumnEditingRenderProps } from '@gorgias/axiom'
import {
    Box,
    DataTable,
    DataTableActions,
    DataTableColumnEditing,
    DataTableToolbar,
} from '@gorgias/axiom'

import { useSaveTableColumnVisibility } from '../../hooks/useSaveTableColumnVisibility'
import { NoDataPlaceholder } from '../NoDataPlaceholder/NoDataPlaceholder'
import { buildMetricColumnDefs, buildNameColDef } from './columnBuilders'
import { ColumnEditingFooter } from './ColumnEditingFooter'
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
    chartId?: string
}

export function ReportingMetricBreakdownTable<TData>({
    data,
    metricColumns,
    loadingStates,
    DownloadButton,
    nameColumns,
    chartId,
}: Props<TData>) {
    const columns = useMemo(
        () => [
            ...nameColumns.map((col) => buildNameColDef<TData>(col)),
            ...buildMetricColumnDefs<TData>(metricColumns, loadingStates),
        ],
        [nameColumns, metricColumns, loadingStates],
    )
    const isAnyLoading = Object.values(loadingStates).some(Boolean)
    const nameColumnLabels = useMemo(
        () => nameColumns.map((col) => col.accessor),
        [nameColumns],
    )

    const { onSaveVisibleColumns, defaultVisibleColumns, isLoaded } =
        useSaveTableColumnVisibility(chartId ?? '')

    const [savedColumns, setSavedColumns] = useState<string[]>(() => {
        if (defaultVisibleColumns === undefined) {
            return [
                ...nameColumnLabels,
                ...metricColumns.map((col) => col.accessorKey),
            ]
        }
        return [
            ...nameColumnLabels,
            ...defaultVisibleColumns.filter(
                (col) => !nameColumnLabels.includes(col),
            ),
        ]
    })
    // make sure we correctly re-render once the saved columns are loaded on refresh
    const [tableKey, setTableKey] = useState(`loading-preferences`)

    const handleSetSavedColumns = useCallback(
        (columns: string[]) =>
            setSavedColumns([
                ...nameColumnLabels,
                ...columns.filter((col) => !nameColumnLabels.includes(col)),
            ]),
        [nameColumnLabels],
    )

    useEffect(() => {
        if (isLoaded && defaultVisibleColumns !== undefined) {
            handleSetSavedColumns(defaultVisibleColumns)
            setTableKey('loaded-preferences')
        }
    }, [isLoaded, defaultVisibleColumns, handleSetSavedColumns])

    const renderFooter = useCallback(
        ({
            setIsOpen,
            visibleColumns,
            setVisibleColumns,
        }: DataTableColumnEditingRenderProps) => (
            <ColumnEditingFooter
                setIsOpen={setIsOpen}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                savedColumns={savedColumns}
                setSavedColumns={handleSetSavedColumns}
                onSaveVisibleColumns={onSaveVisibleColumns}
            />
        ),
        [savedColumns, handleSetSavedColumns, onSaveVisibleColumns],
    )

    return (
        <Box display="flex" flex={1} flexDirection="column">
            <DataTable<TData>
                key={tableKey}
                data={data}
                columns={columns}
                withBorder
                isLoading={!isLoaded || (isAnyLoading && data.length === 0)}
                sorting={{ enable: true }}
                columnEditing={{
                    enable: true,
                    defaultVisibleColumns: savedColumns,
                }}
                pagination={{
                    enable: data.length > 10,
                    defaultValue: {
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
                    <DataTableColumnEditing
                        label="Edit metrics"
                        footer={renderFooter}
                    />
                </DataTableToolbar>
            </DataTable>
        </Box>
    )
}
