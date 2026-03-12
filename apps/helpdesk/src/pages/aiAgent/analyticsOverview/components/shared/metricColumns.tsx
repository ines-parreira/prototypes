import { formatMetricValue, NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, Icon, Skeleton, Text } from '@gorgias/axiom'

import { SortableHeaderCell } from 'pages/aiAgent/analyticsOverview/components/shared/SortableHeaderCell'

type MetricFormat = Parameters<typeof formatMetricValue>[1]

export type MetricLoadingStates = {
    automationRate: boolean
    automatedInteractions: boolean
    handovers: boolean
    timeSaved: boolean
    costSaved: boolean
}

export type MetricColumnConfig = {
    accessorKey: string
    label: string
    tooltipTitle: string
    tooltipCaption: string
    metricFormat: MetricFormat
    loadingStateKeys: (keyof MetricLoadingStates)[]
    skeletonWidth?: string
    showNotAvailable?: boolean
}

export function buildNameColumnDef<TRow>(
    accessor: string,
    label: string,
    className: string,
): ColumnDef<TRow> {
    return {
        accessorKey: accessor,
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="xxxs"
                    className={className}
                >
                    <Text size="sm" variant="bold">
                        {label}
                    </Text>
                    <span
                        style={{
                            visibility: sortDirection ? 'visible' : 'hidden',
                        }}
                    >
                        <Icon
                            name={
                                sortDirection === 'asc'
                                    ? 'arrow-down'
                                    : 'arrow-up'
                            }
                            size="xs"
                        />
                    </span>
                </Box>
            )
        },
        meta: { displayName: label },
        cell: (info) => (
            <Text size="md" variant="bold" className={className}>
                {info.getValue() as string}
            </Text>
        ),
        enableHiding: false,
    }
}

export function buildMetricColumnDefs<TRow>(
    columns: MetricColumnConfig[],
    loadingStates: MetricLoadingStates,
    getRowKey: (row: TRow) => string,
    headerClassName: string,
): ColumnDef<TRow>[] {
    return columns.map((config) => ({
        accessorKey: config.accessorKey,
        enableHiding: true,
        meta: { displayName: config.label },
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <SortableHeaderCell
                    label={config.label}
                    sortDirection={sortDirection}
                    tooltipTitle={config.tooltipTitle}
                    tooltipCaption={config.tooltipCaption}
                    className={headerClassName}
                />
            )
        },
        cell: (info) => {
            const value = info.getValue() as number | null
            const rowKey = getRowKey(info.row.original as TRow)
            const isLoading = config.loadingStateKeys.some(
                (key) => loadingStates[key],
            )
            if (isLoading && value === null) {
                return (
                    <Skeleton
                        key={`${rowKey}-${config.accessorKey}`}
                        width={config.skeletonWidth ?? '60px'}
                        height="20px"
                    />
                )
            }
            if (config.showNotAvailable && value !== null && isNaN(value)) {
                return NOT_AVAILABLE_PLACEHOLDER
            }
            return formatMetricValue(value, config.metricFormat, 'USD', true)
        },
    }))
}
