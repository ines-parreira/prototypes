import { useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { STORES_FILTER_AVAILABILITY_DATE } from 'domains/reporting/pages/common/filters/utils'

import { useAiAgentStatsFilters } from '../useAiAgentStatsFilters'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlagWithLoading: jest.fn(),
}))

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

const mockedUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockedUseStatsFilters = jest.mocked(useStatsFilters)

const oneDayBeforeAvailability = new Date(STORES_FILTER_AVAILABILITY_DATE)
oneDayBeforeAvailability.setDate(oneDayBeforeAvailability.getDate() - 1)

const oneDayAfterAvailability = new Date(STORES_FILTER_AVAILABILITY_DATE)
oneDayAfterAvailability.setDate(oneDayAfterAvailability.getDate() + 1)

const periodBeforeAvailability = {
    start_datetime: oneDayBeforeAvailability.toISOString(),
    end_datetime: STORES_FILTER_AVAILABILITY_DATE.toISOString(),
}

const periodAfterAvailability = {
    start_datetime: oneDayAfterAvailability.toISOString(),
    end_datetime: oneDayAfterAvailability.toISOString(),
}

const mockStores = { values: ['store-1'], operator: 'AND' as const }
const mockChannels = { values: ['email'], operator: 'AND' as const }

describe('useAiAgentStatsFilters', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: periodAfterAvailability,
                stores: mockStores,
                channels: mockChannels,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('includes stores and channels in statsFilters when flag is enabled and period is after availability date', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({
            period: periodAfterAvailability,
            channels: mockChannels,
            stores: mockStores,
        })
    })

    it('includes channels but omits stores when flag is enabled and period is before availability date', () => {
        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: periodBeforeAvailability,
                stores: mockStores,
                channels: mockChannels,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)

        mockedUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({
            period: periodBeforeAvailability,
            channels: mockChannels,
        })
    })

    it('omits stores and channels from statsFilters when flag is disabled', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({
            period: periodAfterAvailability,
        })
    })

    it('omits stores and channels from statsFilters while flag is loading', () => {
        mockedUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: true,
        })

        const { result } = renderHook(() => useAiAgentStatsFilters())

        expect(result.current.statsFilters).toEqual({
            period: periodAfterAvailability,
        })
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
