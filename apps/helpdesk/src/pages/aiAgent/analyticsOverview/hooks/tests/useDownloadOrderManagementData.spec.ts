import { renderHook, waitFor } from '@testing-library/react'

import { useDownloadOrderManagementData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadOrderManagementData'

jest.mock('../useOrderManagementMetrics', () => ({
    fetchOrderManagementMetrics: jest.fn(),
}))

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters', () => {
    const stableReturn = {
        cleanStatsFilters: {
            period: {
                start_datetime: '2024-01-01T00:00:00Z',
                end_datetime: '2024-01-31T23:59:59Z',
            },
        },
        userTimezone: 'UTC',
    }
    return { useStatsFilters: jest.fn(() => stableReturn) }
})

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock('../useOrderManagementMetrics')

const MOCK_FILE_NAME = 'order-management-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Feature,Overall automation rate,Automated interactions\r\nCancel order,18%,2700'

describe('useDownloadOrderManagementData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetch.fetchOrderManagementMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() => useDownloadOrderManagementData())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() => useDownloadOrderManagementData())

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() => useDownloadOrderManagementData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchOrderManagementMetrics with period-only filters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadOrderManagementData())

        await waitFor(() =>
            expect(mockFetch.fetchOrderManagementMetrics).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
                3.1,
            ),
        )
    })
})
