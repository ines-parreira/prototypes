import {
    VoiceCallSummaryCube,
    VoiceCallSummaryFiltersMembers,
    VoiceCallSummaryMeasure,
} from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import {
    getAccountBusinessHoursTimezone,
    getTicketPeriodFilters,
    voiceCallDefaultFilters,
} from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'

export const voiceCallSummaryQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<VoiceCallSummaryCube> => {
    return {
        measures: [
            VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryCancelledTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryAbandonedTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryMissedTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryUnansweredTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryCallbackRequestedTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryAverageTalkTime,
            VoiceCallSummaryMeasure.VoiceCallSummaryAverageWaitTime,
        ],
        dimensions: [],
        timezone,
        filters: voiceCallDefaultFilters(
            filters,
            false,
            VoiceCallSummaryFiltersMembers,
        ),
    }
}

export const liveVoiceCallSummaryQueryFactory = (
    filters: StatsFilters,
): ReportingQuery<VoiceCallSummaryCube> => {
    const timezone = getAccountBusinessHoursTimezone()
    const period = getLiveVoicePeriodFilter(timezone)

    return voiceCallSummaryQueryFactory(
        {
            ...filters,
            period,
            ...getTicketPeriodFilters({ ...filters, period }),
        },
        timezone,
    )
}
