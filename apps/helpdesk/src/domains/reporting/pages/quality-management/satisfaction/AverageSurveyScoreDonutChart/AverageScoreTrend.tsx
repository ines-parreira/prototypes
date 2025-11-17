import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { OverviewMetric } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { getBadgeTooltipForPreviousPeriod } from 'domains/reporting/pages/utils'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type {
    AutoQAMetric,
    SatisfactionMetric,
    SlaMetric,
} from 'domains/reporting/state/ui/stats/types'

type Props = {
    useTrend: MetricTrendHook
    title?: string
    drillDownMetric?:
        | OverviewMetric
        | SlaMetric
        | AutoQAMetric
        | SatisfactionMetric
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat?: MetricTrendFormat
    className?: string
}

export const AverageScoreTrend = ({
    title,
    useTrend,
    drillDownMetric,
    interpretAs,
    metricFormat,
    className,
}: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const trend = useTrend(cleanStatsFilters, userTimezone)
    const formattedMetric = formatMetricValue(
        trend.data?.value,
        metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return (
        <BigNumberMetric
            className={className}
            isLoading={!trend.data}
            trendBadge={
                <TrendBadge
                    interpretAs={interpretAs}
                    isLoading={!trend.data}
                    value={trend.data?.value}
                    prevValue={trend.data?.prevValue}
                    tooltipData={{
                        period: getBadgeTooltipForPreviousPeriod(
                            cleanStatsFilters.period,
                        ),
                    }}
                    metricFormat={metricFormat}
                />
            }
        >
            {drillDownMetric ? (
                <DrillDownModalTrigger
                    enabled={!!trend.data?.value}
                    metricData={
                        {
                            title,
                            metricName: drillDownMetric,
                        } as DrillDownMetric
                    }
                >
                    {formattedMetric}
                </DrillDownModalTrigger>
            ) : (
                formattedMetric
            )}
        </BigNumberMetric>
    )
}
