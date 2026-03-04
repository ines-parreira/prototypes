import { renderHook } from '@testing-library/react'

import { useAutomationRateTimeSeriesData } from 'domains/reporting/hooks/automate/useAutomationRateTimeSeriesData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useDownloadAutomationRateTimeSeriesData } from '../useDownloadAutomationRateTimeSeriesData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/automate/useAutomationRateTimeSeriesData')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseAutomationRateTimeSeriesData = jest.mocked(
    useAutomationRateTimeSeriesData,
)

describe('useDownloadAutomationRateTimeSeriesData', () => {
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
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 0.85 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is undefined', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: [undefined],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is empty array', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: [[]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when all values are zero', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
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
            useDownloadAutomationRateTimeSeriesData(),
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

        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
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

        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
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

        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Date')
    })

    it('should include fileName in return value', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 0.85 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadAutomationRateTimeSeriesData(),
        )

        expect(result.current.fileName).toContain('automation-rate-timeseries')
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useAutomationRateTimeSeriesData with correct params', () => {
        mockedUseAutomationRateTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadAutomationRateTimeSeriesData())

        expect(mockedUseAutomationRateTimeSeriesData).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
            'day',
        )
    })
})
