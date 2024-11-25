import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useMemo, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
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
import useAppSelector from 'hooks/useAppSelector'
import {DownloadDataButton} from 'pages/stats/support-performance/components/DownloadDataButton'
import {saveReport} from 'services/reporting/supportPerformanceReportingService'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export const DownloadOverviewData = ({
    isAnalyticsNewFilters = false,
}: {
    isAnalyticsNewFilters?: boolean
}) => {
    const isDeferredLoadingEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsDeferredLoadingExperiment]

    const [fetchingEnabled, setFetchingEnable] = useState(
        isDeferredLoadingEnabled === undefined
            ? false
            : !isDeferredLoadingEnabled
    )
    useEffect(() => {
        setFetchingEnable(
            isDeferredLoadingEnabled === undefined
                ? false
                : !isDeferredLoadingEnabled
        )
    }, [isDeferredLoadingEnabled])

    const [waitForTheReportData, setWaitForTheReportData] = useState(false)

    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const customerSatisfactionTrend = useCustomerSatisfactionTrend(
        cleanStatsFilters,
        userTimezone
    )
    const medianFirstResponseTimeTrend = useMedianFirstResponseTimeTrend(
        cleanStatsFilters,
        userTimezone
    )
    const medianResolutionTimeTrend = useMedianResolutionTimeTrend(
        cleanStatsFilters,
        userTimezone
    )
    const messagesPerTicketTrend = useMessagesPerTicketTrend(
        cleanStatsFilters,
        userTimezone
    )
    const openTicketsTrend = useOpenTicketsTrend(
        cleanStatsFilters,
        userTimezone
    )
    const closedTicketsTrend = useClosedTicketsTrend(
        cleanStatsFilters,
        userTimezone
    )
    const ticketsCreatedTrend = useTicketsCreatedTrend(
        cleanStatsFilters,
        userTimezone
    )
    const ticketsRepliedTrend = useTicketsRepliedTrend(
        cleanStatsFilters,
        userTimezone
    )
    const messagesSentTrend = useMessagesSentTrend(
        cleanStatsFilters,
        userTimezone
    )

    const ticketsCreatedTimeSeries = useTicketsCreatedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsClosedTimeSeries = useTicketsClosedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )
    const ticketsRepliedTimeSeries = useTicketsRepliedTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )
    const messagesSentTimeSeries = useMessagesSentTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    const workloadPerChannel = useWorkloadPerChannelDistribution(
        cleanStatsFilters,
        userTimezone,
        fetchingEnabled
    )
    const workloadPerChannelPrevious =
        useWorkloadPerChannelDistributionForPreviousPeriod(
            cleanStatsFilters,
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
            await saveReport(exportableData, cleanStatsFilters.period)
        }
        if (fetchingEnabled && !loading && waitForTheReportData) {
            void saveReportAsync()
            setFetchingEnable(false)
            setWaitForTheReportData(false)
        }
    }, [
        fetchingEnabled,
        loading,
        exportableData,
        cleanStatsFilters.period,
        waitForTheReportData,
    ])

    return (
        <DownloadDataButton
            onClick={() => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                setFetchingEnable(true)
                setWaitForTheReportData(true)
            }}
            disabled={loading}
        />
    )
}
