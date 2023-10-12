import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'

export const usePercentageOfClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => {
    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )
    const {data, isFetching, isError} = useClosedTicketsMetric(
        statsFilters,
        timezone
    )

    const calculatePercentage = (x: number, y: number) => (x / y) * 100

    let metricValue = null

    if (closedTicketsPerAgent.data?.value && data?.value) {
        metricValue = calculatePercentage(
            closedTicketsPerAgent.data.value,
            data.value
        )
    }

    const allData = closedTicketsPerAgent.data?.allData || []

    return {
        isFetching: isFetching || closedTicketsPerAgent.isFetching,
        isError: isError || closedTicketsPerAgent.isError,
        data: {
            value: metricValue,
            decile: closedTicketsPerAgent.data?.decile || null,
            allData: allData.map((item) => ({
                ...item,
                [TicketMeasure.TicketCount]:
                    item[TicketMeasure.TicketCount] && data?.value
                        ? String(
                              calculatePercentage(
                                  Number(item[TicketMeasure.TicketCount]),
                                  data.value
                              )
                          )
                        : item[TicketMeasure.TicketCount],
            })),
        },
    }
}
