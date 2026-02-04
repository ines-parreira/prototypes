import { formatMetricValue } from '@repo/reporting'

import type { ColumnDef, TableMeta } from '@gorgias/axiom'
import { Box, createSortableColumn } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { MetricCell } from 'AIJourney/components'
import { CampaignsRowAdditionalOptions } from 'AIJourney/components/JourneysTable/CampaignsRowAdditionalOptions/CampaignsRowAdditionalOptions'
import { FlowsRowAdditionalOptions } from 'AIJourney/components/JourneysTable/FlowsRowAdditionalOptions/FlowsRowAdditionalOptions'
import { JourneyName } from 'AIJourney/components/JourneysTable/JourneyName/JourneyName'
import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import type { UpdatableJourneyCampaignState } from 'AIJourney/constants'
import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'

import type { TableRow } from '../../../pages/Flows/Flows'

interface CampaignsTableMeta extends TableMeta<JourneyApiDTO> {
    onRemoveClick: (id: string) => void
    onSendClick: (id: string) => void
    onCancelClick: (id: string) => void
    onDuplicateClick: (journey: JourneyApiDTO) => void
    onChangeStatus: (id: string, status: UpdatableJourneyCampaignState) => void
    currency: string
}

export const journeysColumns: ColumnDef<TableRow>[] = [
    {
        id: 'title',
        accessorFn: (row) =>
            row.campaign?.title || JOURNEY_TYPE_MAP_TO_STRING[row.type],
        header: 'Title',
        cell: (info) => {
            const storeName = info.row.original.store_name
            const journeyType = info.row.original.type
            const journeyId = info.row.original.id
            return (
                <Box gap="xs">
                    <JourneyName
                        name={info.getValue() as string}
                        storeName={storeName}
                        journeyType={journeyType}
                        journeyId={journeyId}
                    />
                </Box>
            )
        },
        enableSorting: true,
    },
    createSortableColumn<TableRow>('stateLabel', 'Status', (info) => {
        const state = info.row.original.state

        return (
            <Box gap="xs">
                <JourneyStateBadge state={state} />
            </Box>
        )
    }),
]

export const metricColumns: ColumnDef<TableRow, unknown>[] = [
    createSortableColumn<TableRow>(
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
    createSortableColumn<TableRow>('metrics.revenue', 'Revenue', (info) => {
        const meta = info.table.options.meta as { currency: string }
        const value = info.getValue()
        return (
            <MetricCell value={value}>
                {formatMetricValue(value as number, 'currency', meta.currency)}
            </MetricCell>
        )
    }),
    createSortableColumn<TableRow>('metrics.totalOrders', 'Orders', (info) => {
        const value = info.getValue()
        return (
            <MetricCell value={value}>
                {formatMetricValue(value as number, 'integer')}
            </MetricCell>
        )
    }),
    createSortableColumn<TableRow>(
        'metrics.revenuePerRecipient',
        'Revenue per Recipient',
        (info) => {
            const meta = info.table.options.meta as { currency: string }
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {formatMetricValue(
                        value as number,
                        'currency',
                        meta.currency,
                    )}
                </MetricCell>
            )
        },
    ),
    createSortableColumn<TableRow>(
        'metrics.averageOrderValue',
        'AOV',
        (info) => {
            const meta = info.table.options.meta as { currency: string }
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {formatMetricValue(
                        value as number,
                        'currency',
                        meta.currency,
                    )}
                </MetricCell>
            )
        },
    ),
    createSortableColumn<TableRow>(
        'metrics.messagesSent',
        'Messages Sent',
        (info) => {
            const value = info.getValue()
            return (
                <MetricCell value={value}>
                    {formatMetricValue(value as number, 'integer')}
                </MetricCell>
            )
        },
    ),
    createSortableColumn<TableRow>('metrics.ctr', 'CTR', (info) => {
        const value = info.getValue()
        return (
            <MetricCell value={value}>
                {typeof value === 'number'
                    ? formatMetricValue(value, 'percent-precision-1')
                    : (value as string)}
            </MetricCell>
        )
    }),
    createSortableColumn<TableRow>(
        'metrics.replyRate',
        'Response rate',
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
    createSortableColumn<TableRow>(
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
    createSortableColumn<TableRow>(
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

export const flowsActionColumns: ColumnDef<TableRow, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            return (
                <Box gap="xs">
                    <FlowsRowAdditionalOptions
                        journeyRowData={info.row.original}
                    />
                </Box>
            )
        },
    },
]

export const campaignsActionColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    <CampaignsRowAdditionalOptions
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
