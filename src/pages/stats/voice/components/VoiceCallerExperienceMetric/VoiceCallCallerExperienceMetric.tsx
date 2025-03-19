import moment from 'moment'

import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { getAdvancedVoicePeriodFilters } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import {
    comparedPeriodString,
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { DrillDownModalTrigger } from 'pages/stats/DrillDownModalTrigger'
import MetricCard from 'pages/stats/MetricCard'
import { VoiceMetrics } from 'state/ui/stats/drillDownSlice'
import { getPreviousPeriod } from 'utils/reporting'

type VoiceCallCallerExperienceMetricProps = {
    title: string
    hint: string
    metricTrend: MetricTrend
    statsFilters: StatsFilters
    metricData: VoiceMetrics
} & DashboardChartProps

function VoiceCallCallerExperienceMetric({
    title,
    hint,
    statsFilters,
    metricTrend,
    metricData,
    dashboard,
    chartId,
}: VoiceCallCallerExperienceMetricProps) {
    const voiceCallsAverageTime = metricTrend.data?.value
    const previousPeriod = getAdvancedVoicePeriodFilters(
        getPreviousPeriod(statsFilters.period),
    )

    const metricValue = formatMetricValue(
        voiceCallsAverageTime,
        'duration',
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={metricTrend.isFetching}
            dashboard={dashboard}
            chartId={chartId}
        >
            <BigNumberMetric
                isLoading={metricTrend.isFetching}
                trendBadge={
                    <TrendBadge
                        value={metricTrend.data?.value}
                        prevValue={metricTrend.data?.prevValue}
                        interpretAs={'less-is-better'}
                        tooltipData={{
                            period: comparedPeriodString(
                                moment(previousPeriod.start_datetime),
                                moment(previousPeriod.end_datetime),
                            ),
                        }}
                    />
                }
            >
                <DrillDownModalTrigger
                    enabled={!!voiceCallsAverageTime}
                    metricData={metricData}
                >
                    {metricValue}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallCallerExperienceMetric
