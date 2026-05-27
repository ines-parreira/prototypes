import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    humanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
    humanResponseTimeAfterAiHandoffValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewHumanResponseTimeAfterAiHandoffCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(
            humanResponseTimeAfterAiHandoffValueQueryFactoryV2,
        ),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory:
                humanResponseTimeAfterAiHandoffTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
