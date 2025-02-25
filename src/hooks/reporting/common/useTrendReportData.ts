import { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { MetricTrendFetch } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { formatMetricValue, MetricValueFormat } from 'pages/stats/common/utils'
import { FormattedTrendDataWithLabel } from 'services/reporting/supportPerformanceReportingService'

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
