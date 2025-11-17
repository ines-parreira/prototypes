import moment from 'moment'

import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import { TableValueModeSwitch } from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { comparedPeriodString } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { useMetricFormat } from 'domains/reporting/pages/voice/hooks/useMetricFormat'
import { ValueMode } from 'domains/reporting/state/ui/stats/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

type VoiceCallVolumeMetricProps = {
    title: string
    hint: string
    statsFilters: StatsFilters
    moreIsBetter?: boolean
    metricTrend: MetricTrend
    multiFormat?: boolean
} & DashboardChartProps

const getTrendProps = (metricTrend: MetricTrend, moreIsBetter = true) => ({
    value: metricTrend.data?.value || 0,
    prevValue: metricTrend.data?.prevValue || 0,
    format: 'percent' as MetricTrendFormat,
    interpretAs: moreIsBetter
        ? ('more-is-better' as const)
        : ('less-is-better' as const),
})

function VoiceCallVolumeMetric({
    title,
    hint,
    metricTrend,
    statsFilters,
    moreIsBetter = true,
    dashboard,
    chartId,
    multiFormat = false,
}: VoiceCallVolumeMetricProps) {
    const voiceCallsCount = metricTrend.data?.value
    const previousPeriod = getPreviousPeriod(statsFilters.period)

    const {
        metricValue,
        isFetching: isAdditionalDataFetching,
        selectedFormat,
        setSelectedFormat,
    } = useMetricFormat({
        isPercentageEnabled: multiFormat,
        value: voiceCallsCount,
        defaultValueFormat: multiFormat ? 'percent' : 'integer',
        storageKey: chartId,
    })

    return (
        <MetricCard
            title={title}
            chartId={chartId}
            dashboard={dashboard}
            hint={{
                title: hint,
            }}
            isLoading={metricTrend.isFetching || isAdditionalDataFetching}
            titleExtra={
                multiFormat && (
                    <TableValueModeSwitch
                        size="extraSmall"
                        valueMode={
                            selectedFormat === 'percent'
                                ? ValueMode.Percentage
                                : ValueMode.TotalCount
                        }
                        toggleValueMode={() =>
                            setSelectedFormat(
                                selectedFormat === 'percent'
                                    ? 'integer'
                                    : 'percent',
                            )
                        }
                    />
                )
            }
        >
            <BigNumberMetric
                isLoading={metricTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        {...getTrendProps(metricTrend, moreIsBetter)}
                        tooltipData={{
                            period: comparedPeriodString(
                                moment(previousPeriod.start_datetime),
                                moment(previousPeriod.end_datetime),
                            ),
                        }}
                    />
                }
            >
                {metricValue}
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallVolumeMetric
