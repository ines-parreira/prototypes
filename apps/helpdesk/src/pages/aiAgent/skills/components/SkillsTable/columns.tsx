import type { DataTableColumnDef } from '@gorgias/axiom'
import {
    Box,
    DataTableBaseCell,
    Icon,
    Skeleton,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { GuidanceActionsBadge } from 'pages/aiAgent/components/GuidanceList/GuidanceActionsBadge'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { isActionSetupRequired } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import { copilotAnchorProps } from 'copilot/uiActions'

import type { TransformedArticle } from '../../types'
import { MetricCell } from '../SharedTableComponents/MetricCells'
import { SuccessRateCell } from './SuccessRateCell'

import css from './SkillsTable.less'

const hasSetupRequiredGuidanceAction = (
    content: string,
    availableActions: GuidanceAction[],
) => {
    const mentionedIds = new Set(
        [...content.matchAll(new RegExp(guidanceActionRegex.source, 'g'))].map(
            ([, id]) => id,
        ),
    )

    return availableActions.some(
        (action) =>
            mentionedIds.has(action.value) && isActionSetupRequired(action),
    )
}

export const COLUMN_IDS = {
    NAME: 'name',
    INTENTS: 'intents',
    TICKET_VOLUME: 'ticketVolume',
    HANDOVER: 'handover',
    AVERAGE_CSAT: 'averageCsat',
    SUCCESS_RATE: 'successRate',
    STATUS: 'status',
} as const

export type StatsDisplayMode = 'percentage' | 'numeric'

interface GetColumnsParams {
    statsDisplayMode: StatsDisplayMode
    metricsDateRange?: { start_datetime: string; end_datetime: string }
    isMetricsLoading?: boolean
    shopIntegrationId?: number
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    totalAiAgentTickets?: number
    availableActions?: GuidanceAction[]
    isNewReportingLayerEnabled?: boolean
}

export const getColumns = ({
    statsDisplayMode,
    metricsDateRange,
    isMetricsLoading = false,
    shopIntegrationId,
    outcomeCustomFieldId,
    intentCustomFieldId,
    totalAiAgentTickets = 0,
    availableActions = [],
    isNewReportingLayerEnabled = false,
}: GetColumnsParams): DataTableColumnDef<TransformedArticle>[] => {
    const ticketVolumeLabel = isNewReportingLayerEnabled
        ? 'Tickets'
        : 'Ticket volume'
    const handoverLabel = isNewReportingLayerEnabled ? 'Handovers' : 'Handover'
    const csatLabel = isNewReportingLayerEnabled ? 'CSAT' : 'Average CSAT'

    const columns: DataTableColumnDef<TransformedArticle>[] = [
        {
            id: COLUMN_IDS.NAME,
            accessorKey: 'title',
            header: 'Name',
            size: 378,
            minSize: 378,
            maxSize: 378,
            cell: (info) => {
                const article = info.row.original
                const hasDraft = !!article.draftVersion
                const hasSetupRequired = hasSetupRequiredGuidanceAction(
                    article.content,
                    availableActions,
                )

                return (
                    <DataTableBaseCell
                        {...info}
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        {...copilotAnchorProps({
                            type: 'skill',
                            id: article.id,
                        })}
                    >
                        <div className={css.titleWrapper}>
                            <TruncatedTextWithTooltip
                                tooltipContent={article.title}
                            >
                                <Text size="md">{article.title}</Text>
                            </TruncatedTextWithTooltip>
                        </div>
                        <GuidanceActionsBadge
                            article={
                                { content: article.content } as GuidanceArticle
                            }
                            availableActions={availableActions}
                        />
                        {hasDraft && !hasSetupRequired && (
                            <Box
                                flexDirection="row"
                                gap="xxxxs"
                                className={css.draftCTA}
                            >
                                <Tooltip
                                    trigger={
                                        <Icon
                                            color="content-neutral-tertiary"
                                            name="note-edit"
                                        />
                                    }
                                >
                                    <TooltipContent caption="Continue editing this draft" />
                                </Tooltip>
                                <Text
                                    size="md"
                                    color="content-neutral-tertiary"
                                    wrap="nowrap"
                                >
                                    Continue editing
                                </Text>
                            </Box>
                        )}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
        },
        {
            id: COLUMN_IDS.INTENTS,
            accessorFn: (row) => row.intents.length,
            label: 'Intents',
            size: 288,
            minSize: 288,
            maxSize: 288,
            header: () => (
                <Box flexDirection="row" alignItems="center" gap="xxxs">
                    <Text size="sm" variant="bold">
                        Intents
                    </Text>
                    <Tooltip trigger={<Icon name="info" size="sm" />}>
                        <TooltipContent title="Intents are how Gorgias classifies what a conversation is about. When AI Agent detects a linked intent, it follows that skill's instructions." />
                    </Tooltip>
                </Box>
            ),
            cell: (info) => {
                const intents = info.row.original.intents

                if (intents.length === 0) {
                    return (
                        <DataTableBaseCell {...info}>
                            <Text>-</Text>
                        </DataTableBaseCell>
                    )
                }

                const firstIntent = intents[0]
                const remainingCount = intents.length - 1

                return (
                    <DataTableBaseCell
                        {...info}
                        flexDirection="row"
                        alignItems="center"
                        gap="xxxs"
                    >
                        <Tag size="sm">{firstIntent.formattedName}</Tag>
                        {remainingCount > 0 && (
                            <Tooltip
                                trigger={
                                    <div className={css.additionalIntentsCount}>
                                        <Text size="sm" variant="bold">
                                            +{remainingCount}
                                        </Text>
                                    </div>
                                }
                            >
                                <TooltipContent>
                                    <Box flexDirection="column">
                                        {intents.slice(1).map((intent) => (
                                            <Text key={intent.name} size="sm">
                                                {intent.formattedName}
                                            </Text>
                                        ))}
                                    </Box>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
        },
        {
            id: COLUMN_IDS.TICKET_VOLUME,
            accessorFn: (row) => row.metrics?.tickets ?? null,
            header: ticketVolumeLabel,
            size: 132,
            minSize: 132,
            maxSize: 132,
            isInteractive: true,
            cell: (info) => {
                const renderContent = () => {
                    if (isMetricsLoading) {
                        return <Skeleton width={40} />
                    }

                    const metrics = info.row.original.metrics

                    if (
                        !metrics ||
                        metrics.tickets === null ||
                        metrics.tickets === undefined
                    ) {
                        return <Text>--</Text>
                    }

                    const value = metrics.tickets

                    const percentageRaw =
                        totalAiAgentTickets > 0
                            ? (value / totalAiAgentTickets) * 100
                            : 0
                    const percentageValue = Number.isInteger(percentageRaw)
                        ? percentageRaw.toString()
                        : percentageRaw.toFixed(1)

                    const displayValue =
                        statsDisplayMode === 'percentage'
                            ? `${percentageValue}%`
                            : String(value)

                    if (!metricsDateRange || value === 0) {
                        return <Text>{displayValue}</Text>
                    }

                    return (
                        <MetricCell
                            type="knowledge"
                            value={Number(percentageValue)}
                            metricName={KnowledgeMetric.Tickets}
                            resourceSourceId={info.row.original.id}
                            resourceSourceSetId={metrics.resourceSourceSetId}
                            shopIntegrationId={shopIntegrationId ?? 0}
                            dateRange={metricsDateRange}
                            outcomeCustomFieldId={outcomeCustomFieldId}
                            intentCustomFieldId={intentCustomFieldId}
                            displayValue={displayValue}
                            title="Tickets"
                            showProgressBar={statsDisplayMode === 'percentage'}
                            isSkillScoped={true}
                        />
                    )
                }

                return (
                    <DataTableBaseCell {...info} isInteractive>
                        {renderContent()}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.HANDOVER,
            accessorFn: (row) => row.metrics?.handoverTickets ?? null,
            header: handoverLabel,
            size: 132,
            minSize: 132,
            maxSize: 132,
            isInteractive: true,
            cell: (info) => {
                const renderContent = () => {
                    if (isMetricsLoading) {
                        return <Skeleton width={40} />
                    }

                    const metrics = info.row.original.metrics

                    if (
                        !metrics ||
                        metrics.handoverTickets === null ||
                        metrics.handoverTickets === undefined
                    ) {
                        return <Text>--</Text>
                    }

                    const value = metrics.handoverTickets
                    const skillTicketVolume = metrics.tickets ?? 0

                    const percentageRaw =
                        skillTicketVolume > 0
                            ? (value / skillTicketVolume) * 100
                            : 0

                    const percentageValue = Number.isInteger(percentageRaw)
                        ? percentageRaw.toString()
                        : percentageRaw.toFixed(1)

                    const displayValue =
                        statsDisplayMode === 'percentage'
                            ? `${percentageValue}%`
                            : String(value)

                    if (!metricsDateRange || value === 0) {
                        return <Text>{displayValue}</Text>
                    }

                    return (
                        <MetricCell
                            type="knowledge"
                            value={Number(percentageValue)}
                            metricName={KnowledgeMetric.HandoverTickets}
                            resourceSourceId={info.row.original.id}
                            resourceSourceSetId={metrics.resourceSourceSetId}
                            shopIntegrationId={shopIntegrationId ?? 0}
                            dateRange={metricsDateRange}
                            outcomeCustomFieldId={outcomeCustomFieldId}
                            intentCustomFieldId={intentCustomFieldId}
                            displayValue={displayValue}
                            title="Handover tickets"
                            showProgressBar={statsDisplayMode === 'percentage'}
                            isSkillScoped={true}
                        />
                    )
                }

                return (
                    <DataTableBaseCell {...info} isInteractive>
                        {renderContent()}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.AVERAGE_CSAT,
            accessorFn: (row) => row.metrics?.csat ?? null,
            header: csatLabel,
            size: 119,
            minSize: 119,
            maxSize: 119,
            isInteractive: true,
            cell: (info) => {
                const renderContent = () => {
                    if (isMetricsLoading) {
                        return <Skeleton width={40} />
                    }

                    const metrics = info.row.original.metrics

                    if (
                        !metrics ||
                        metrics.csat === null ||
                        metrics.csat === undefined
                    ) {
                        return <Text>--</Text>
                    }

                    const csat = metrics.csat
                    const formattedCsat = Number.isInteger(csat)
                        ? csat.toString()
                        : csat.toFixed(1)

                    if (!metricsDateRange) {
                        return <Text>{formattedCsat}</Text>
                    }

                    return (
                        <MetricCell
                            type="knowledge"
                            value={csat}
                            metricName={KnowledgeMetric.CSAT}
                            resourceSourceId={info.row.original.id}
                            resourceSourceSetId={metrics.resourceSourceSetId}
                            shopIntegrationId={shopIntegrationId ?? 0}
                            dateRange={metricsDateRange}
                            outcomeCustomFieldId={outcomeCustomFieldId}
                            intentCustomFieldId={intentCustomFieldId}
                            displayValue={formattedCsat}
                            title="CSAT"
                            showProgressBar={false}
                            isSkillScoped={true}
                        />
                    )
                }

                return (
                    <DataTableBaseCell {...info} isInteractive>
                        {renderContent()}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.STATUS,
            accessorKey: 'status',
            header: 'Status',
            size: 95,
            minSize: 95,
            maxSize: 95,
            cell: (info) => {
                const status = info.row.original.status

                return (
                    <DataTableBaseCell {...info}>
                        <Tag
                            size="sm"
                            color={status === 'enabled' ? 'green' : 'grey'}
                        >
                            {status === 'enabled' ? 'Enabled' : 'Disabled'}
                        </Tag>
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
        },
    ]

    if (isNewReportingLayerEnabled) {
        const successRateColumn: DataTableColumnDef<TransformedArticle> = {
            id: COLUMN_IDS.SUCCESS_RATE,
            accessorFn: (row) => row.metrics?.successRate ?? null,
            label: 'Success rate',
            size: 132,
            minSize: 132,
            maxSize: 132,
            isInteractive: true,
            header: () => (
                <Box flexDirection="row" alignItems="center" gap="xxxs">
                    <Text size="sm" variant="bold">
                        Success rate
                    </Text>
                    <Tooltip trigger={<Icon name="info" size="sm" />}>
                        <TooltipContent title="Percent of AI Agent interactions fully resolved without human handover" />
                    </Tooltip>
                </Box>
            ),
            cell: (info) => {
                const renderContent = () => {
                    if (isMetricsLoading) {
                        return <Skeleton width={40} />
                    }

                    const metrics = info.row.original.metrics
                    const successRate = metrics?.successRate

                    if (
                        !metrics ||
                        successRate === null ||
                        successRate === undefined ||
                        !metricsDateRange
                    ) {
                        return <Text>--</Text>
                    }

                    return (
                        <SuccessRateCell
                            value={successRate}
                            prevValue={metrics.prevSuccessRate ?? null}
                            resourceSourceId={info.row.original.id}
                            resourceSourceSetId={metrics.resourceSourceSetId}
                            shopIntegrationId={shopIntegrationId ?? 0}
                            dateRange={metricsDateRange}
                            outcomeCustomFieldId={outcomeCustomFieldId}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    )
                }

                return (
                    <DataTableBaseCell {...info} isInteractive>
                        {renderContent()}
                    </DataTableBaseCell>
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        }
        const ticketVolumeIndex = columns.findIndex(
            (col) => col.id === COLUMN_IDS.TICKET_VOLUME,
        )
        columns.splice(ticketVolumeIndex, 0, successRateColumn)
    }

    return columns
}
