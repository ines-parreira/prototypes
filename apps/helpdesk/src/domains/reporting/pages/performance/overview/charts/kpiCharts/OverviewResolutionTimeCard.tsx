import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    resolutionTimeTimeseriesQueryFactoryV2,
    resolutionTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/resolutionTime'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewResolutionTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(resolutionTimeValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: resolutionTimeTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
