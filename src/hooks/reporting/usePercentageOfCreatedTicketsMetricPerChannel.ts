import {useTicketsCreatedMetric} from 'hooks/reporting/metrics'
import {useCreatedTicketsMetricPerChannel} from 'hooks/reporting/metricsPerChannel'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {calculatePercentage} from 'utils/reporting'

export const usePercentageOfCreatedTicketsMetricPerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const ticketCountField = TicketMeasure.TicketCount

    const createdTicketsPerChannel = useCreatedTicketsMetricPerChannel(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )
    const allCreatedTickets = useTicketsCreatedMetric(statsFilters, timezone)

    let metricValue = null

    if (createdTicketsPerChannel.data?.value && allCreatedTickets.data?.value) {
        metricValue = calculatePercentage(
            createdTicketsPerChannel.data.value,
            allCreatedTickets.data?.value
        )
    }

    const allData = createdTicketsPerChannel.data?.allData || []

    return {
        isFetching:
            allCreatedTickets.isFetching || createdTicketsPerChannel.isFetching,
        isError: allCreatedTickets.isError || createdTicketsPerChannel.isError,
        data: {
            value: metricValue,
            decile: createdTicketsPerChannel.data?.decile || null,
            allData: allData.map((item) => ({
                ...item,
                [ticketCountField]:
                    item[ticketCountField] && allCreatedTickets.data?.value
                        ? String(
                              calculatePercentage(
                                  Number(item[ticketCountField]),
                                  allCreatedTickets.data.value
                              )
                          )
                        : item[ticketCountField],
            })),
        },
    }
}
