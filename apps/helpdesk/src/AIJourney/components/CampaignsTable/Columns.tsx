import { formatMetricValue } from '@repo/reporting'
import classNames from 'classnames'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, createTableV1SortableColumn } from '@gorgias/axiom'
import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

import { MetricCell } from 'AIJourney/components'

import type { UpdatableJourneyCampaignState } from '../../constants'
import type { TableRow } from '../../pages/Campaigns/Campaigns'
import CampaignName from './CampaignName/CampaignName'
import CampaignStateBadge from './CampaignStateBadge/CampaignStateBadge'
import { MoreOptions } from './MoreOptions/MoreOptions'
import type { CampaignsTableMeta } from './types'

import badgeCss from './CampaignStateBadge/CampaignStateBadge.less'

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
        const hasAudiences = campaign?.has_included_audiences ?? false
        return (
            <Box gap="xs">
                <CampaignStateBadge
                    state={state as JourneyCampaignStateEnum}
                    scheduledDatetime={campaign?.scheduled_datetime}
                />
                {isDraft && !hasAudiences && (
                    <span className={classNames(badgeCss.badge, badgeCss.grey)}>
                        No audience
                    </span>
                )}
            </Box>
        )
    }),
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
        'Out out rate',
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
