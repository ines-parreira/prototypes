import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useAiAgentStatsFilters } from '../useAiAgentStatsFilters'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}
const mockStores = { values: ['store-1'], operator: 'AND' as const }
const mockChannels = { values: ['email'], operator: 'AND' as const }

describe('useAiAgentStatsFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
                stores: mockStores,
                channels: mockChannels,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('includes stores and channels in statsFilters when flag is enabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({
            period: mockPeriod,
            stores: mockStores,
            channels: mockChannels,
        })
    })

    it('omits stores and channels from statsFilters when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({ period: mockPeriod })
    })

    it('omits stores and channels from statsFilters while flag is loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({ period: mockPeriod })
    })

    it('returns userTimezone and granularity from useStatsFilters', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.userTimezone).toBe('UTC')
        expect(result.current.granularity).toBe('day')
    })
})
