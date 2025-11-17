import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import type { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useVoiceCallCountMetric = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    includeLiveData: boolean = false,
) => {
    // P2/P3
    return useMetric(
        voiceCallCountQueryFactory(
            filters,
            timezone,
            segment,
            undefined,
            includeLiveData,
            METRIC_NAMES.VOICE_CALL_COUNT,
        ),
    )
}
