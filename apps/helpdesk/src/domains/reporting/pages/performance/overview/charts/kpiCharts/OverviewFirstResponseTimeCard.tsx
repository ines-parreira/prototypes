import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    firstResponseTimeTimeseriesQueryFactoryV2,
    firstResponseTimeValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/firstResponseTime'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const OverviewFirstResponseTimeCard = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook(firstResponseTimeValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: firstResponseTimeTimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
