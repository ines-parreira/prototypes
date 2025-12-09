import { TrendCard } from '@repo/reporting'
import { DateTimeFormatMapper, DateTimeFormatType } from '@repo/utils'
import moment from 'moment'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

import { useAutomatedInteractionsMetric } from '../hooks/useAutomatedInteractionsMetric'

const DATE_FORMAT = DateTimeFormatMapper[
    DateTimeFormatType.SHORT_DATE_EN_US
] as string

export const AnalyticsOverviewAutomatedInteractionsCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters } = useStatsFilters()
    const previousPeriod = getPreviousPeriod(cleanStatsFilters?.period)
    const trend = useAutomatedInteractionsMetric()

    const trendTooltipData = previousPeriod
        ? `${moment(previousPeriod.start_datetime).format(DATE_FORMAT)} - ${moment(previousPeriod.end_datetime).format(DATE_FORMAT)}`
        : ''
    return (
        <TrendCard
            trend={trend}
            metricFormat="decimal"
            interpretAs="more-is-better"
            isLoading={trend.isFetching}
            withBorder
            withFixedWidth={false}
            hint={{
                title: 'Automated interactions',
                caption:
                    'The number of fully automated interactions solved without any human agent intervention.',
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
