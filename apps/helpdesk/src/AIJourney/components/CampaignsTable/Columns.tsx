import { formatMetricValue } from '@repo/reporting'
import classNames from 'classnames'

import type { ColumnDef } from '@gorgias/axiom'
import {
    Box,
    createTableV1SortableColumn,
    ProgressBar,
    TableV1SortableColumnHeader,
    Text,
} from '@gorgias/axiom'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { DateCell } from 'AIJourney/components/DateCell/DateCell'
import { MetricCell } from 'AIJourney/components/MetricCell/MetricCell'

import type { UpdatableJourneyCampaignState } from '../../constants'
import type { TableRow } from '../../pages/Campaigns/Campaigns'
import CampaignName from './CampaignName/CampaignName'
import CampaignStateBadge from './CampaignStateBadge/CampaignStateBadge'
import { MoreOptions } from './MoreOptions/MoreOptions'
import type { CampaignsTableMeta } from './types'

import badgeCss from './CampaignStateBadge/CampaignStateBadge.less'

const DATETIME_SORT_FN = 'datetime' as const

export const columns: ColumnDef<TableRow>[] = [
    createTableV1SortableColumn<TableRow>('campaign.title', 'Title', (info) => {
        const storeName = info.row.original.store_name
        const journeyType = info.row.original.type
        const journeyId = info.row.original.id
        return (
            <Box gap="xs">
                <CampaignName
                    name={info.getValue() as string}
                    storeName={storeName}
                    journeyType={journeyType}
                    journeyId={journeyId}
                />
            </Box>
        )
    }),
    createTableV1SortableColumn<TableRow>('stateLabel', 'Status', (info) => {
        const campaign = info.row.original.campaign
        const state = campaign?.state
        const isDraft = state === JourneyCampaignStateEnum.Draft
        const isSending = state === JourneyCampaignStateEnum.Active
        const hasAudiences = campaign?.has_included_audiences ?? false
        const currentSentCount = campaign?.current_sent_count ?? 0
        const totalToSendCount = campaign?.total_to_send_count ?? 0
        const percentage =
            totalToSendCount === 0
                ? 0
                : Math.min((currentSentCount / totalToSendCount) * 100, 100)
        return (
            <Box flexDirection="column">
                <Box gap="xs">
                    {!isSending && (
                        <CampaignStateBadge
                            state={state as JourneyCampaignStateEnum}
                            scheduledDatetime={campaign?.scheduled_datetime}
                        />
                    )}
                    {isDraft && !hasAudiences && (
                        <span
                            className={classNames(
                                badgeCss.badge,
                                badgeCss.grey,
                            )}
                        >
                            No audience
                        </span>
                    )}
                </Box>
                {isSending && (
                    <Box flexDirection="column" gap="xxxs">
                        <Text size="sm">Sending</Text>
                        <ProgressBar size="xs" value={percentage} />
                    </Box>
                )}
            </Box>
        )
    }),
    {
        id: 'created_datetime',
        accessorKey: 'created_datetime',
        header: ({ column }) => (
            <TableV1SortableColumnHeader column={column}>
                Created
            </TableV1SortableColumnHeader>
        ),
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <DateCell
                    value={info.row.original.created_datetime}
                    format={meta.dateFormat}
                />
            )
        },
        enableSorting: true,
        sortingFn: DATETIME_SORT_FN,
    },
]

export const dateColumns: ColumnDef<TableRow>[] = [
    {
        id: 'updated_datetime',
        accessorKey: 'updated_datetime',
        header: ({ column }) => (
            <TableV1SortableColumnHeader column={column}>
                Updated
            </TableV1SortableColumnHeader>
        ),
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <DateCell
                    value={info.row.original.updated_datetime}
                    format={meta.dateFormat}
                />
            )
        },
        enableSorting: true,
        sortingFn: DATETIME_SORT_FN,
    },
    {
        id: 'campaign.scheduled_datetime',
        accessorFn: (row) => row.campaign?.scheduled_datetime ?? '',
        header: ({ column }) => (
            <TableV1SortableColumnHeader column={column}>
                Scheduled
            </TableV1SortableColumnHeader>
        ),
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <DateCell
                    value={info.row.original.campaign?.scheduled_datetime}
                    format={meta.dateFormat}
                />
            )
        },
        enableSorting: true,
        sortingFn: DATETIME_SORT_FN,
    },
    {
        id: 'campaign.completed_datetime',
        accessorFn: (row) => row.campaign?.completed_datetime ?? '',
        header: ({ column }) => (
            <TableV1SortableColumnHeader column={column}>
                Sent
            </TableV1SortableColumnHeader>
        ),
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <DateCell
                    value={info.row.original.campaign?.completed_datetime}
                    format={meta.dateFormat}
                />
            )
        },
        enableSorting: true,
        sortingFn: DATETIME_SORT_FN,
    },
]

export const metricColumns: ColumnDef<TableRow, unknown>[] = [
    createTableV1SortableColumn<TableRow>(
        'metrics.recipients',
        'Recipients',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'integer')
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.revenue',
        'Revenue',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'currency', meta.currency)
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.totalOrders',
        'Orders',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'integer')
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.revenuePerRecipient',
        'Revenue per Recipient',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'currency', meta.currency)
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.averageOrderValue',
        'AOV',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'currency', meta.currency)
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.messagesSent',
        'Messages Sent',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'integer')
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>('metrics.ctr', 'CTR', (info) => {
        const value = info.getValue()
        return (
            <MetricCell value={value}>
                {typeof value === 'number'
                    ? formatMetricValue(value, 'percent-precision-1')
                    : (value as string)}
            </MetricCell>
        )
    }),
    createTableV1SortableColumn<TableRow>(
        'metrics.replyRate',
        'Reply rate',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'percent-precision-1')
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.optOutRate',
        'Opt out rate',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(value, 'percent-precision-1')
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
    createTableV1SortableColumn<TableRow>(
        'metrics.conversionRate',
        'Conversion rate',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {typeof value === 'number'
                        ? formatMetricValue(
                              value,
                              'decimal-to-percent-precision-1',
                          )
                        : (value as string)}
                </MetricCell>
            )
        },
    ),
]

export const actionColumns: ColumnDef<TableRow, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            const hasIncludedAudiences =
                info.row.original.campaign?.has_included_audiences ?? false
            return (
                <Box gap="xs">
                    <MoreOptions
                        shopName={info.row.original.store_name}
                        journeyId={info.row.original.id}
                        state={info.row.original.campaign?.state!}
                        hasIncludedAudiences={hasIncludedAudiences}
                        handleChangeStatus={(
                            status: UpdatableJourneyCampaignState,
                        ) => {
                            meta.onChangeStatus(info.row.original.id, status)
                        }}
                        handleCancelClick={() =>
                            meta.onCancelClick(info.row.original.id)
                        }
                        handleRemoveClick={() =>
                            meta.onRemoveClick(info.row.original.id)
                        }
                        handleSendClick={() =>
                            meta.onSendClick(
                                info.row.original.id,
                                hasIncludedAudiences,
                            )
                        }
                        handleDuplicateClick={() =>
                            meta.onDuplicateClick(info.row.original)
                        }
                    />
                </Box>
            )
        },
    },
]
