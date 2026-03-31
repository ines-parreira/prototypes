import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Button,
    Icon,
    Skeleton,
    Text,
    ToggleField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { CUSTOM_FIELD_AI_AGENT_HANDOVER } from 'domains/reporting/hooks/automate/types'
import { IntentMetric } from 'domains/reporting/state/ui/stats/types'
import { TruncatedTextWithTooltip } from 'pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip'

import type { TransformedIntent } from '../../hooks/useIntentsTable'
import { HANDOVER_ONLY_INTENTS } from '../../hooks/useIntentsTable'
import { IntentStatus } from '../../types'
import { MetricCell } from '../SharedTableComponents/MetricCells'
import { SortableHeaderCell } from '../SkillsTable/SortableHeaderCell'

import css from './IntentsTable.less'

const TOOLTIP_MESSAGES = {
    L1_DISABLED:
        'L1 intents are not linkable. Check L2 intents to enable or disable them.',
    L2_LINKED:
        'This intent is linked to a skill. Open the linked skill to turn it off or remove this intent from it.',
    HANDOVER_ONLY:
        'This intent is set to handover only and cannot be linked to a skill.',
} as const

export const COLUMN_IDS = {
    EXPAND: 'expand',
    INTENT: 'intent',
    TICKET_VOLUME: 'ticketVolume',
    HANDOVER: 'handover',
    LINK: 'link',
    ENABLED: 'enabled',
} as const

export type StatsDisplayMode = 'percentage' | 'numeric'

interface GetColumnsParams {
    statsDisplayMode: StatsDisplayMode
    isMetricsLoading?: boolean
    onToggleEnabled: (intentId: string, enabled: boolean) => void
    onLinkToSkill: (intentId: string) => void
    expandedRows: Set<string>
    onToggleExpanded: (rowId: string) => void
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    integrationIds?: string[]
    metricsDateRange?: { start_datetime: string; end_datetime: string }
}

