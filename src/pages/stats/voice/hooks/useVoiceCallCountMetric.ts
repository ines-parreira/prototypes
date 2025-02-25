import { useMetric } from 'hooks/reporting/useMetric'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'

export const useVoiceCallCountMetric = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
) => {
    return useMetric(voiceCallCountQueryFactory(filters, timezone, segment))
}
