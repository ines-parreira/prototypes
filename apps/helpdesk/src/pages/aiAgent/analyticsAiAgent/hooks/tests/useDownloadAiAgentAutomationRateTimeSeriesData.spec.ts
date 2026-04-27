import { renderHook } from '@repo/testing'

import { useAIAgentAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentAutomationRateTimeSeriesData'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomationRateTimeSeriesData',
)

const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseAIAgentAutomationRateTimeSeriesData = jest.mocked(
    useAIAgentAutomationRateTimeSeriesData,
)

describe('useDownloadAiAgentAutomationRateTimeSeriesData', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
    })

    it('should return isLoading as true when data is fetching', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 0.85 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is undefined', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: [undefined],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is empty array', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when all values are zero', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: [
                [
                    { dateTime: '2024-01-01T00:00:00Z', value: 0 },
                    { dateTime: '2024-01-02T00:00:00Z', value: 0 },
                    { dateTime: '2024-01-03T00:00:00Z', value: 0 },
                ],
            ],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV with time series data', () => {
        const mockTimeSeriesData = [
            [
                { dateTime: '2024-01-01T00:00:00Z', value: 0.85 },
                { dateTime: '2024-01-02T00:00:00Z', value: 0.9 },
                { dateTime: '2024-01-03T00:00:00Z', value: 0.87 },
            ],
        ]

        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('automation-rate-timeseries'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Date')
        expect(csvContent).toContain('Automation rate (%)')
    })

    it('should handle null values in time series data', () => {
        const mockTimeSeriesData = [
            [
                { dateTime: '2024-01-01T00:00:00Z', value: null },
                { dateTime: '2024-01-02T00:00:00Z', value: 0.9 },
            ],
        ]

        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Date')
    })

    it('should handle undefined values in time series data', () => {
        const mockTimeSeriesData = [
            [
                { dateTime: '2024-01-01T00:00:00Z', value: undefined },
                { dateTime: '2024-01-02T00:00:00Z', value: 0.85 },
            ],
        ]

        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Date')
    })

    it('should include fileName in return value', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 0.85 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAiAgentAutomationRateTimeSeriesData(),
        )

        expect(result.current.fileName).toContain('automation-rate-timeseries')
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useAIAgentAutomationRateTimeSeriesData with correct params', () => {
        mockedUseAIAgentAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadAiAgentAutomationRateTimeSeriesData())

        expect(
            mockedUseAIAgentAutomationRateTimeSeriesData,
        ).toHaveBeenCalledWith({ period: mockPeriod }, 'UTC', 'day')
    })
})
