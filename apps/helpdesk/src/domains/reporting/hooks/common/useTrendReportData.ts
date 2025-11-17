import { useEffect, useState } from 'react'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import type { FormattedTrendDataWithLabel } from 'domains/reporting/services/supportPerformanceReportingService'
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
                aiAgentUserId,
                costSavedPerInteraction,
            ),
        )
        void Promise.all(workloadTrendPromises)
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
        trendsReportSource,
        userTimezone,
    ])

    return trendData
}
