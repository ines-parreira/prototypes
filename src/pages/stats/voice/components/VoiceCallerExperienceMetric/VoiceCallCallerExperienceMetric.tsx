import moment from 'moment'
import React from 'react'

import TrendBadge from 'pages/stats/TrendBadge'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {comparedPeriodString, formatMetricValue} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import {StatsFilters} from 'models/stat/types'
import {getAdvancedVoicePeriodFilters} from 'models/reporting/queryFactories/voice/voiceCall'
import {getPreviousPeriod} from 'utils/reporting'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import {VoiceCallAverageTimeMetric} from 'pages/stats/voice/models/types'

type VoiceCallCallerExperienceMetricProps = {
    metric: VoiceCallAverageTimeMetric
    title: string
    hint: string
    statsFilters: StatsFilters
    userTimezone: string
}

function VoiceCallCallerExperienceMetric({
    metric,
    title,
    hint,
    statsFilters,
    userTimezone,
}: VoiceCallCallerExperienceMetricProps) {
    const voiceCallCountTrend = useVoiceCallAverageTimeTrend(
        metric,
        statsFilters,
        userTimezone
    )
    const voiceCallsAverageTime = voiceCallCountTrend.data?.value
    const prevValue = voiceCallCountTrend.data?.prevValue
    const previousPeriod = getAdvancedVoicePeriodFilters(
        getPreviousPeriod(statsFilters.period)
    )

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={voiceCallCountTrend.isFetching}
            trendBadge={
                <TrendBadge
                    value={voiceCallCountTrend.data?.value}
                    prevValue={voiceCallCountTrend.data?.prevValue}
                    format={'percent'}
                    interpretAs={'less-is-better'}
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
                    typeof prevValue === 'number'
                        ? formatMetricValue(prevValue, 'duration')
                        : undefined
                }
            >
                {typeof voiceCallsAverageTime === 'number'
                    ? formatMetricValue(voiceCallsAverageTime, 'duration')
                    : '-'}
            </BigNumberMetric>
        </MetricCard>
    )
}

export default VoiceCallCallerExperienceMetric
