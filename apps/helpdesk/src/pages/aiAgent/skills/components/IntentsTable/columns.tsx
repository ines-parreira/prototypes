import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    Button,
    Icon,
    ListItem,
    ListSection,
    Select,
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
    L2_LINKED:
        'This intent is linked to a skill. Open the linked skill to turn it off or remove this intent from it.',
    HANDOVER_ONLY:
        'This intent is set to handover only and cannot be linked to a skill.',
    INTENT_DISABLED:
        'Intent is disabled. Any conversations that match this intent, will be handover to an agent.',
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
    onLinkToExistingSkill: (intentId: string) => void
    onCreateNewSkill: (intentName: string, intentTitle?: string) => void
    onOpenSkill: (skillId: number) => void
    hasExistingSkills: boolean
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
    onLinkToExistingSkill,
    onCreateNewSkill,
    onOpenSkill,
    hasExistingSkills,
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
                        ? `${metrics.ticketVolumePercent.toFixed(1)}%`
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
                        showProgressBar={statsDisplayMode === 'percentage'}
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
                        showProgressBar={statsDisplayMode === 'percentage'}
                    />
                )
            },
            enableSorting: true,
            sortUndefined: -1,
        },
        {
            id: COLUMN_IDS.LINK,
            header: (info) => (
                <SortableHeaderCell
                    label="Linked skill"
                    sortDirection={info.column.getIsSorted()}
                />
            ),
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
                    const linkOptions = [
                        {
                            id: 'link-options',
                            items: [
                                {
                                    id: 'existing-skill',
                                    label: 'Existing skill',
                                },
                                { id: 'new-skill', label: 'New skill' },
                            ],
                        },
                    ]

                    return (
                        <Select
                            items={linkOptions}
                            onSelect={(item: { id: string; label: string }) => {
                                if (item.id === 'existing-skill') {
                                    onLinkToExistingSkill(intent.id)
                                } else {
                                    onCreateNewSkill(
                                        intent.name,
                                        intent.description,
                                    )
                                }
                            }}
                            aria-label="Link to skill"
                            trigger={({ ref, isOpen }) => (
                                <Button
                                    ref={ref}
                                    variant="secondary"
                                    size="sm"
                                    trailingSlot={
                                        isOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                >
                                    Link to skill
                                </Button>
                            )}
                        >
                            {(section: {
                                id: string
                                items: { id: string; label: string }[]
                            }) => (
                                <ListSection
                                    id={section.id}
                                    items={section.items}
                                >
                                    {(item: { id: string; label: string }) => (
                                        <ListItem
                                            id={item.id}
                                            textValue={item.label}
                                            label={item.label}
                                            isDisabled={
                                                item.id === 'existing-skill' &&
                                                !hasExistingSkills
                                            }
                                        />
                                    )}
                                </ListSection>
                            )}
                        </Select>
                    )
                }

                const article = intent.articles?.[0]
                const articleTitle = article?.title || ''

                return (
                    <div
                        role="none"
                        tabIndex={0}
                        className={css.linkedSkillRow}
                        onClick={() => onOpenSkill(article!.id)}
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
                const isParent = !!intent.children && intent.children.length > 0
                const isLinked = intent.status === IntentStatus.Linked
                const isHandoverOnly = HANDOVER_ONLY_INTENTS.includes(
                    intent.name,
                )
                const isDisabled = isLinked || isHandoverOnly
                const isIntentDisabled = intent.toggleState === 'disabled'
                const toggleValue = intent.toggleState === 'enabled'

                if (isParent) {
                    return null
                }

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
                    if (isIntentDisabled) {
                        return (
                            <Tooltip trigger={toggle}>
                                <TooltipContent
                                    caption={TOOLTIP_MESSAGES.INTENT_DISABLED}
                                />
                            </Tooltip>
                        )
                    }
                    return toggle
                }

                const tooltipMessage = isLinked
                    ? TOOLTIP_MESSAGES.L2_LINKED
                    : TOOLTIP_MESSAGES.HANDOVER_ONLY

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
