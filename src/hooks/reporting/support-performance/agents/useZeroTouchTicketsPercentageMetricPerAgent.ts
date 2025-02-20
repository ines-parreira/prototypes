import {useMemo} from 'react'

import {
    useClosedTicketsMetricPerAgent,
    useZeroTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {calculateDecile} from 'hooks/reporting/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {
    calculatePercentage,
    matchAndCalculateAllEntries,
    sortAllData,
} from 'utils/reporting'

export const useZeroTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const assigneeIdField = TicketDimension.AssigneeUserId
    const ticketCountField = TicketMeasure.TicketCount

    const zeroTouchTickets = useZeroTouchTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )

    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )

    let metricValue: number | null = null

    if (closedTicketsPerAgent.data?.value && zeroTouchTickets.data?.value) {
        metricValue = calculatePercentage(
            zeroTouchTickets.data.value,
            closedTicketsPerAgent.data.value
        )
    }

    const sortedData = useMemo(() => {
        const allData = matchAndCalculateAllEntries(
            zeroTouchTickets,
            closedTicketsPerAgent,
            calculatePercentage,
            assigneeIdField,
            assigneeIdField,
            ticketCountField,
            ticketCountField
        )
        return sortAllData(allData, ticketCountField, sorting)
    }, [
        assigneeIdField,
        closedTicketsPerAgent,
        zeroTouchTickets,
        sorting,
        ticketCountField,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField]))
    )

    return {
        isFetching:
            zeroTouchTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: zeroTouchTickets.isError || closedTicketsPerAgent.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
