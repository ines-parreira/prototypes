import {
    VoiceCallMeasure,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import { usePostReporting } from 'models/reporting/queries'
import { voiceCallCountQueryFactory } from 'models/reporting/queryFactories/voice/voiceCall'
import { StatsFilters } from 'models/stat/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

import { CALL_LIST_PAGE_SIZE } from '../constants/voiceOverview'

export const useVoiceCallCount = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    perPage = CALL_LIST_PAGE_SIZE,
    statusFilter?: VoiceCallDisplayStatus[],
) => {
    const { data } = usePostReporting<
        { [VoiceCallMeasure.VoiceCallCount]: string }[],
        { [VoiceCallMeasure.VoiceCallCount]: string }[]
    >([voiceCallCountQueryFactory(filters, timezone, segment, statusFilter)], {
        select: (results) => results.data?.data,
    })
    const total = data ? parseInt(data[0][VoiceCallMeasure.VoiceCallCount]) : 0

    return {
        total,
        totalPages: Math.ceil(total / perPage),
    }
}
