import moment from 'moment'

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
import {
    liveVoiceCallSummaryQueryFactory,
    voiceCallSummaryQueryFactory,
} from 'domains/reporting/models/queryFactories/voice/voiceCallSummary'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { getLiveVoicePeriodFilter } from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils')
jest.mock('domains/reporting/models/queryFactories/voice/voiceCall')

const getLiveVoicePeriodFilterMock = assumeMock(getLiveVoicePeriodFilter)
const getAccountBusinessHoursTimezoneMock = assumeMock(
    getAccountBusinessHoursTimezone,
)
const getTicketPeriodFiltersMock = assumeMock(getTicketPeriodFilters)
const voiceCallDefaultFiltersMock = assumeMock(voiceCallDefaultFilters)

describe('voiceCallSummary queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'
    const mockFilters = ['mockFilter1', 'mockFilter2']

    beforeEach(() => {
        getLiveVoicePeriodFilterMock.mockReturnValue({
            end_datetime: periodEnd,
            start_datetime: periodStart,
        })
        getAccountBusinessHoursTimezoneMock.mockReturnValue(timezone)
        getTicketPeriodFiltersMock.mockReturnValue({} as any)
        voiceCallDefaultFiltersMock.mockReturnValue(mockFilters as any)
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
                ],
                dimensions: [],
                timezone,
                filters: mockFilters as any,
            })

            expect(voiceCallDefaultFiltersMock).toHaveBeenCalledWith(
                statsFilters,
                false,
                VoiceCallSummaryFiltersMembers,
            )
        })
    })

    describe('liveVoiceCallSummaryQueryFactory', () => {
        it('should create a live query with correct period filters', () => {
            const livePeriod = {
                end_datetime: periodEnd,
                start_datetime: periodStart,
            }
            const expectedFilters = {
                ...statsFilters,
                period: livePeriod,
            }

            liveVoiceCallSummaryQueryFactory(statsFilters)

            expect(getAccountBusinessHoursTimezoneMock).toHaveBeenCalled()
            expect(getLiveVoicePeriodFilterMock).toHaveBeenCalledWith(timezone)
            expect(getTicketPeriodFiltersMock).toHaveBeenCalledWith({
                ...statsFilters,
                period: livePeriod,
            })
            expect(voiceCallDefaultFiltersMock).toHaveBeenCalledWith(
                expectedFilters,
                false,
                VoiceCallSummaryFiltersMembers,
            )
        })
    })
})
