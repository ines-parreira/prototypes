import { TrendCard } from '@repo/reporting'
import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { DATE_FORMAT } from '../constants'
import { useTimeSavedMetric } from '../hooks/useTimeSavedMetric'

export const AnalyticsOverviewTimeSavedCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const previousPeriod = getPreviousPeriod(cleanStatsFilters?.period)
    const trend = useTimeSavedMetric()

    const trendTooltipData = previousPeriod
        ? `${moment(previousPeriod.start_datetime).format(DATE_FORMAT)} - ${moment(previousPeriod.end_datetime).format(DATE_FORMAT)}`
        : ''

    return (
        <TrendCard
            trend={trend}
            metricFormat="duration"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Time saved per agent',
                caption:
                    'The time agent would have spent resolving customer inquiries without all automation features.',
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
