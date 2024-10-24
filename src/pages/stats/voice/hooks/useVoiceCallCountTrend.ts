import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useVoiceCallCountTrend = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment
) =>
    useMetricTrend(
        voiceCallCountQueryFactory(filters, timezone, segment),
        voiceCallCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone,
            segment
        )
    )
