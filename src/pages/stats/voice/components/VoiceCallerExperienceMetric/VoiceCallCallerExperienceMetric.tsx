import moment from 'moment'
import React from 'react'

import TrendBadge from 'pages/stats/TrendBadge'
import BigNumberMetric from 'pages/stats/BigNumberMetric'
import {comparedPeriodString, formatMetricValue} from 'pages/stats/common/utils'
import MetricCard from 'pages/stats/MetricCard'
import {StatsFilters} from 'models/stat/types'
import {getAdvancedVoicePeriodFilters} from 'models/reporting/queryFactories/voice/voiceCall'
import {getPreviousPeriod} from 'utils/reporting'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'

type VoiceCallCallerExperienceMetricProps = {
    title: string
    hint: string
    metricTrend: MetricTrend
    statsFilters: StatsFilters
}

function VoiceCallCallerExperienceMetric({
    title,
    hint,
    statsFilters,
    metricTrend,
}: VoiceCallCallerExperienceMetricProps) {
    const voiceCallsAverageTime = metricTrend.data?.value
    const prevValue = metricTrend.data?.prevValue
    const previousPeriod = getAdvancedVoicePeriodFilters(
        getPreviousPeriod(statsFilters.period)
    )

    return (
        <MetricCard
            title={title}
            hint={{
                title: hint,
            }}
            isLoading={metricTrend.isFetching}
            trendBadge={
                <TrendBadge
                    value={metricTrend.data?.value}
                    prevValue={metricTrend.data?.prevValue}
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
                isLoading={metricTrend.isFetching}
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
