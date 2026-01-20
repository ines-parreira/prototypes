import { useMemo } from 'react'

import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchTicketsCreatedMetric,
    useTicketsCreatedMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchCreatedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const ticketCountField = TicketMeasure.TicketCount

const formatResult = (
    createdTicketsPerChannel: MetricWithDecile,
    allCreatedTickets: Metric,
) => {
    let metricValue = null

    if (createdTicketsPerChannel.data?.value && allCreatedTickets.data?.value) {
        metricValue = calculatePercentage(
            createdTicketsPerChannel.data.value,
            allCreatedTickets.data?.value,
        )
    }

    const allData = createdTicketsPerChannel.data?.allData || []

    return {
        value: metricValue,
        decile: createdTicketsPerChannel.data?.decile || null,
        allData: allData.map((item) => ({
            ...item,
            [ticketCountField]:
                item[ticketCountField] && allCreatedTickets.data?.value
                    ? String(
                          calculatePercentage(
                              Number(item[ticketCountField]),
                              allCreatedTickets.data.value,
                          ),
                      )
                    : item[ticketCountField],
        })),
        dimensions: createdTicketsPerChannel.data?.dimensions || [],
        measures: createdTicketsPerChannel.data?.measures || [],
    }
}

export const usePercentageOfCreatedTicketsMetricPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string,
): MetricWithDecile => {
    const createdTicketsPerChannel = useCreatedTicketsMetricPerChannel(
        statsFilters,
        timezone,
        sorting,
        channel,
    )
    const allCreatedTickets = useTicketsCreatedMetric(statsFilters, timezone)

    const data = useMemo(
        () => formatResult(createdTicketsPerChannel, allCreatedTickets),
        [allCreatedTickets, createdTicketsPerChannel],
    )

    return {
        isFetching:
            allCreatedTickets.isFetching || createdTicketsPerChannel.isFetching,
        isError: allCreatedTickets.isError || createdTicketsPerChannel.isError,
        data,
    }
}

export const fetchPercentageOfCreatedTicketsMetricPerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    channel?: string,
): Promise<MetricWithDecile> => {
    return Promise.all([
        fetchCreatedTicketsMetricPerChannel(
            statsFilters,
            timezone,
            sorting,
            channel,
        ),
        fetchTicketsCreatedMetric(statsFilters, timezone),
    ])
        .then(([ticketsPerDimension, allTickets]) => {
            return {
                data: formatResult(ticketsPerDimension, allTickets),
                isFetching: false,
                isError: false,
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: null,
        }))
}
