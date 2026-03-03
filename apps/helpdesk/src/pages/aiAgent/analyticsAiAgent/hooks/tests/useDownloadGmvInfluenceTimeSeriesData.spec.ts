import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useGmvInfluenceOverTimeSeries } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries',
)

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseGmvInfluenceOverTimeSeries = jest.mocked(
    useGmvInfluenceOverTimeSeries,
)

describe('useDownloadGmvInfluenceTimeSeriesData', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('should return isLoading as true when data is fetching', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 1000 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when data is empty array', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is undefined', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: [undefined],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when all values are zero', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: [
                [
                    { dateTime: '2024-01-01', value: 0 },
                    { dateTime: '2024-01-02', value: 0 },
                    { dateTime: '2024-01-03', value: 0 },
                ],
            ],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with time series data', () => {
        const mockTimeSeriesData = [
            [
                { dateTime: '2024-01-01', value: 5000 },
                { dateTime: '2024-01-02', value: 6000 },
                { dateTime: '2024-01-03', value: 7000 },
            ],
        ]

        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) => name.includes('total-sales-timeseries')),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('date')
        expect(csvContent).toContain('total_sales')
    })

    it('should include date range in filename', () => {
        const mockTimeSeriesData = [[{ dateTime: '2024-01-01', value: 1000 }]]

        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadGmvInfluenceTimeSeriesData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('total-sales-timeseries')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should call useGmvInfluenceOverTimeSeries with correct params', () => {
        mockedUseGmvInfluenceOverTimeSeries.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadGmvInfluenceTimeSeriesData())

        expect(mockedUseGmvInfluenceOverTimeSeries).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
            'day',
        )
    })
})
