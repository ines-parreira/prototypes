import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useMemo, useState} from 'react'
import {FeatureFlagKey} from 'config/featureFlags'
import {DEFAULT_TIMEZONE} from 'pages/stats/constants'
import {logEvent, SegmentEvent} from 'common/segment'
import {
    useWorkloadPerChannelDistribution,
    useWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {DownloadOverviewDataButton} from 'pages/stats/support-performance/components/DownloadOverviewDataButton'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters, getStatsFilters} from 'state/stats/selectors'
import {periodToReportingGranularity} from 'utils/reporting'

export const DownloadOverviewData = () => {
    const isDeferredLoadingEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsDeferredLoadingExperiment]

    const [fetchingEnabled, setFetchingEnable] = useState(
        isDeferredLoadingEnabled === undefined
            ? false
            : !isDeferredLoadingEnabled
    )

    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const statsFilters = useAppSelector(getStatsFilters)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)

    const customerSatisfactionTrend = useCustomerSatisfactionTrend(
        requestStatsFilters,
        userTimezone
    )
    const medianFirstResponseTimeTrend = useMedianFirstResponseTimeTrend(
        requestStatsFilters,
        userTimezone
    )
    const medianResolutionTimeTrend = useMedianResolutionTimeTrend(
        requestStatsFilters,
        userTimezone
    )
    const messagesPerTicketTrend = useMessagesPerTicketTrend(
        requestStatsFilters,
        userTimezone
    )
    const openTicketsTrend = useOpenTicketsTrend(
        requestStatsFilters,
        userTimezone
    )
    const closedTicketsTrend = useClosedTicketsTrend(
        requestStatsFilters,
        userTimezone
    )
    const ticketsCreatedTrend = useTicketsCreatedTrend(
        requestStatsFilters,
        userTimezone
    )
    const ticketsRepliedTrend = useTicketsRepliedTrend(
        requestStatsFilters,
        userTimezone
    )
    const messagesSentTrend = useMessagesSentTrend(
        requestStatsFilters,
        userTimezone
    )

    const granularity = periodToReportingGranularity(requestStatsFilters.period)
    const ticketsCreatedTimeSeries = useTicketsCreatedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsClosedTimeSeries = useTicketsClosedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsRepliedTimeSeries = useTicketsRepliedTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )
    const messagesSentTimeSeries = useMessagesSentTimeSeries(
        requestStatsFilters,
        userTimezone,
        granularity
    )

    const workloadPerChannel = useWorkloadPerChannelDistribution(
        requestStatsFilters,
        userTimezone,
        fetchingEnabled
    )
    const workloadPerChannelPrevious =
        useWorkloadPerChannelDistributionForPreviousPeriod(
            requestStatsFilters,
            userTimezone,
            fetchingEnabled
        )
    const exportableData = useMemo(() => {
        return {
            customerSatisfactionTrend,
            medianFirstResponseTimeTrend,
            medianResolutionTimeTrend,
            messagesPerTicketTrend,
            openTicketsTrend,
            closedTicketsTrend,
            ticketsCreatedTrend,
            ticketsRepliedTrend,
            messagesSentTrend,
            ticketsCreatedTimeSeries,
            ticketsClosedTimeSeries,
            ticketsRepliedTimeSeries,
            messagesSentTimeSeries,
            workloadPerChannel,
            workloadPerChannelPrevious,
        }
    }, [
        closedTicketsTrend,
        customerSatisfactionTrend,
        medianFirstResponseTimeTrend,
        messagesPerTicketTrend,
        messagesSentTimeSeries,
        messagesSentTrend,
        openTicketsTrend,
        medianResolutionTimeTrend,
        ticketsClosedTimeSeries,
        ticketsCreatedTimeSeries,
        ticketsCreatedTrend,
        ticketsRepliedTimeSeries,
        ticketsRepliedTrend,
        workloadPerChannel,
        workloadPerChannelPrevious,
    ])

    const loading = useMemo(() => {
        return Object.values(exportableData).some((metric) => metric.isFetching)
    }, [exportableData])

    useEffect(() => {
        const saveReportAsync = async () => {
            await saveReport(exportableData, statsFilters.period)
        }
        if (fetchingEnabled && !loading) {
            void saveReportAsync()
            setFetchingEnable(false)
        }
    }, [fetchingEnabled, loading, exportableData, statsFilters.period])

    return (
        <DownloadOverviewDataButton
            onClick={() => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                setFetchingEnable(true)
            }}
            disabled={loading}
        />
    )
}
