import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Icon,
    Link,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { NOT_AVAILABLE_PLACEHOLDER } from '../../constants'
import { formatMetricValue } from '../../utils/helpers'
import type {
    MetricColumnConfig,
    MetricLoadingStates,
    NameColumnConfig,
} from './types'

import css from './ReportingMetricBreakdownTable.less'

export function buildNameColDef<TData>(
    config: NameColumnConfig<TData>,
): ColumnDef<TData> {
    return {
        accessorKey: config.accessor,
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="xxxs"
                    className={css.featureName}
                >
                    <Text size="sm" variant="bold">
                        {config.label}
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
        meta: { displayName: config.label },
        cell: (info) => {
            const value = info.getValue() as string
            const displayName = config.formatName
                ? config.formatName(value)
                : (config.displayNames?.[value] ?? value)
            const href = config.getHref?.(value)

            return (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="xxxs"
                    className={css.featureName}
                >
                    <Text size="md" variant="bold">
                        {displayName}
                    </Text>
                    {href && (
                        <Link
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${displayName}`}
                        >
                            <Icon name="external-link" size="xs" />
                        </Link>
                    )}
                </Box>
            )
        },
        enableHiding: false,
    }
}

export function buildMetricColumnDefs<TRow>(
    metricColumns: MetricColumnConfig[],
    loadingStates: MetricLoadingStates,
    getRowKey: (row: TRow) => string,
): ColumnDef<TRow>[] {
    return metricColumns.map((config) => ({
        accessorKey: config.accessorKey,
        enableHiding: true,
        meta: { displayName: config.label },
        header: (info) => {
            const sortDirection = info.column.getIsSorted()
            return (
                <Box display="flex" alignItems="center" gap="xxxs">
                    <span>{config.label}</span>
                    {config.tooltipTitle && (
                        <Tooltip
                            delay={0}
                            trigger={<Icon name="info" size="xs" />}
                        >
                            <TooltipContent
                                title={config.tooltipTitle}
                                caption={config.tooltipCaption}
                            />
                        </Tooltip>
                    )}
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