export const getColumns = ({
    statsDisplayMode,
    isMetricsLoading = false,
    onToggleEnabled,
    onLinkToSkill,
    expandedRows,
    onToggleExpanded,
    outcomeCustomFieldId,
    intentCustomFieldId,
    integrationIds = [],
    metricsDateRange,
}: GetColumnsParams): ColumnDef<TransformedIntent>[] => {
    return [
        {
            id: COLUMN_IDS.EXPAND,
            header: () => null,
            cell: ({ row }) => {
                const intent = row.original
                const isParent = !!intent.children && intent.children.length > 0
                const isExpanded = expandedRows.has(intent.id)

                if (!isParent) {
                    return null
                }

                return (
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon={
                            isExpanded
                                ? 'arrow-chevron-down'
                                : 'arrow-chevron-right'
                        }
                        onClick={() => onToggleExpanded(intent.id)}
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    />
                )
            },
            enableSorting: false,
        },
        {
            id: COLUMN_IDS.INTENT,
            accessorKey: 'formattedName',
            header: (info) => (
                <SortableHeaderCell
                    label="Intent"
                    sortDirection={info.column.getIsSorted()}
                />
            ),
            cell: ({ row }) => {
                const intent = row.original
                const isChild = !!intent.parentId

                return (
                    <Box flexDirection="column">
                        <Text size="md" variant={isChild ? 'regular' : 'bold'}>
                            {intent.formattedName}
                        </Text>
                        {intent.description && (
                            <div className={css.descriptionWrapper}>
                                <TruncatedTextWithTooltip
                                    tooltipContent={intent.description}
                                >
                                    <Text
                                        size="xs"
                                        color="content-neutral-secondary"
                                    >
                                        {intent.description}
                                    </Text>
                                </TruncatedTextWithTooltip>
                            </div>
                        )}
                    </Box>
                )
            },
            enableSorting: true,
        },
        {
            id: COLUMN_IDS.TICKET_VOLUME,
            accessorFn: (row) => row.metrics?.ticketVolume ?? null,
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

                if (!metrics || metrics.ticketVolume === 0) {
                    return <Text>--</Text>
                }

                const displayValue =
                    statsDisplayMode === 'percentage'
                        ? `${metrics.ticketVolumePercent}%`
                        : String(metrics.ticketVolume)

                if (
                    !metricsDateRange ||
                    !outcomeCustomFieldId ||
                    !intentCustomFieldId
                ) {
                    return <Text>{displayValue}</Text>
                }

                return (
                    <MetricCell
                        type="intent"
                        metricName={IntentMetric.TicketVolume}
                        value={metrics.ticketVolumePercent}
                        intentName={row.original.name}
                        displayValue={displayValue}
                        title="Ticket volume"
                        outcomeCustomFieldId={outcomeCustomFieldId}
                        intentCustomFieldId={intentCustomFieldId}
                        integrationIds={integrationIds}
                        dateRange={metricsDateRange}
                        showProgressBar={true}
                    />
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.HANDOVER,
            accessorFn: (row) => row.metrics?.handoverCount ?? null,
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

                if (!metrics || metrics.handoverCount === 0) {
                    return <Text>--</Text>
                }

                const displayValue =
                    statsDisplayMode === 'percentage'
                        ? `${metrics.handoverPercent}%`
                        : String(metrics.handoverCount)

                if (
                    !metricsDateRange ||
                    !outcomeCustomFieldId ||
                    !intentCustomFieldId
                ) {
                    return <Text>{displayValue}</Text>
                }

                return (
                    <MetricCell
                        type="intent"
                        metricName={IntentMetric.Handover}
                        value={metrics.handoverPercent}
                        intentName={row.original.name}
                        displayValue={displayValue}
                        title="Handover"
                        outcomeCustomFieldId={outcomeCustomFieldId}
                        intentCustomFieldId={intentCustomFieldId}
                        integrationIds={integrationIds}
                        dateRange={metricsDateRange}
                        outcomeValue={CUSTOM_FIELD_AI_AGENT_HANDOVER}
                        showProgressBar={true}
                    />
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.LINK,
            header: () => null,
            cell: ({ row }) => {
                const intent = row.original
                const isParent = !!intent.children && intent.children.length > 0

                if (isParent) {
                    return null
                }

                const isHandoverOnlyIntent =
                    intent.name === 'other::no reply' ||
                    intent.name === 'other::spam'

                if (isHandoverOnlyIntent) {
                    return null
                }

                const hasArticles =
                    intent.articles && intent.articles.length > 0

                if (!hasArticles) {
                    return (
                        <Button
                            variant="secondary"
                            size="sm"
                            trailingSlot="arrow-chevron-down"
                            onClick={() => onLinkToSkill(intent.id)}
                        >
                            Link to skill
                        </Button>
                    )
                }

                const articleTitle = intent.articles?.[0]?.title || ''

                return (
                    <div
                        role="none"
                        tabIndex={0}
                        className={css.linkedSkillRow}
                        onClick={() => onLinkToSkill(intent.id)}
                    >
                        <TruncatedTextWithTooltip tooltipContent={articleTitle}>
                            <Text size="md" color="content-accent-default">
                                {articleTitle}
                            </Text>
                        </TruncatedTextWithTooltip>
                        <Icon
                            name="external-link"
                            size="sm"
                            color="content-accent-default"
                        />
                    </div>
                )
            },
        },
        {
            id: COLUMN_IDS.ENABLED,
            accessorKey: 'toggleState',
            header: (info) => (
                <SortableHeaderCell
                    label="Enabled"
                    sortDirection={info.column.getIsSorted()}
                />
            ),
            cell: ({ row }) => {
                const intent = row.original
                const isParent = !!intent.children
                const isHandoverOnly = HANDOVER_ONLY_INTENTS.includes(
                    intent.name,
                )
                const isDisabled =
                    isParent ||
                    intent.status === IntentStatus.Linked ||
                    isHandoverOnly
                const toggleValue = intent.toggleState === 'enabled'

                const toggle = (
                    <ToggleField
                        value={toggleValue}
                        onChange={(enabled) =>
                            onToggleEnabled(intent.id, enabled)
                        }
                        isDisabled={isDisabled}
                    />
                )

                if (!isDisabled) {
                    return toggle
                }

                const tooltipMessage = isParent
                    ? TOOLTIP_MESSAGES.L1_DISABLED
                    : isHandoverOnly
                      ? TOOLTIP_MESSAGES.HANDOVER_ONLY
                      : TOOLTIP_MESSAGES.L2_LINKED

                return (
                    <Tooltip trigger={toggle}>
                        <TooltipContent caption={tooltipMessage} />
                    </Tooltip>
                )
            },
            enableSorting: false,
        },
    ]
}
