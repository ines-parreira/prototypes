import React from 'react'

import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'

import { TicketChannel } from 'business/types/ticket'
import { agents } from 'fixtures/agents'
import { integrationsState } from 'fixtures/integrations'
import { fetchTableReportData } from 'hooks/reporting/common/useTableReportData'
import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useTimeSeries } from 'hooks/reporting/useTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { LegacyStatsFilters } from 'models/stat/types'
import useAiSalesAgentOverviewReportData, {
    AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
    AI_SALES_AGENT_METRIC_FILE_NAME,
    createReport,
    fetchTopProductRecommendationsReportData,
} from 'pages/stats/automate/aiSalesAgent/hooks/aiSalesAgentReportingService'
import { DEFAULT_TIMEZONE } from 'pages/stats/convert/constants/components'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'
import { fromLegacyStatsFilters } from 'state/stats/utils'
import { assumeMock } from 'utils/testing'

jest.mock('services/reporting/supportPerformanceReportingService')

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('services/reporting/supportPerformanceReportingService')
const saveTrendReportMock = assumeMock(createTrendReport)
const saveTimeSeriesReportMock = assumeMock(createTimeSeriesReport)

jest.mock('hooks/reporting/common/useTrendReportData')
const useTrendReportDataMock = assumeMock(useTrendReportData)

jest.mock('hooks/reporting/common/useTimeSeriesReportData')
const useTimeSeriesReportDataMock = assumeMock(useTimeSeriesReportData)

jest.mock('hooks/reporting/common/useTableReportData', () => ({
    fetchTableReportData: jest.fn(),
    useTableReportData: jest.fn(),
}))

jest.mock('hooks/reporting/common/utils', () => ({
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
