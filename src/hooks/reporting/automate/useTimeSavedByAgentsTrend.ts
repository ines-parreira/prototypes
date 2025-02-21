import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'hooks/reporting/automate/automationTrends'
import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'

const calculateTimeSavedByAgents = (
    ticketHandleTimeTrend: MetricTrend,
    automatedInteractionTrend: MetricTrend
) => {
    return {
        value:
            (ticketHandleTimeTrend.data?.value ?? 0) *
            (automatedInteractionTrend.data?.value ?? 0),
        prevValue:
            (ticketHandleTimeTrend.data?.prevValue ?? 0) *
            (automatedInteractionTrend.data?.prevValue ?? 0),
    }
}

export const useTimeSavedByAgentsTrend = (
    statsFilters: StatsFilters,
    userTimezone: string
) => {
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone
    )
    const ticketHandleTimeTrend = useTicketHandleTimeTrend(
        statsFilters,
        userTimezone
    )

    return {
        isFetching:
            ticketHandleTimeTrend.isFetching ||
            automatedInteractionTrend.isFetching,
        isError:
            ticketHandleTimeTrend.isError || automatedInteractionTrend.isError,
        data: calculateTimeSavedByAgents(
            ticketHandleTimeTrend,
            automatedInteractionTrend
        ),
    }
}

export const fetchTimeSavedByAgentsTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string
) => {
    return Promise.all([
        fetchFilteredAutomatedInteractions(statsFilters, userTimezone),
        fetchTicketHandleTimeTrend(statsFilters, userTimezone),
    ]).then(([ticketHandleTimeTrend, automatedInteractionTrend]) => ({
        data: calculateTimeSavedByAgents(
            ticketHandleTimeTrend,
            automatedInteractionTrend
        ),
        isFetching: false,
        isError: false,
    }))
}
