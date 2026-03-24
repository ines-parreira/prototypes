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
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import type { TransformedArticle } from '../../types'
import { MetricCell } from './MetricCells'
import { SortableHeaderCell } from './SortableHeaderCell'

import css from './SkillsTable.less'

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
}

export const getColumns = ({
    statsDisplayMode,
    metricsDateRange,
    isMetricsLoading = false,
    shopIntegrationId,
    outcomeCustomFieldId,
    intentCustomFieldId,
    totalAiAgentTickets = 0,
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

            return (
                <Box flexDirection="row" alignItems="center" gap="xs">
                    <TruncatedTextWithTooltip tooltipContent={article.title}>
                        <Text size="md" variant="bold">
                            {article.title}
                        </Text>
                    </TruncatedTextWithTooltip>
                    {hasDraft && (
                        <Tooltip
                            trigger={
                                <Box
                                    flexDirection="row"
                                    gap="xxxxs"
                                    className={css.draftCTA}
                                >
                                    <Icon
                                        color="content-neutral-tertiary"
                                        name="note-edit"
                                    />
                                    <Text
                                        size="md"
                                        color="content-neutral-tertiary"
                                    >
                                        Continue editing
                                    </Text>
                                </Box>
                            }
                        >
                            <TooltipContent caption="Unpublished changes" />
                        </Tooltip>
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
                tooltipTitle="Intents linked to the skill"
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
                tooltipTitle="Number of tickets using this skill"
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
                    value={Number(percentageValue)}
                    metricName={KnowledgeMetric.Tickets}
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={displayValue}
                    showProgressBar={true}
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
                    value={Number(percentageValue)}
                    metricName={KnowledgeMetric.HandoverTickets}
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={displayValue}
                    showProgressBar={true}
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
                    value={csat}
                    metricName={KnowledgeMetric.CSAT}
                    resourceSourceId={row.original.id}
                    resourceSourceSetId={metrics.resourceSourceSetId}
                    shopIntegrationId={shopIntegrationId ?? 0}
                    dateRange={metricsDateRange}
                    outcomeCustomFieldId={outcomeCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                    displayValue={formattedCsat}
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
