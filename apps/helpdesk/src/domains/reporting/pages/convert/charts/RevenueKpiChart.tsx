import { Skeleton } from '@gorgias/axiom'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import css from 'domains/reporting/pages/convert/components/CampaignPerformanceCharts/CampaignPerformanceCharts.less'
import { OverviewMetricConfig } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { usePerformanceTotalStats } from 'domains/reporting/pages/convert/hooks/usePerformanceTotalStats'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

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
