import { useSessionStorage } from '@repo/hooks'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    formatMetricValue,
    MetricValueFormat,
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
    )
    const hasTotalCount = percentageOfValue !== undefined
    const { data: allCallsMetric, isFetching: isAllCallsMetricFetching } =
        useMetric(queryFactory, isPercentageEnabled && !hasTotalCount)

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
