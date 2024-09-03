import {StatsFilters} from 'models/stat/types'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {useMetric} from 'hooks/reporting/useMetric'

export const useVoiceCallCountMetric = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment
) => {
    return useMetric(voiceCallCountQueryFactory(filters, timezone, segment))
}
