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
    return anyColumnHelper.accessor(
        (row) =>
            resolveDisplayName(
                row[config.accessor] as unknown as string,
                config,
            ),
        {
            id: config.accessor,
            header: config.label,
            enableHiding: false,
            minSize: 200,
            sortingFn: (rowA, rowB, columnId) => {
                const displayNameA = rowA.getValue<string>(columnId)
                const displayNameB = rowB.getValue<string>(columnId)
                return displayNameA.localeCompare(displayNameB)
            },
            cell: (info) => {
                const value = (info.row.original as Record<string, unknown>)[
                    config.accessor
                ] as string
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
        },
    ) as DataTableColumnDef<TData>
}

export function buildMetricColumnDefs<TData>(
    metricColumns: MetricColumnConfig[],
    loadingStates: MetricLoadingStates,
): DataTableColumnDef<TData>[] {
    return metricColumns.map(
        (config) =>
            anyColumnHelper.accessor(
                (row) => row[config.accessorKey] ?? undefined,
                {
                    id: config.accessorKey,
                    label: config.label,
                    enableHiding: true,
                    sortUndefined: 'last',
                    header: () => {
                        const tooltipTitle =
                            config.tooltipConfig?.title ??
                            config.tooltipTitle ??
                            config.label
                        const tooltipCaption =
                            config.tooltipConfig?.caption ??
                            config.tooltipCaption
                        const tooltipHref =
                            config.tooltipConfig?.link ?? config.tooltipLink
                        const tooltipLink = tooltipHref ? (
                            <a
                                href={tooltipHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={css.tooltipLink}
                            >
                                {config.tooltipConfig?.linkText ??
                                    'How is it calculated?'}
                            </a>
                        ) : undefined

                        // TooltipContent renders in its own portal so CSS
                        // inheritance from an outer wrapper doesn't reach it.
                        // Use custom children when caption has newlines so we can
                        // apply white-space: pre-wrap directly inside the portal.
                        const tooltipContent = tooltipCaption?.includes(
                            '\n',
                        ) ? (
                            <TooltipContent>
                                {tooltipTitle && (
                                    <div className={css.tooltipTitle}>
                                        <Text size="sm" variant="bold">
                                            {tooltipTitle}
                                        </Text>
                                    </div>
                                )}
                                {(tooltipCaption || tooltipLink) && (
                                    <div className={css.innerTooltip}>
                                        {tooltipCaption && (
                                            <Text size="sm">
                                                {tooltipCaption}
                                            </Text>
                                        )}
                                        {tooltipLink}
                                    </div>
                                )}
                            </TooltipContent>
                        ) : (
                            <TooltipContent
                                title={tooltipTitle}
                                caption={tooltipCaption}
                                link={tooltipLink}
                            />
                        )

                        return (
                            <Box display="flex" alignItems="center" gap="xxxs">
                                <Text variant="bold" size="sm">
                                    {config.label}
                                </Text>
                                {(config.tooltipConfig ||
                                    config.tooltipTitle) && (
                                    <Tooltip
                                        delay={0}
                                        trigger={<Icon name="info" size="xs" />}
                                    >
                                        {tooltipContent}
                                    </Tooltip>
                                )}
                            </Box>
                        )
                    },
                    cell: (info) => {
                        const value = (
                            info.row.original as Record<string, number | null>
                        )[config.accessorKey]
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
                            if (
                                customCell !== null &&
                                customCell !== undefined
                            ) {
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
                },
            ) as DataTableColumnDef<TData>,
    )
}
