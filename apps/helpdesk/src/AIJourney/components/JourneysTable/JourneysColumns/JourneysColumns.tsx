import { formatMetricValue } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, createSortableColumn } from '@gorgias/axiom'

import { MetricCell } from 'AIJourney/components'
import { JourneyName } from 'AIJourney/components/JourneysTable/JourneyName/JourneyName'
import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { RowAdditionalOptions } from 'AIJourney/components/JourneysTable/RowAdditionalOptions/RowAdditionalOptions'
import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'

import type { TableRow } from '../../../pages/Flows/Flows'

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
            const meta = info.table.options.meta as {
                currency: string
                integrationId?: number
            }
            const journeyId = info.row.original.id
            const drilldown = {
                title: AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate]
                    .title,
                metricName: AIJourneyMetric.ResponseRate,
                integrationId: meta.integrationId?.toString() || '',
                journeyIds: journeyId ? [journeyId] : [],
            }

            return (
                <MetricCell value={value}>
                    <DrillDownModalTrigger
                        enabled={!!value}
                        metricData={drilldown}
                    >
                        {typeof value === 'number'
                            ? formatMetricValue(value, 'percent-precision-1')
                            : (value as string)}
                    </DrillDownModalTrigger>
                </MetricCell>
            )
        },
    ),
    createSortableColumn<TableRow>(
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

export const actionColumns: ColumnDef<TableRow, unknown>[] = [
    {
        id: 'actions',
        cell: (info) => {
            return (
                <Box gap="xs">
                    <RowAdditionalOptions journeyRowData={info.row.original} />
                </Box>
            )
        },
    },
]
