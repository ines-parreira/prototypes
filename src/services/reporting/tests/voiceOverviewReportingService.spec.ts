import { renderHook } from '@testing-library/react-hooks'

import { agents } from 'fixtures/agents'
import { tags } from 'fixtures/tag'
import { getCsvFileNameWithDates } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { VoiceCallSegment } from 'models/reporting/cubes/VoiceCallCube'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters, StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
    VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
    VOICE_OVERVIEW_REPORT_FILE_NAME,
} from 'pages/stats/voice/constants/voiceOverview'
import { useNewVoiceStatsFilters } from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import { useVoiceCallAverageTimeTrend } from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'
import { useVoiceCallCountTrend } from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import { VoiceCallAverageTimeMetric } from 'pages/stats/voice/models/types'
import {
    DEPRECATED_saveReport,
    DEPRECATED_useVoiceOverviewReportData,
    useVoiceOverviewReportData,
} from 'services/reporting/voiceOverviewReportingService'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import * as files from 'utils/file'
import { assumeMock } from 'utils/testing'

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
const useVoiceCallAverageTimeTrendMock = assumeMock(
    useVoiceCallAverageTimeTrend,
)
jest.mock('pages/stats/voice/hooks/useNewVoiceStatsFilters')
const useNewVoiceStatsFiltersMock = assumeMock(useNewVoiceStatsFilters)

describe('DEPRECATED_useVoiceOverviewReportData', () => {
    const period = {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    }
    const statsFilters: LegacyStatsFilters = {
        period,
        agents: [agents[0].id],
        tags: [tags[0].id],
    }
    const dateSeries: Parameters<typeof DEPRECATED_saveReport>[1] = period
    const data: Parameters<typeof DEPRECATED_saveReport>[0] = {
        averageWaitTimeTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: 3.727272727272727,
            },
        },
        averageTalkTimeTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: null,
                prevValue: 6.142857142857143,
            },
        },
        totalCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 13,
            },
        },
        outboundCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 2,
            },
        },
        inboundCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 11,
            },
        },
        missedCallsCountTrend: {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 6,
            },
        },
    }

    const fakeReport = 'someValue'

    it('should call saveReport with a report', () => {
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)

        const result = DEPRECATED_saveReport(data, dateSeries)

        expect(result).toEqual({
            files: {
                [getCsvFileNameWithDates(
                    period,
                    VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
                )]: fakeReport,
                [getCsvFileNameWithDates(
                    period,
                    VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
                )]: fakeReport,
            },
            fileName: getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_REPORT_FILE_NAME,
            ),
        })
    })

    describe('useVoiceOverviewReportData', () => {
        beforeEach(() => {
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
            useNewVoiceStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: fromLegacyStatsFilters(statsFilters),
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
                isAnalyticsNewFilters: true,
            })
        })

        it('should fetch and format data', () => {
            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_REPORT_FILE_NAME,
            )
            const { result } = renderHook(() =>
                DEPRECATED_useVoiceOverviewReportData(),
            )

            expect(result.current).toEqual({
                files: {
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
                    )]: fakeReport,
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
                    )]: fakeReport,
                },
                fileName,
                isLoading: false,
            })
        })
    })
})

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
            useNewVoiceStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
                isAnalyticsNewFilters: true,
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
                ['Average wait time', '2', '1'],
                ['Average talk time', '2', '1'],
            ])
            expect(useVoiceCallCountTrendMock).toHaveBeenCalledTimes(7)
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
            useNewVoiceStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
                isAnalyticsNewFilters: true,
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
                ['Average wait time', 'N/A', 'N/A'],
                ['Average talk time', 'N/A', 'N/A'],
            ])
        })
    })
})
