import {StatsFilters} from 'models/stat/types'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {voiceCallCountQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {getPreviousPeriod} from 'utils/reporting'
import {VoiceCallSegment} from 'models/reporting/cubes/VoiceCallCube'

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
