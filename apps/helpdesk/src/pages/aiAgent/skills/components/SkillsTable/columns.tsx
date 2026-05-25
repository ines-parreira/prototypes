import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
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

import type { TransformedArticle } from '../../types'
import { MetricCell } from '../SharedTableComponents/MetricCells'
import { SortableHeaderCell } from './SortableHeaderCell'

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
}: GetColumnsParams): ColumnDef<TransformedArticle>[] => [
    {
        id: COLUMN_IDS.NAME,
        accessorKey: 'title',
        header: (info) => (
            <SortableHeaderCell
                label="Name"
                sortDirection={info.column.getIsSorted()}
            />
        ),
        cell: ({ row }) => {
            const article = row.original
            const hasDraft = !!article.draftVersion
            const hasSetupRequired = hasSetupRequiredGuidanceAction(
                article.content,
                availableActions,
            )

            return (
                <Box flexDirection="row" alignItems="center" gap="xs">
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
                </Box>
            )
        },
        enableSorting: true,
    },
    {
        id: COLUMN_IDS.INTENTS,
        accessorFn: (row) => row.intents.length,
        header: (info) => (
            <SortableHeaderCell
                label="Intents"
                sortDirection={info.column.getIsSorted()}
                tooltipTitle="Intents are how Gorgias classifies what a conversation is about. When AI Agent detects a linked intent, it follows that skill's instructions."
            />
        ),
        cell: ({ row }) => {
            const intents = row.original.intents

            if (intents.length === 0) {
                return <Text>-</Text>
            }

            const firstIntent = intents[0]
            const remainingCount = intents.length - 1

            return (
                <Box flexDirection="row" alignItems="center" gap="xxxs">
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
                </Box>
            )
        },
        enableSorting: true,
    },
    {
        id: COLUMN_IDS.TICKET_VOLUME,
        accessorFn: (row) => row.metrics?.tickets ?? null,
        header: (info) => (
            <SortableHeaderCell
                label="Ticket volume"
                sortDirection={info.column.getIsSorted()}
            />
        ),
        cell: ({ row }) => {
            if (isMetricsLoading) {
                return <Skeleton width={40} />
            }

            const metrics = row.original.metrics

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
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={displayValue}
                    title="Tickets"
                    showProgressBar={statsDisplayMode === 'percentage'}
                />
            )
        },
        enableSorting: true,
        sortUndefined: -1,
    },
    {
        id: COLUMN_IDS.HANDOVER,
        accessorFn: (row) => row.metrics?.handoverTickets ?? null,
        header: (info) => (
            <SortableHeaderCell
                label="Handover"
                sortDirection={info.column.getIsSorted()}
            />
        ),
        cell: ({ row }) => {
            if (isMetricsLoading) {
                return <Skeleton width={40} />
            }

            const metrics = row.original.metrics

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
                skillTicketVolume > 0 ? (value / skillTicketVolume) * 100 : 0

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
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={displayValue}
                    title="Handover tickets"
                    showProgressBar={statsDisplayMode === 'percentage'}
                />
            )
        },
        enableSorting: true,
        sortUndefined: -1,
    },
    {
        id: COLUMN_IDS.AVERAGE_CSAT,
        accessorFn: (row) => row.metrics?.csat ?? null,
        header: (info) => (
            <SortableHeaderCell
                label="Average CSAT"
                sortDirection={info.column.getIsSorted()}
            />
        ),
        cell: ({ row }) => {
            if (isMetricsLoading) {
                return <Skeleton width={40} />
            }

            const metrics = row.original.metrics

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
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={formattedCsat}
                    title="CSAT"
                    showProgressBar={false}
                />
            )
        },
        enableSorting: true,
        sortUndefined: -1,
    },
    {
        id: COLUMN_IDS.STATUS,
        accessorKey: 'status',
        header: (info) => (
            <SortableHeaderCell
                label="Status"
                sortDirection={info.column.getIsSorted()}
            />
        ),
        cell: ({ row }) => {
            const status = row.original.status

            return (
                <Tag size="sm" color={status === 'enabled' ? 'green' : 'grey'}>
                    {status === 'enabled' ? 'Enabled' : 'Disabled'}
                </Tag>
            )
        },
        enableSorting: true,
    },
]
