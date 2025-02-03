import {renderHook} from '@testing-library/react-hooks'

import {agents} from 'fixtures/agents'
import {tags} from 'fixtures/tag'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {ReportingGranularity} from 'models/reporting/types'

import {LegacyStatsFilters} from 'models/stat/types'
import {
    VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME,
    VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME,
    VOICE_OVERVIEW_REPORT_FILE_NAME,
} from 'pages/stats/voice/constants/voiceOverview'
import {useNewVoiceStatsFilters} from 'pages/stats/voice/hooks/useNewVoiceStatsFilters'
import {useVoiceCallAverageTimeTrend} from 'pages/stats/voice/hooks/useVoiceCallAverageTimeTrend'

import {useVoiceCallCountTrend} from 'pages/stats/voice/hooks/useVoiceCallCountTrend'
import {
    saveReport,
    useVoiceOverviewReportData,
} from 'services/reporting/voiceOverviewReportingService'
import {fromLegacyStatsFilters} from 'state/stats/utils'
import * as files from 'utils/file'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/voice/hooks/useVoiceCallCountTrend')
const useVoiceCallCountTrendMock = assumeMock(useVoiceCallCountTrend)
jest.mock('pages/stats/voice/hooks/useVoiceCallAverageTimeTrend')
const useVoiceCallAverageTimeTrendMock = assumeMock(
    useVoiceCallAverageTimeTrend
)
jest.mock('pages/stats/voice/hooks/useNewVoiceStatsFilters')
const useNewVoiceStatsFiltersMock = assumeMock(useNewVoiceStatsFilters)

describe('voiceOverviewReportingService', () => {
    const period = {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    }
    const statsFilters: LegacyStatsFilters = {
        period,
        agents: [agents[0].id],
        tags: [tags[0].id],
    }
    const dateSeries: Parameters<typeof saveReport>[1] = period
    const data: Parameters<typeof saveReport>[0] = {
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

    // const period = {
    //     end_datetime: '2024-01-15',
    //     start_datetime: '2024-01-08',
    // }

    const fakeReport = 'someValue'

    it('should call saveReport with a report', () => {
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport)
        // const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        const result = saveReport(data, dateSeries)

        expect(result).toEqual({
            files: {
                [getCsvFileNameWithDates(
                    period,
                    VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME
                )]: fakeReport,
                [getCsvFileNameWithDates(
                    period,
                    VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME
                )]: fakeReport,
            },
            fileName: getCsvFileNameWithDates(
                period,
                VOICE_OVERVIEW_REPORT_FILE_NAME
            ),
        })
    })

    describe('useVoiceOverviewReportData', () => {
        beforeEach(() => {
            useVoiceCallCountTrendMock.mockReturnValue({
                data: {prevValue: 10, value: 15},
                isFetching: false,
                isError: false,
            })
            useVoiceCallAverageTimeTrendMock.mockReturnValue({
                data: {prevValue: 1, value: 2},
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
                VOICE_OVERVIEW_REPORT_FILE_NAME
            )
            const {result} = renderHook(() => useVoiceOverviewReportData())

            expect(result.current).toEqual({
                files: {
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_CALL_EXPERIENCE_REPORT_FILE_NAME
                    )]: fakeReport,
                    [getCsvFileNameWithDates(
                        period,
                        VOICE_OVERVIEW_CALL_VOLUME_REPORT_FILE_NAME
                    )]: fakeReport,
                },
                fileName,
                isLoading: false,
            })
        })
    })
})
