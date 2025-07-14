import {
    VoiceCallMeasure,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { usePostReporting } from 'domains/reporting/models/queries'
import { voiceCallCountQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

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
