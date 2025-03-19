import { Skeleton } from '@gorgias/merchant-ui-kit'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import css from 'pages/stats/convert/components/CampaignPerformanceCharts/CampaignPerformanceCharts.less'
import { OverviewMetricConfig } from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'pages/stats/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'pages/stats/convert/services/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import MetricCard from 'pages/stats/MetricCard'

export const RevenueKpiChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isLoading, totalStatsData } = usePerformanceTotalStats()

    return (
        <MetricCard
            {...OverviewMetricConfig[CampaignsTotalsMetricNames.revenue]}
            chartId={chartId}
            dashboard={dashboard}
        >
            {isLoading ? (
                <Skeleton height={32} />
            ) : (
                <div className={css.wrapper}>
                    <BigNumberMetric className={css.metric}>
                        {totalStatsData?.revenue}
                    </BigNumberMetric>
                    {totalStatsData?.gmv && totalStatsData.gmv !== '0' && (
                        <span
                            className={css.subText}
                        >{`from total store revenue: ${totalStatsData.gmv}`}</span>
                    )}
                </div>
            )}
        </MetricCard>
    )
}
