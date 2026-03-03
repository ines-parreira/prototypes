import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadSupportInteractionsByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsByIntentData'
import { useSupportInteractionsByIntent } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportInteractionsByIntent'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useSupportInteractionsByIntent')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseSupportInteractionsByIntent = jest.mocked(
    useSupportInteractionsByIntent,
)

describe('useDownloadSupportInteractionsByIntentData', () => {
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

    it('should return isLoading as true when data is loading', () => {
        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: [{ name: 'Order Status', value: 100 }],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with intent data', () => {
        const mockIntentData = [
            { name: 'Order Status', value: 500 },
            { name: 'Return Request', value: 300 },
            { name: 'Product Info', value: 200 },
        ]

        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-by-intent'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('intent')
        expect(csvContent).toContain('support_interactions')
        expect(csvContent).toContain('Order Status')
        expect(csvContent).toContain('Return Request')
        expect(csvContent).toContain('Product Info')
    })

    it('should filter out items with zero value', () => {
        const mockIntentData = [
            { name: 'Order Status', value: 500 },
            { name: 'Empty Intent', value: 0 },
            { name: 'Product Info', value: 200 },
        ]

        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Order Status')
        expect(csvContent).toContain('Product Info')
        expect(csvContent).not.toContain('Empty Intent')
    })

    it('should replace :: with / in intent names', () => {
        const mockIntentData = [
            { name: 'Order::Status', value: 500 },
            { name: 'Return::Request', value: 300 },
        ]

        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Order/Status')
        expect(csvContent).toContain('Return/Request')
    })

    it('should include date range in filename', () => {
        const mockIntentData = [{ name: 'Test Intent', value: 100 }]

        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('support-interactions-by-intent')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should return empty files when all items have zero value', () => {
        const mockIntentData = [
            { name: 'Intent A', value: 0 },
            { name: 'Intent B', value: 0 },
        ]

        mockedUseSupportInteractionsByIntent.mockReturnValue({
            data: mockIntentData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadSupportInteractionsByIntentData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('intent')
        expect(csvContent).toContain('support_interactions')
    })
})
