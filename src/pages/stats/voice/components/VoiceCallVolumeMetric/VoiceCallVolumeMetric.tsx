import moment from 'moment'
import React from 'react'

import TrendBadge from 'pages/stats/TrendBadge'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {
    comparedPeriodString,
    formatMetricValue,
    MetricTrendFormat,
} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {getPreviousPeriod} from 'utils/reporting'

type VoiceCallVolumeMetricProps = {
    title: string
    hint: string
    statsFilters: StatsFilters
    userTimezone: string
    segment?: VoiceCallSegment
    moreIsBetter?: boolean
}
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
    statsFilters,
    userTimezone,
    segment,
    moreIsBetter = true,
}: VoiceCallVolumeMetricProps) {
    const voiceCallCountTrend = useVoiceCallCountTrend(
        statsFilters,
        userTimezone,
        segment
    )
    const voiceCallsCount = voiceCallCountTrend.data?.value
    const prevValue = voiceCallCountTrend.data?.prevValue
    const previousPeriod = getPreviousPeriod(statsFilters.period)

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={voiceCallCountTrend.isFetching}
            trendBadge={
                <TrendBadge
                    {...getTrendProps(voiceCallCountTrend, moreIsBetter)}
                    tooltip={comparedPeriodString(
                        moment(previousPeriod.start_datetime),
                        moment(previousPeriod.end_datetime)
                    )}
                />
            }
        >
            <BigNumberMetric
                isLoading={voiceCallCountTrend.isFetching}
                from={
                    prevValue !== undefined
                        ? formatMetricValue(prevValue)
                        : undefined
                }
            >
                {voiceCallsCount !== undefined
                    ? formatMetricValue(voiceCallsCount, 'integer')
                    : '-'}
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallVolumeMetric
