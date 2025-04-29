import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useMetric } from 'hooks/reporting/useMetric'
import useSessionStorage from 'hooks/useSessionStorage'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import {
    formatMetricValue,
    MetricValueFormat,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'

type Args = {
    isPercentageEnabled: boolean
    value?: number | null
    queryFactory?: ReturnType<typeof voiceCallCountQueryFactory>
    defaultValueFormat?: MetricValueFormat
    storageKey?: string
}

export const useMetricFormat = ({
    isPercentageEnabled,
    value,
    queryFactory,
    defaultValueFormat = 'integer',
    storageKey = 'voice-metric-format',
}: Args) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [selectedFormat, setSelectedFormat] =
        useSessionStorage<MetricValueFormat>(storageKey, defaultValueFormat)

    const defaultQueryFactory = voiceCallCountQueryFactory(
        cleanStatsFilters,
        userTimezone,
        VoiceCallSegment.inboundCalls,
    )
    const { data: allCallsMetric, isFetching: isAllCallsMetricFetching } =
        useMetric(queryFactory ?? defaultQueryFactory, isPercentageEnabled)

    const resultedValue =
        selectedFormat === 'percent' && allCallsMetric?.value && value
            ? (value / allCallsMetric?.value) * 100
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
