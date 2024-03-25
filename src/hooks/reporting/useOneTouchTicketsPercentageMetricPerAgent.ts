import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {
    calculatePercentage,
    matchAndCalculateAllEntries,
    sortAllData,
} from 'utils/reporting'
import {calculateDecile} from './useCustomFieldsTicketCountPerCustomFields'

export const useOneTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const assigneeIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketDimension.AssigneeUserId)
        : TicketDimension.AssigneeUserId
    const ticketCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount

    const oneTouchTickets = useOneTouchTicketsMetricPerAgent(
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

    if (closedTicketsPerAgent.data?.value && oneTouchTickets.data?.value) {
        metricValue = calculatePercentage(
            oneTouchTickets.data.value,
            closedTicketsPerAgent.data.value
        )
    }

    const sortedData = useMemo(() => {
        const allData = matchAndCalculateAllEntries(
            oneTouchTickets,
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
        oneTouchTickets,
        sorting,
        ticketCountField,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField]))
    )

    return {
        isFetching:
            oneTouchTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: oneTouchTickets.isError || closedTicketsPerAgent.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
