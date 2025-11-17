import type { ReactNode } from 'react'
import React from 'react'

import { Skeleton } from '@gorgias/axiom'

import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import PerformanceTip from 'domains/reporting/pages/common/components/PerformanceTip'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { formatMetricValue } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import css from 'domains/reporting/pages/help-center/components/OverviewCard/OverviewCard.less'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'

export type OverviewCardProps = {
    trendValue?: number | null
    prevTrendValue?: number | null
    showTip: boolean
    isLoading: boolean
    hintTitle: string
    startDate: string
    endDate: string
    title: string
    tipContent: ReactNode
} & DashboardChartProps

const OverviewCard = ({
    trendValue,
    prevTrendValue,
    showTip,
    isLoading,
    hintTitle,
    title,
    tipContent,
    startDate,
    endDate,
    chartId,
    dashboard,
}: OverviewCardProps) => {
    return (
        <MetricCard
            chartId={chartId}
            dashboard={dashboard}
            isLoading={isLoading}
            title={title}
            hint={{
                title: hintTitle,
            }}
            tip={
                showTip ? (
                    !isLoading && !prevTrendValue && !trendValue ? (
                        <NoDataAvailable
                            title="No data"
                            description="No data available for the selected filters."
                            className={css.noDataContainer}
                        />
                    ) : (
                        <PerformanceTip showBenchmark={false}>
                            {tipContent}
                        </PerformanceTip>
                    )
                ) : null
            }
        >
            {isLoading ? (
                <Skeleton data-testid="content-loader" height={32} inline />
            ) : (
                <BigNumberMetric
                    trendBadge={
                        <TrendBadge
                            prevValue={prevTrendValue}
                            value={trendValue}
                            interpretAs="more-is-better"
                            tooltipData={{
                                period: getBadgeTooltipForPreviousPeriod({
                                    start_datetime: startDate,
                                    end_datetime: endDate,
                                }),
                            }}
                        />
                    }
                >
                    <span className={css.bigNumber}>
                        {formatMetricValue(trendValue)}
                    </span>
                </BigNumberMetric>
            )}
        </MetricCard>
    )
}

export default OverviewCard
