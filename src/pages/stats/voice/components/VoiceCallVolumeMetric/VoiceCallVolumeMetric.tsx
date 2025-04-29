import moment from 'moment'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import BigNumberMetric from 'pages/stats/common/components/BigNumberMetric'
import MetricCard from 'pages/stats/common/components/MetricCard'
import { TableValueModeSwitch } from 'pages/stats/common/components/Table/TableValueModeSwitch'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    comparedPeriodString,
    MetricTrendFormat,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { ValueMode } from 'state/ui/stats/types'
import { getPreviousPeriod } from 'utils/reporting'

import { useMetricFormat } from '../../hooks/useMetricFormat'

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
