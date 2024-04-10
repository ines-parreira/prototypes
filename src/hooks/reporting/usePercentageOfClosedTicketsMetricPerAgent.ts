import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'

export const usePercentageOfClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const ticketCountField = TicketMeasure.TicketCount

    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )
    const allClosedTickets = useClosedTicketsMetric(statsFilters, timezone)

    const calculatePercentage = (x: number, y: number) => (x / y) * 100

    let metricValue = null

    if (closedTicketsPerAgent.data?.value && allClosedTickets.data?.value) {
        metricValue = calculatePercentage(
            closedTicketsPerAgent.data.value,
            allClosedTickets.data?.value
        )
    }

    const allData = closedTicketsPerAgent.data?.allData || []

    return {
        isFetching:
            allClosedTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: allClosedTickets.isError || closedTicketsPerAgent.isError,
        data: {
            value: metricValue,
            decile: closedTicketsPerAgent.data?.decile || null,
            allData: allData.map((item) => ({
                ...item,
                [ticketCountField]:
                    item[ticketCountField] && allClosedTickets.data?.value
                        ? String(
                              calculatePercentage(
                                  Number(item[ticketCountField]),
                                  allClosedTickets.data.value
                              )
                          )
                        : item[ticketCountField],
            })),
        },
    }
}
