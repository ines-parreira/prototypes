import { formatMetricValue } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, createSortableColumn } from '@gorgias/axiom'
import type {
    JourneyApiDTO,
    JourneyCampaignStateEnum,
} from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from '../../constants'
import CampaignName from './CampaignName/CampaignName'
import CampaignStateBadge from './CampaignStateBadge/CampaignStateBadge'
import { MoreOptions } from './MoreOptions/MoreOptions'
import type { CampaignsTableMeta } from './types'

export const columns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>('campaign.title', 'Title', (info) => {
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
    createSortableColumn<JourneyApiDTO>('campaign.state', 'Status', (info) => {
        return (
            <Box gap="xs">
                <CampaignStateBadge
                    state={info.getValue() as JourneyCampaignStateEnum}
                />
            </Box>
        )
    }),
]

export const metricColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>(
        'metrics.recipients',
        'Recipients',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(info.getValue() as number, 'integer')}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.revenue',
        'Revenue',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency-precision-1',
                        meta.currency,
                    )}
                </Box>
            )
        },
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.totalOrders',
        'Orders',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(info.getValue() as number, 'integer')}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.revenuePerRecipient',
        'Revenue per Recipient',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency-precision-1',
                        meta.currency,
                    )}
                </Box>
            )
        },
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.averageOrderValue',
        'AOV',
        (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency-precision-1',
                        meta.currency,
                    )}
                </Box>
            )
        },
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.messagesSent',
        'Messages Sent',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(info.getValue() as number, 'integer')}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>('metrics.ctr', 'CTR', (info) => (
        <Box gap="xs">
            {formatMetricValue(
                info.getValue() as number,
                'percent-precision-1',
            )}
        </Box>
    )),
    createSortableColumn<JourneyApiDTO>(
        'metrics.replyRate',
        'Reply rate',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(
                    info.getValue() as number,
                    'percent-precision-1',
                )}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.optOutRate',
        'Out out rate',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(
                    info.getValue() as number,
                    'percent-precision-1',
                )}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.conversionRate',
        'Conversion rate',
        (info) => (
            <Box gap="xs">
                {formatMetricValue(
                    info.getValue() as number,
                    'decimal-to-percent-precision-1',
                )}
            </Box>
        ),
    ),
]

export const actionColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    <MoreOptions
                        shopName={info.row.original.store_name}
                        journeyId={info.row.original.id}
                        state={info.row.original.campaign?.state!}
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
                            meta.onSendClick(info.row.original.id)
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
