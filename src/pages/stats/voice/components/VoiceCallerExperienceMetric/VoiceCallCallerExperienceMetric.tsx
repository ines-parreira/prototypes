import moment from 'moment'
import React from 'react'

import TrendBadge from 'pages/stats/TrendBadge'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {
    NOT_AVAILABLE_PLACEHOLDER,
    comparedPeriodString,
    formatMetricValue,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import {StatsFilters} from 'models/stat/types'
import {getAdvancedVoicePeriodFilters} from 'models/reporting/queryFactories/voice/voiceCall'
import {getPreviousPeriod} from 'utils/reporting'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {VoiceMetrics} from 'state/ui/stats/drillDownSlice'

import {DrillDownModalTrigger} from 'pages/stats/DrillDownModalTrigger'

type VoiceCallCallerExperienceMetricProps = {
    title: string
    hint: string
    metricTrend: MetricTrend
    statsFilters: StatsFilters
    metricData: VoiceMetrics
    isAnalyticsNewFilters?: boolean
}

function VoiceCallCallerExperienceMetric({
    title,
    hint,
    statsFilters,
    metricTrend,
    metricData,
    isAnalyticsNewFilters = false,
}: VoiceCallCallerExperienceMetricProps) {
    const voiceCallsAverageTime = metricTrend.data?.value
    const previousPeriod = getAdvancedVoicePeriodFilters(
        getPreviousPeriod(statsFilters.period)
    )

    const metricValue = formatMetricValue(
        voiceCallsAverageTime,
        'duration',
        NOT_AVAILABLE_PLACEHOLDER
    )

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={metricTrend.isFetching}
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
                                moment(previousPeriod.end_datetime)
                            ),
                        }}
                    />
                }
            >
                <DrillDownModalTrigger
                    enabled={!!voiceCallsAverageTime}
                    metricData={metricData}
                    useNewFilterData={isAnalyticsNewFilters}
                >
                    {metricValue}
                </DrillDownModalTrigger>
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallCallerExperienceMetric
