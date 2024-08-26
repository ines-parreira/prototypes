import {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
} from 'hooks/reporting/metricsPerChannel'
import {useSortedChannels} from 'hooks/reporting/support-performance/useSortedChannels'
import {usePercentageOfCreatedTicketsMetricPerChannel} from 'hooks/reporting/usePercentageOfCreatedTicketsMetricPerChannel'
import useAppSelector from 'hooks/useAppSelector'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {FeatureFlagKey} from 'config/featureFlags'

export const useChannelsReportMetrics = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    const {cleanStatsFilters: LegacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : LegacyStatsFilters

    const {sortedChannels: channels, isLoading} = useSortedChannels()

    const createdTicketsMetricPerChannel = useCreatedTicketsMetricPerChannel(
        cleanStatsFilters,
        userTimezone
    )
    const percentageOfCreatedTicketsMetricPerChannel =
        usePercentageOfCreatedTicketsMetricPerChannel(
            cleanStatsFilters,
            userTimezone
        )
    const closedTicketsMetricPerChannel = useClosedTicketsMetricPerChannel(
        cleanStatsFilters,
        userTimezone
    )
    const ticketAverageHandleTimePerChannel =
        useTicketAverageHandleTimePerChannel(cleanStatsFilters, userTimezone)
    const medianFirstResponseTimeMetricPerChannel =
        useMedianFirstResponseTimeMetricPerChannel(
            cleanStatsFilters,
            userTimezone
        )
    const medianResolutionTimeMetricPerChannel =
        useMedianResolutionTimeMetricPerChannel(cleanStatsFilters, userTimezone)
    const ticketsRepliedMetricPerChannel = useTicketsRepliedMetricPerChannel(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentMetricPerChannel = useMessagesSentMetricPerChannel(
        cleanStatsFilters,
        userTimezone
    )
    const customerSatisfactionMetricPerChannel =
        useCustomerSatisfactionMetricPerChannel(cleanStatsFilters, userTimezone)

    const loading = useMemo(() => {
        return Object.values({
            createdTicketsMetricPerChannel,
            percentageOfCreatedTicketsMetricPerChannel,
            closedTicketsMetricPerChannel,
            ticketAverageHandleTimePerChannel,
            medianFirstResponseTimeMetricPerChannel,
            medianResolutionTimeMetricPerChannel,
            ticketsRepliedMetricPerChannel,
            messagesSentMetricPerChannel,
            customerSatisfactionMetricPerChannel,
        }).some((metric) => metric.isFetching)
    }, [
        closedTicketsMetricPerChannel,
        createdTicketsMetricPerChannel,
        customerSatisfactionMetricPerChannel,
        medianFirstResponseTimeMetricPerChannel,
        medianResolutionTimeMetricPerChannel,
        messagesSentMetricPerChannel,
        percentageOfCreatedTicketsMetricPerChannel,
        ticketAverageHandleTimePerChannel,
        ticketsRepliedMetricPerChannel,
    ])

    return {
        reportData: {
            channels,
            createdTicketsMetricPerChannel,
            percentageOfCreatedTicketsMetricPerChannel,
            closedTicketsMetricPerChannel,
            ticketAverageHandleTimePerChannel,
            medianFirstResponseTimeMetricPerChannel,
            medianResolutionTimeMetricPerChannel,
            ticketsRepliedMetricPerChannel,
            messagesSentMetricPerChannel,
            customerSatisfactionMetricPerChannel,
        },
        isLoading: loading || isLoading,
        period: cleanStatsFilters.period,
    }
}
