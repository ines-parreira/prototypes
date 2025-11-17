import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchTableReportData,
    useTableReportData,
} from 'domains/reporting/hooks/common/useTableReportData'
import { useTimeSeriesReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import useAiSalesAgentOverviewReportData, {
    AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
    AI_SALES_AGENT_METRIC_FILE_NAME,
    createReport,
    fetchTopProductRecommendationsReportData,
} from 'domains/reporting/pages/automate/aiSalesAgent/hooks/aiSalesAgentReportingService'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'
import { fromLegacyStatsFilters } from 'domains/reporting/state/stats/utils'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'

jest.mock('domains/reporting/services/supportPerformanceReportingService')

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/services/supportPerformanceReportingService')
const saveTrendReportMock = assumeMock(createTrendReport)
const saveTimeSeriesReportMock = assumeMock(createTimeSeriesReport)

jest.mock('domains/reporting/hooks/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)

jest.mock('domains/reporting/hooks/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)

jest.mock('domains/reporting/hooks/common/useTableReportData', () => ({
    fetchTableReportData: jest.fn(),
    useTableReportData: jest.fn(),
}))
const useTableReportDataMock = assumeMock(useTableReportData)

jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(),
}))

describe('useAiSalesAgentOverviewReportData', () => {
    const defaultStatsFilters: LegacyStatsFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
        channels: [TicketChannel.Chat],
        integrations: [integrationsState.integrations[0].id],
        agents: [agents[0].id],
        tags: [1],
    }

    const defaultTimeSeries = {
        data: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    } as ReturnType<typeof useTimeSeries>

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: fromLegacyStatsFilters(defaultStatsFilters),
            granularity: ReportingGranularity.Day,
            userTimezone: DEFAULT_TIMEZONE,
        })

        saveTrendReportMock.mockReturnValue({
            files: {
                'metrics.csv': 'trend-report-data',
            },
        })

        saveTimeSeriesReportMock.mockReturnValue({
            files: {
                'gmv-influenced-over-time.csv': 'time-series-report-data',
            },
        })

        useTableReportDataMock.mockReturnValue({
            data: {
                totalProductRecommendations: {
                    data: [
                        {
                            btr: 0.1,
                            ctr: 0.5,
                            name: 'Product 1',
                            recommendations: 100,
                        },
                    ],
                },
            },
            isFetching: false,
        })
    })

    it('should fetch data and format the reports', async () => {
        const trendReportData = [
            {
                label: 'string',
                value: '23',
                prevValue: '46',
            },
        ]
        const timeSeriesReportData = [{ label: 'label', ...defaultTimeSeries }]

        useTrendReportDataMock.mockReturnValue({
            isFetching: false,
            data: trendReportData,
        })
        useTimeSeriesReportDataMock.mockReturnValue({
            isFetching: false,
            data: timeSeriesReportData,
        })

        renderHook(useAiSalesAgentOverviewReportData, {
            wrapper: ({ children }) => <div>{children}</div>,
        })

        await waitFor(() => {
            expect(saveTrendReportMock).toHaveBeenCalledWith(
                trendReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    AI_SALES_AGENT_METRIC_FILE_NAME,
                ),
            )

            expect(saveTimeSeriesReportMock).toHaveBeenCalledWith(
                timeSeriesReportData,
                getCsvFileNameWithDates(
                    defaultStatsFilters.period,
                    AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
                ),
            )
        })
    })
})

describe('fetchTopProductRecommendationsReportData', () => {
    const mockFilters = {
        period: {
            start_datetime: '2021-02-03T00:00:00.000Z',
            end_datetime: '2021-02-03T23:59:59.999Z',
        },
    }
    const mockTimezone = 'UTC'
    const mockFileName = 'mock-file.csv'

    beforeEach(() => {
        jest.clearAllMocks()
        ;(fetchTableReportData as jest.Mock).mockResolvedValue([{ data: [] }])
        ;(getCsvFileNameWithDates as jest.Mock).mockReturnValue(mockFileName)
    })

    it('should fetch and return report data successfully', async () => {
        const result = await fetchTopProductRecommendationsReportData(
            mockFilters,
            mockTimezone,
        )

        expect(fetchTableReportData).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            expect.any(Array),
        )
        expect(getCsvFileNameWithDates).toHaveBeenCalledWith(
            mockFilters.period,
            expect.any(String),
        )
        expect(result).toEqual({
            files: expect.any(Object),
            fileName: mockFileName,
            isLoading: false,
            isError: false,
        })
    })

    it('should handle errors and return error state', async () => {
        ;(fetchTableReportData as jest.Mock).mockRejectedValue(
            new Error('Fetch error'),
        )

        const result = await fetchTopProductRecommendationsReportData(
            mockFilters,
            mockTimezone,
        )

        expect(result).toEqual({
            files: {},
            fileName: mockFileName,
            isLoading: false,
            isError: true,
        })
    })
})

describe('createReport', () => {
    const mockFileName = 'mock-file.csv'

    it('should create a report with valid data', () => {
        const mockData = {
            totalProductRecommendations: {
                data: [
                    {
                        btr: 0.1,
                        ctr: 0.5,
                        name: 'Product 1',
                        recommendations: 100,
                    },
                ],
            },
        }

        const result = createReport(mockData, mockFileName)

        expect(result).toEqual({
            files: {
                [mockFileName]: expect.any(String),
            },
            fileName: mockFileName,
        })
    })

    it('should return empty files for undefined data', () => {
        const result = createReport(undefined, mockFileName)

        expect(result).toEqual({
            files: {},
        })
    })
})
