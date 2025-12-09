import { TrendCard } from '@repo/reporting'
import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { DATE_FORMAT } from '../constants'
import { useCostSavedMetric } from '../hooks/useCostSavedMetric'

export const AnalyticsOverviewCostSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const previousPeriod = getPreviousPeriod(cleanStatsFilters?.period)
    const trend = useCostSavedMetric()

    const trendTooltipData = previousPeriod
        ? `${moment(previousPeriod.start_datetime).format(DATE_FORMAT)} - ${moment(previousPeriod.end_datetime).format(DATE_FORMAT)}`
        : ''

    return (
        <TrendCard
            trend={trend}
            metricFormat="currency-precision-1"
            interpretAs="more-is-better"
            withBorder
            withFixedWidth={false}
            isLoading={trend.isFetching}
            hint={{
                title: 'Cost saved',
                caption:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
            }}
            trendBadgeTooltipData={{ period: trendTooltipData }}
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={trend.data?.label}
                    />
                ) : undefined
            }
        />
    )
}
