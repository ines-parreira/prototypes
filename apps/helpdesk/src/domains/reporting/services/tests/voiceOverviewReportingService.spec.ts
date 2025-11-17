import { assumeMock, renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { VOICE_OVERVIEW_REPORT_FILE_NAME } from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallAverageTimeTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend'
import { useVoiceCallCountTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallCountTrend'
import { VoiceCallAverageTimeMetric } from 'domains/reporting/pages/voice/models/types'
import { useVoiceOverviewReportData } from 'domains/reporting/services/voiceOverviewReportingService'
import { agents } from 'fixtures/agents'
import * as files from 'utils/file'

jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallCountTrend')
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
jest.mock('domains/reporting/pages/voice/hooks/useVoiceCallAverageTimeTrend')
const useVoiceCallAverageTimeTrendMock = assumeMock(
    useVoiceCallAverageTimeTrend,
)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('voiceOverviewReportingService', () => {
    const period = {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    }
    const statsFilters: StatsFilters = {
        period,
        agents: {
            values: [agents[0].id],
            operator: LogicalOperatorEnum.ONE_OF,
        },
    }

    const fakeReport = 'someValue'

    describe('useVoiceOverviewReportData', () => {
        it('should fetch and format data', () => {
            useVoiceCallCountTrendMock.mockReturnValue({
                data: { prevValue: 10, value: 15 },
                isFetching: false,
                isError: false,
            })
            useVoiceCallAverageTimeTrendMock.mockReturnValue({
                data: { prevValue: 1, value: 2 },
                isFetching: false,
                isError: false,
            })
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
            })

            const createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport)

            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_REPORT_FILE_NAME,
            )
            const { result } = renderHook(() => useVoiceOverviewReportData())

            expect(result.current).toEqual({
                files: {
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_REPORT_FILE_NAME,
                    )]: fakeReport,
                },
                fileName,
                isLoading: false,
            })
            expect(createCsvMock).toHaveBeenCalledWith([
                [' ', 'current period', 'previous period'],
                ['Total calls', '15', '10'],
                ['Outbound calls', '15', '10'],
                ['Inbound calls', '15', '10'],
                ['Unanswered calls', '15', '10'],
                ['Missed calls', '15', '10'],
                ['Cancelled calls', '15', '10'],
                ['Abandoned calls', '15', '10'],
                ['Callback requests', '15', '10'],
                ['Average wait time', '2', '1'],
                ['Average talk time', '2', '1'],
            ])
            expect(useVoiceCallCountTrendMock).toHaveBeenCalledTimes(8)
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                1,
                statsFilters,
                'UTC',
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                2,
                statsFilters,
                'UTC',
                VoiceCallSegment.outboundCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                3,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                4,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundUnansweredCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                5,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundMissedCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                6,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCancelledCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                7,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundAbandonedCalls,
            )
            expect(useVoiceCallCountTrendMock).toHaveBeenNthCalledWith(
                8,
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCallbackRequestedCalls,
            )
            expect(useVoiceCallAverageTimeTrendMock).toHaveBeenCalledTimes(2)
            expect(useVoiceCallAverageTimeTrendMock).toHaveBeenNthCalledWith(
                1,
                VoiceCallAverageTimeMetric.WaitTime,
                statsFilters,
                'UTC',
            )
            expect(useVoiceCallAverageTimeTrendMock).toHaveBeenNthCalledWith(
                2,
                VoiceCallAverageTimeMetric.TalkTime,
                statsFilters,
                'UTC',
            )
        })

        it('should fetch and format unavailable data', () => {
            useVoiceCallCountTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
            })
            useVoiceCallAverageTimeTrendMock.mockReturnValue({
                isFetching: false,
                isError: false,
            })
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
            })

            const createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport)

            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_REPORT_FILE_NAME,
            )
            const { result } = renderHook(() => useVoiceOverviewReportData())

            expect(result.current).toEqual({
                files: {
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_REPORT_FILE_NAME,
                    )]: fakeReport,
                },
                fileName,
                isLoading: false,
            })

            expect(createCsvMock).toHaveBeenCalledWith([
                [' ', 'current period', 'previous period'],
                ['Total calls', 'N/A', 'N/A'],
                ['Outbound calls', 'N/A', 'N/A'],
                ['Inbound calls', 'N/A', 'N/A'],
                ['Unanswered calls', 'N/A', 'N/A'],
                ['Missed calls', 'N/A', 'N/A'],
                ['Cancelled calls', 'N/A', 'N/A'],
                ['Abandoned calls', 'N/A', 'N/A'],
                ['Callback requests', 'N/A', 'N/A'],
                ['Average wait time', 'N/A', 'N/A'],
                ['Average talk time', 'N/A', 'N/A'],
            ])
        })
    })
})
