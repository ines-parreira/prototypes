import {Skeleton} from '@gorgias/merchant-ui-kit'

import React from 'react'

import BigNumberMetric from 'pages/stats/BigNumberMetric'
import css from 'pages/stats/convert/components/CampaignTotalsStat/CampaignTotalsStat.less'
import {METRICS} from 'pages/stats/convert/constants/ConvertPerformanceOverviewConfig'
import {useCampaignTotalStats} from 'pages/stats/convert/hooks/useCampaignTotalStats'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import MetricCard from 'pages/stats/MetricCard'

export const CampaignRevenueKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const {data, isLoading} = useCampaignTotalStats()

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
