import { renderHook } from '@repo/testing'

import { useAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useDownloadSupportInteractionsTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsTimeSeriesData'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock(
    'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData',
)

const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseAiAgentSupportInteractionsTimeSeriesData = jest.mocked(
    useAiAgentSupportInteractionsTimeSeriesData,
)

describe('useDownloadSupportInteractionsTimeSeriesData', () => {
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
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: [[{ dateTime: '2024-01-01', value: 100 }]],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when data is empty array', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when first series is undefined', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: [undefined],
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when all values are zero', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
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
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with time series data', () => {
        const mockTimeSeriesData = [
            [
                { dateTime: '2024-01-01', value: 100 },
                { dateTime: '2024-01-02', value: 150 },
                { dateTime: '2024-01-03', value: 200 },
            ],
        ]

        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-timeseries'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('date')
        expect(csvContent).toContain('support_interactions')
    })

    it('should include date range in filename', () => {
        const mockTimeSeriesData = [[{ dateTime: '2024-01-01', value: 100 }]]

        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: mockTimeSeriesData,
            isFetching: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsTimeSeriesData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('support-interactions-timeseries')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should call useAiAgentSupportInteractionsTimeSeriesData with correct params', () => {
        mockedUseAiAgentSupportInteractionsTimeSeriesData.mockReturnValue({
            data: undefined,
            isFetching: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadSupportInteractionsTimeSeriesData())

        expect(
            mockedUseAiAgentSupportInteractionsTimeSeriesData,
        ).toHaveBeenCalledWith({ period: mockPeriod }, 'UTC', 'day')
    })
})
