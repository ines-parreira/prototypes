import { useCallback, useContext, useMemo } from 'react'

import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    AiSalesMetricConfig,
    TrendMetric,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { AiSalesAgentMetricConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { useAiSalesAgentTrendCardComponent } from 'domains/reporting/pages/automate/aiSalesAgent/charts/useAiSalesAgentTrendCardComponent'
import { WarningBannerContext } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

const useTrendBuilder = (
    threeDaysAgo: moment.Moment,
    config: AiSalesMetricConfig,
) => {
    return useCallback(
        (filters: StatsFilters, timezone: string) => {
            const end_datetime = moment(filters.period.end_datetime).isAfter(
                threeDaysAgo,
            )
                ? threeDaysAgo.format()
                : filters.period.end_datetime

            const updatedFilters = {
                ...filters,
                period: {
                    ...filters.period,
                    end_datetime,
                },
            }

            return config.useTrend(updatedFilters, timezone)
        },
        [config, threeDaysAgo],
    )
}

const SuccessRateTrendCard = ({ chartId, dashboard }: DashboardChartProps) => {
    const config = AiSalesAgentMetricConfig[chartId as TrendMetric]

    const threeDaysAgo = useMemo(
        () => moment().subtract(3, 'days').endOf('day'),
        [],
    )

    const { isBannerVisible } = useContext(WarningBannerContext)

    const { cleanStatsFilters } = useStatsFilters()
    const isStartDateLessThanThreeDaysAgo = useMemo(
        () =>
            moment(cleanStatsFilters.period.start_datetime).isAfter(
                threeDaysAgo,
            ),
        [cleanStatsFilters, threeDaysAgo],
    )

    const useTrend = useTrendBuilder(threeDaysAgo, config)

    const TrendCardComponent = useAiSalesAgentTrendCardComponent({
        config: { ...config, useTrend },
        chartId,
        dashboard,
        isDataVisible: !isBannerVisible && !isStartDateLessThanThreeDaysAgo,
    })

    return <TrendCardComponent />
}

export default SuccessRateTrendCard
