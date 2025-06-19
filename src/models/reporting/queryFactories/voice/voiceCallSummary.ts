import {
    VoiceCallSummaryCube,
    VoiceCallSummaryFiltersMembers,
    VoiceCallSummaryMeasure,
} from 'models/reporting/cubes/VoiceCallSummaryCube'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getLiveVoicePeriodFilter } from 'pages/stats/voice/components/LiveVoice/utils'

import {
    getAccountBusinessHoursTimezone,
    getTicketPeriodFilters,
    voiceCallDefaultFilters,
} from './voiceCall'

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
