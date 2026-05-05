import type { DataTableColumnDef } from '@gorgias/axiom'
import {
    Avatar,
    Box,
    createColumnHelper,
    DataTableBaseCell,
    Icon,
    Link,
    OverflowTooltip,
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

import css from './columnBuilders.less'

const anyColumnHelper = createColumnHelper<Record<string, number | null>>()

function resolveDisplayName(value: string, config: NameColumnConfig): string {
    return config.formatName
        ? config.formatName(value)
        : (config.displayNames?.[value] ?? value)
}

export function buildNameColDef<TData>(
    config: NameColumnConfig,
): DataTableColumnDef<TData> {
    return anyColumnHelper.accessor(config.accessor, {
        id: config.accessor,
        header: config.label,
        enableHiding: false,
        minSize: 200,
        sortingFn: (rowA, rowB, columnId) => {
            const valueA = rowA.getValue<string>(columnId)
            const valueB = rowB.getValue<string>(columnId)
            const displayNameA = resolveDisplayName(valueA, config)
            const displayNameB = resolveDisplayName(valueB, config)
            return displayNameA.localeCompare(displayNameB)
        },
        cell: (info) => {
            const value = info.getValue()
            const displayName = resolveDisplayName(value, config)
            const href = config.getHref?.(value)

            const avatarProps = config.getAvatarProps?.(value)

            return (
                <DataTableBaseCell
                    display="flex"
                    alignItems="center"
                    gap="xxxs"
                    maxWidth={250}
                    minWidth={180}
                >
                    {avatarProps && (
                        <Avatar
                            name={avatarProps.name}
                            url={avatarProps.url}
                            size="sm"
                        />
                    )}
                    <OverflowTooltip>
                        <Text size="md" variant="bold" overflow="ellipsis">
                            {displayName}
                        </Text>
                    </OverflowTooltip>
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

                    {config.renderDrilldown?.(value)}
                </DataTableBaseCell>
            )
        },
    }) as DataTableColumnDef<TData>
}

export function buildMetricColumnDefs<TData>(
    metricColumns: MetricColumnConfig[],
    loadingStates: MetricLoadingStates,
): DataTableColumnDef<TData>[] {
    return metricColumns.map(
        (config) =>
            anyColumnHelper.accessor(config.accessorKey, {
                id: config.accessorKey,
                label: config.label,
                enableHiding: true,
                header: () => (
                    <Box display="flex" alignItems="center" gap="xxxs">
                        <Text variant="bold" size="sm">
                            {config.label}
                        </Text>
                        {(config.tooltipConfig || config.tooltipTitle) && (
                            <Tooltip
                                delay={0}
                                trigger={<Icon name="info" size="xs" />}
                            >
                                <TooltipContent
                                    title={
                                        config.tooltipConfig?.title ??
                                        config.tooltipTitle ??
                                        config.label
                                    }
                                    caption={
                                        config.tooltipConfig?.caption ??
                                        config.tooltipCaption
                                    }
                                    link={
                                        (config.tooltipConfig?.link ??
                                        config.tooltipLink) ? (
                                            <a
                                                href={
                                                    config.tooltipConfig
                                                        ?.link ??
                                                    config.tooltipLink!
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={css.tooltipLink}
                                            >
                                                {config.tooltipConfig
                                                    ?.linkText ??
                                                    'How is it calculated?'}
                                            </a>
                                        ) : undefined
                                    }
                                />
                            </Tooltip>
                        )}
                    </Box>
                ),
                cell: (info) => {
                    const value = info.getValue()
                    const isLoading = config.loadingStateKeys.some(
                        (key) => loadingStates[key],
                    )
                    if (isLoading && value === null) {
                        return (
                            <DataTableBaseCell>
                                <Skeleton
                                    width={config.skeletonWidth ?? '60px'}
                                    height="20px"
                                />
                            </DataTableBaseCell>
                        )
                    }
                    if (config.renderCell) {
                        const customCell = config.renderCell(
                            value,
                            info.row.original as Record<string, unknown>,
                        )
                        if (customCell !== null && customCell !== undefined) {
                            return (
                                <DataTableBaseCell>
                                    {customCell}
                                </DataTableBaseCell>
                            )
                        }
                    }
                    return (
                        <DataTableBaseCell>
                            {config.showNotAvailable &&
                            value !== null &&
                            isNaN(value)
                                ? NOT_AVAILABLE_PLACEHOLDER
                                : formatMetricValue(
                                      value,
                                      config.metricFormat,
                                      'USD',
                                      true,
                                  )}
                        </DataTableBaseCell>
                    )
                },
            }) as DataTableColumnDef<TData>,
    )
}
