import { formatMetricValue } from '@repo/reporting'

import type { ColumnDef } from '@gorgias/axiom'
import { Box, createSortableColumn } from '@gorgias/axiom'
import type { JourneyApiDTO } from '@gorgias/convert-client'

import { JourneyName } from 'AIJourney/components/JourneysTable/JourneyName/JourneyName'
import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { RowAdditionalOptions } from 'AIJourney/components/JourneysTable/RowAdditionalOptions/RowAdditionalOptions'
import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'

export const journeysColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
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
    createSortableColumn<JourneyApiDTO>('stateLabel', 'Status', (info) => {
        const state = info.row.original.state

        return (
            <Box gap="xs">
                <JourneyStateBadge state={state} />
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
                {typeof info.getValue() === 'number'
                    ? formatMetricValue(info.getValue() as number, 'integer')
                    : (info.getValue() as string)}{' '}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.revenue',
        'Revenue',
        (info) => {
            const meta = info.table.options.meta as { currency: string }
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency',
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
            const meta = info.table.options.meta as { currency: string }
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency',
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
            const meta = info.table.options.meta as { currency: string }
            return (
                <Box gap="xs">
                    {formatMetricValue(
                        info.getValue() as number,
                        'currency',
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
            {typeof info.getValue() === 'number'
                ? formatMetricValue(
                      info.getValue() as number,
                      'percent-precision-1',
                  )
                : (info.getValue() as string)}
        </Box>
    )),
    createSortableColumn<JourneyApiDTO>(
        'metrics.replyRate',
        'Response rate',
        (info) => (
            <Box gap="xs">
                {Boolean(typeof info.getValue() === 'number')
                    ? formatMetricValue(
                          info.getValue() as number,
                          'percent-precision-1',
                      )
                    : (info.getValue() as string)}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.optOutRate',
        'Out out rate',
        (info) => (
            <Box gap="xs">
                {typeof info.getValue() === 'number'
                    ? formatMetricValue(
                          info.getValue() as number,
                          'percent-precision-1',
                      )
                    : (info.getValue() as string)}
            </Box>
        ),
    ),
    createSortableColumn<JourneyApiDTO>(
        'metrics.conversionRate',
        'Conversion rate',
        (info) => (
            <Box gap="xs">
                {typeof info.getValue() === 'number'
                    ? formatMetricValue(
                          info.getValue() as number,
                          'decimal-to-percent-precision-1',
                      )
                    : (info.getValue() as string)}
            </Box>
        ),
    ),
]

export const actionColumns: ColumnDef<JourneyApiDTO, unknown>[] = [
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
