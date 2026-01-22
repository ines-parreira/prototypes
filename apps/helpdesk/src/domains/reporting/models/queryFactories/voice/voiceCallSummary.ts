import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { VoiceCallSummaryCube } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import {
    VoiceCallSummaryFiltersMembers,
    VoiceCallSummaryMeasure,
} from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { getAccountBusinessHoursTimezone } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { statsFiltersToReportingFilters } from 'domains/reporting/utils/reporting'

export const voiceCallSummaryQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<VoiceCallSummaryCube> => {
    return {
        measures: [
            VoiceCallSummaryMeasure.VoiceCallSummaryInboundTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryOutboundTotal,
            VoiceCallSummaryMeasure.VoiceCallSummaryAnsweredTotal,
            VoiceCallSummaryMeasure.VoiceCallSummarySlaAchievementRate,
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
        filters: statsFiltersToReportingFilters(
            VoiceCallSummaryFiltersMembers,
            filters,
        ),
        metricName: METRIC_NAMES.VOICE_CALL_SUMMARY,
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
        },
        timezone,
    )
}
