import { Skeleton } from '@gorgias/axiom'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import css from 'domains/reporting/pages/convert/components/CampaignTotalsStat/CampaignTotalsStat.less'
import { METRICS } from 'domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig'
import { useCampaignTotalStats } from 'domains/reporting/pages/convert/hooks/useCampaignTotalStats'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const CampaignRevenueKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { data, isLoading } = useCampaignTotalStats()

    return (
        <MetricCard
            title={METRICS.revenue.title}
            hint={METRICS.revenue.hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            {isLoading ? (
                <Skeleton height={32} />
            ) : (
                <div className={css.wrapper}>
                    <BigNumberMetric className={css.metric}>
                        {data?.revenue}
                    </BigNumberMetric>
                    {data?.gmv && data.gmv !== '0' && (
                        <span
                            className={css.subText}
                        >{`from total store revenue: ${data.gmv}`}</span>
                    )}
                </div>
            )}
        </MetricCard>
    )
}
