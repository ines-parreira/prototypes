import { useSessionStorage } from '@repo/hooks'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsCountQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'

type Args = {
    isPercentageEnabled: boolean
    percentageOfValue?: number | null
    value?: number | null
    defaultValueFormat?: MetricValueFormat
    storageKey?: string
}

export const useMetricFormat = ({
    isPercentageEnabled,
    value,
    defaultValueFormat = 'integer',
    percentageOfValue,
    storageKey = 'voice-metric-format',
}: Args) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [selectedFormat, setSelectedFormat] =
        useSessionStorage<MetricValueFormat>(storageKey, defaultValueFormat)

    const queryFactory = voiceCallCountQueryFactory(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls,
        undefined,
        undefined,
        METRIC_NAMES.VOICE_INBOUND_CALL_BY_AGENT,
    )
    const hasTotalCount = percentageOfValue !== undefined
    // P2/P3
    const { data: allCallsMetric, isFetching: isAllCallsMetricFetching } =
        useMetric(
            queryFactory,
            voiceCallsCountQueryFactoryV2(
                {
                    filters: cleanStatsFilters,
                    timezone: userTimezone,
                },
                VoiceCallSegment.inboundCalls,
            ),
            isPercentageEnabled && !hasTotalCount,
        )

    const totalCountValue = hasTotalCount
        ? percentageOfValue
        : allCallsMetric?.value

    const resultedValue =
        selectedFormat === 'percent' && totalCountValue && value
            ? (value / totalCountValue) * 100
            : value

    const metricValue = formatMetricValue(
        resultedValue,
        selectedFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

    return {
        metricValue,
        isFetching: isAllCallsMetricFetching,
        selectedFormat,
        setSelectedFormat,
    }
}
