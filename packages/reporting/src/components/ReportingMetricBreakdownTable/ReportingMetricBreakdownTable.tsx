import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { DataTableColumnEditingRenderProps } from '@gorgias/axiom'
import {
    Box,
    DataTable,
    DataTableActions,
    DataTableColumnEditing,
    Text,
} from '@gorgias/axiom'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import css from './ReportingMetricBreakdownTable.less'

import { useDashboardContext } from '../../contexts/DashboardContext'
import { useSaveTableColumnVisibility } from '../ManagedDashboards/hooks/useSaveTableColumnVisibility'
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

type ChartSchemaWithPreferences = {
    metadata?: {
        preferences?: {
            columns?: ColumnConfig[] | null
        }
    }
}

type Props<TData> = {
    actionMenu?: ReactNode
    data: TData[]
    metricColumns: MetricColumnConfig[]
    loadingStates: MetricLoadingStates
    DownloadButton?: ReactNode
    nameColumns: NameColumnConfig[]
    chartId?: string
    name?: string
    enableSearch?: boolean
    customDashboardChartSchema?: ChartSchemaWithPreferences
    onSaveColumns?: (columns: ColumnConfig[]) => void
}

export function ReportingMetricBreakdownTable<TData>({
    actionMenu,
    data,
    metricColumns,
    loadingStates,
    DownloadButton,
    nameColumns,
    chartId,
    name,
    enableSearch,
    customDashboardChartSchema,
    onSaveColumns,
}: Props<TData>) {
    const isCustomDashboard = !!customDashboardChartSchema
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

    const context = useDashboardContext()
    const { saveVisibleColumns } = useSaveTableColumnVisibility({
        dashboardId: context?.dashboardId,
        tabId: context?.tabId,
        tabName: context?.tabName,
        layoutConfig: context?.layoutConfig ?? { sections: [] },
    })
    const savedItem = context?.layoutConfig.sections
        .flatMap((s) => s.items)
        .find((item) => item.chartId === chartId)
    const schemaColumns =
        customDashboardChartSchema?.metadata?.preferences?.columns
    const defaultVisibleColumns = useMemo(
        () =>
            (schemaColumns
                ? schemaColumns
                      .filter((c) => c.visible !== false)
                      .map((c) => c.column_id)
                : undefined) ??
            savedItem?.visibleColumns ??
            undefined,
        [schemaColumns, savedItem?.visibleColumns],
    )
    const isLoaded = context !== null ? context.isLoaded : true
    const tabId = context?.tabId

    const onSaveVisibleColumns = useCallback(
        (cols: ColumnConfig[]) => {
            saveVisibleColumns(
                chartId ?? '',
                cols.filter((c) => c.visible).map((c) => c.column_id),
            )
            onSaveColumns?.(cols)
        },
        [chartId, saveVisibleColumns, onSaveColumns],
    )

    const [savedColumns, setSavedColumns] = useState<ColumnConfig[]>(() => {
        const initial = schemaColumns
            ? schemaColumns.filter(
                  (c) => !nameColumnLabels.includes(c.column_id),
              )
            : defaultVisibleColumns
                  ?.filter((id) => !nameColumnLabels.includes(id))
                  .map((id) => ({ column_id: id, visible: true as const }))
        return (
            initial ??
            metricColumns.map((col) => ({
                column_id: col.accessorKey,
                visible: true as const,
            }))
        )
    })
    const [tableKey, setTableKey] = useState(`loading-preferences`)

    const handleSetSavedColumns = useCallback(
        (cols: ColumnConfig[]) =>
            setSavedColumns(
                cols.filter((c) => !nameColumnLabels.includes(c.column_id)),
            ),
        [nameColumnLabels],
    )

    useEffect(() => {
        if (isLoaded && defaultVisibleColumns !== undefined) {
            handleSetSavedColumns(
                schemaColumns ??
                    defaultVisibleColumns.map((id) => ({
                        column_id: id,
                        visible: true as const,
                    })),
            )
            setTableKey('loaded-preferences')
        }
    }, [isLoaded, defaultVisibleColumns, schemaColumns, handleSetSavedColumns])

    const renderFooter = useCallback(
        ({
            setIsOpen,
            visibleColumns,
            orderedColumns,
            setVisibleColumns,
        }: DataTableColumnEditingRenderProps) => (
            <ColumnEditingFooter
                setIsOpen={setIsOpen}
                columns={orderedColumns.map((column_id) => ({
                    column_id,
                    visible: visibleColumns.includes(column_id),
                }))}
                setVisibleColumns={setVisibleColumns}
                savedColumns={savedColumns}
                setSavedColumns={handleSetSavedColumns}
                onSaveVisibleColumns={onSaveVisibleColumns}
            />
        ),
        [savedColumns, handleSetSavedColumns, onSaveVisibleColumns],
    )

    return (
        <Box
            display="flex"
            flex={1}
            flexDirection="column"
            paddingTop={enableSearch && !isCustomDashboard ? '42px' : 0}
        >
            {isCustomDashboard && name && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                >
                    <Text className={css.tableLabel}>
                        Performance breakdown by {name}
                    </Text>
                    {actionMenu}
                </Box>
            )}
            <DataTable<TData>
                key={tableKey}
                data={data}
                columns={columns}
                withBorder
                isLoading={!isLoaded || (isAnyLoading && data.length === 0)}
                persistence={{
                    id: `reporting-${tabId}-${chartId}`,
                    url: false,
                    localStorage: true,
                }}
                sorting={{ enable: true, persist: true }}
                search={
                    enableSearch
                        ? {
                              enable: true,
                              getColumnCanFilter: (col) =>
                                  nameColumnLabels.includes(col.id),
                          }
                        : undefined
                }
                columnEditing={{
                    enable: true,
                    defaultVisibleColumns: [
                        ...nameColumnLabels,
                        ...savedColumns
                            .filter((c) => c.visible)
                            .map((c) => c.column_id),
                    ],
                    persist: false,
                }}
                pagination={{
                    enable: data.length > 10,
                    defaultValue: {
                        pageSize: 10,
                        pageIndex: 0,
                    },
                    persist: false,
                }}
                renderEmptyState={() => (
                    <NoDataPlaceholder height={100} marginBottom={0} />
                )}
            >
                <DataTableActions>
                    {DownloadButton}
                    {(!isCustomDashboard || !name) && actionMenu}
                </DataTableActions>
                <DataTableColumnEditing
                    label="Edit metrics"
                    footer={renderFooter}
                />
            </DataTable>
        </Box>
    )
}
