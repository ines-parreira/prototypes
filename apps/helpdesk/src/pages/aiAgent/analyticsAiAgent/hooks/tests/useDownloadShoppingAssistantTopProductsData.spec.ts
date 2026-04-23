import { reportError } from '@repo/logging'
import { act, renderHook, waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { fetchShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics',
    () => ({
        ...jest.requireActual(
            'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics',
        ),
        fetchShoppingAssistantTopProductsData: jest.fn(),
    }),
)
jest.mock('@repo/logging')

const mockUseAutomateFilters = jest.mocked(useAutomateFilters)
const mockFetchShoppingAssistantTopProductsData = jest.mocked(
    fetchShoppingAssistantTopProductsData,
)
const mockReportError = jest.mocked(reportError)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

const defaultFilters = {
    statsFilters: { period: mockPeriod },
    userTimezone: 'UTC',
    granularity: 'day' as any,
}

describe('useDownloadShoppingAssistantTopProductsData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue(defaultFilters)
    })

    it('starts with isLoading true', () => {
        mockFetchShoppingAssistantTopProductsData.mockReturnValue(
            new Promise(() => {}),
        )

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns files and fileName after fetch resolves', async () => {
        const fileName =
            '2024-01-01_2024-01-31-shopping-assistant-top-products.csv'
        const files = { [fileName]: '"Product name"\r\n"Product A"' }

        mockFetchShoppingAssistantTopProductsData.mockResolvedValue({
            fileName,
            files,
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.fileName).toBe(fileName)
        expect(result.current.files).toEqual(files)
    })

    it('sets isLoading false after fetch resolves', async () => {
        mockFetchShoppingAssistantTopProductsData.mockResolvedValue({
            fileName: 'test.csv',
            files: { 'test.csv': '' },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('calls reportError and sets isLoading false on fetch failure', async () => {
        const error = new Error('Network failure')
        mockFetchShoppingAssistantTopProductsData.mockRejectedValue(error)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('returns empty files and fileName on fetch failure', async () => {
        mockFetchShoppingAssistantTopProductsData.mockRejectedValue(
            new Error('fail'),
        )

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('passes statsFilters and userTimezone from useAutomateFilters to fetch', async () => {
        mockFetchShoppingAssistantTopProductsData.mockResolvedValue({
            fileName: 'test.csv',
            files: {},
        })

        renderHook(() => useDownloadShoppingAssistantTopProductsData())

        await waitFor(() => {
            expect(
                mockFetchShoppingAssistantTopProductsData,
            ).toHaveBeenCalledWith({ period: mockPeriod }, 'UTC')
        })
    })

    it('re-fetches when statsFilters change', async () => {
        mockFetchShoppingAssistantTopProductsData.mockResolvedValue({
            fileName: 'test.csv',
            files: { 'test.csv': 'data' },
        })

        const { rerender } = renderHook(() =>
            useDownloadShoppingAssistantTopProductsData(),
        )

        await waitFor(() => {
            expect(
                mockFetchShoppingAssistantTopProductsData,
            ).toHaveBeenCalledTimes(1)
        })

        act(() => {
            mockUseAutomateFilters.mockReturnValue({
                ...defaultFilters,
                statsFilters: {
                    period: {
                        start_datetime: '2024-02-01T00:00:00Z',
                        end_datetime: '2024-02-29T23:59:59Z',
                    },
                },
            })
        })

        rerender()

        await waitFor(() => {
            expect(
                mockFetchShoppingAssistantTopProductsData,
            ).toHaveBeenCalledTimes(2)
        })
    })
})
