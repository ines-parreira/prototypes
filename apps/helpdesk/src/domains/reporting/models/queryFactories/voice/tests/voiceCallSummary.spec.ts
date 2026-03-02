import { assumeMock } from '@repo/testing'
import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { VoiceCallSummaryCube } from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import {
    VoiceCallSummaryMeasure,
    VoiceCallSummaryMember,
} from 'domains/reporting/models/cubes/VoiceCallSummaryCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { getAccountBusinessHoursTimezone } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    liveVoiceCallSummaryQueryFactory,
    voiceCallSummaryQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCallSummary'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')

const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)
const getAccountBusinessHoursTimezoneMock = assumeMock(
    getAccountBusinessHoursTimezone,
)

describe('voiceCallSummary queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
        voiceQueues: withDefaultLogicalOperator([1, 2]),
    }
    const timezone = 'utc'

    beforeEach(() => {
        getLiveVoicePeriodFilterMock.mockReturnValue({
            end_datetime: periodEnd,
            start_datetime: periodStart,
        })
        getAccountBusinessHoursTimezoneMock.mockReturnValue(timezone)
    })

    describe('voiceCallSummaryQueryFactory', () => {
        it('should create a query with correct measures and filters', () => {
            const query = voiceCallSummaryQueryFactory(statsFilters, timezone)

            expect(query).toEqual<ReportingQuery<VoiceCallSummaryCube>>({
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
                    VoiceCallSummaryMeasure.VoiceCallSummarySlaAchievementRate,
                ],
                dimensions: [],
                timezone,
                filters: [
                    {
                        member: VoiceCallSummaryMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    },
                    {
                        member: VoiceCallSummaryMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    },
                    {
                        member: VoiceCallSummaryMember.QueueId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1', '2'],
                    },
                ],
                metricName: METRIC_NAMES.VOICE_CALL_SUMMARY,
            })
        })
    })

    describe('liveVoiceCallSummaryQueryFactory', () => {
        it('should create a live query with correct period filters', () => {
            const query = liveVoiceCallSummaryQueryFactory(statsFilters)

            expect(query).toEqual({
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
                    VoiceCallSummaryMeasure.VoiceCallSummarySlaAchievementRate,
                ],
                dimensions: [],
                timezone,
                filters: [
                    expect.objectContaining({
                        member: VoiceCallSummaryMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [periodStart],
                    }),
                    expect.objectContaining({
                        member: VoiceCallSummaryMember.PeriodEnd,
                        operator: ReportingFilterOperator.BeforeDate,
                        values: [periodEnd],
                    }),
                    {
                        member: VoiceCallSummaryMember.QueueId,
                        operator: ReportingFilterOperator.Equals,
                        values: ['1', '2'],
                    },
                ],
                metricName: METRIC_NAMES.VOICE_CALL_SUMMARY,
            })
        })
    })
})
