import {StatsFilters} from 'models/stat/types'
import {statsFiltersToReportingFilters} from 'utils/reporting'
import {
    VoiceCallFiltersMembers,
    VoiceCallMeasure,
    VoiceCallSegment,
} from '../../cubes/VoiceCallCube'

export const voiceCallDefaultFilters = (filters: StatsFilters) => [
    ...statsFiltersToReportingFilters(VoiceCallFiltersMembers, filters),
]

export const voiceCallCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment
) => ({
    measures: [VoiceCallMeasure.VoiceCallCount],
    dimensions: [],
    timezone,
    segments: segment ? [segment] : [],
    filters: voiceCallDefaultFilters(filters),
})
