import { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatMetricValue,
    MetricValueFormat,
} from 'domains/reporting/pages/common/utils'
import { FormattedTrendDataWithLabel } from 'domains/reporting/services/supportPerformanceReportingService'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useTrendReportData = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    trendsReportSource: {
        fetchTrend: MetricTrendFetch
        metricFormat: MetricValueFormat
        title: string
    }[],
) => {
    const isAutomateNonFilteredDenominatorInAutomationRate:
        | boolean
        | undefined =
        useFlags()[
            FeatureFlagKey.AutomateNonFilteredDenominatorInAutomationRate
        ]
    const aiAgentUserId = useAIAgentUserId()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )
    const [trendData, setTrendData] = useState<{
        isFetching: boolean
        data: FormattedTrendDataWithLabel[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        const workloadTrendPromises = trendsReportSource.map((r) =>
            r.fetchTrend(
                cleanStatsFilters,
                userTimezone,
                isAutomateNonFilteredDenominatorInAutomationRate,
                aiAgentUserId,
                costSavedPerInteraction,
            ),
        )
        void Promise.all([...workloadTrendPromises])
            .then((results) => {
                setTrendData({
                    isFetching: false,
                    data: trendsReportSource.map((r, index) => ({
                        label: r.title,
                        value: formatMetricValue(
                            results[index].data?.value,
                            r.metricFormat,
                        ),
                        prevValue: formatMetricValue(
                            results[index].data?.prevValue,
                            r.metricFormat,
                        ),
                    })),
                })
            })
            .catch(() => setTrendData({ isFetching: false, data: [] }))
    }, [
        aiAgentUserId,
        cleanStatsFilters,
        costSavedPerInteraction,
        isAutomateNonFilteredDenominatorInAutomationRate,
        trendsReportSource,
        userTimezone,
    ])

    return trendData
}
