import moment from 'moment'

import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { getAdvancedVoicePeriodFilters } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import BigNumberMetric from 'domains/reporting/pages/common/components/BigNumberMetric'
import MetricCard from 'domains/reporting/pages/common/components/MetricCard'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    comparedPeriodString,
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { VoiceMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
