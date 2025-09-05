import { renderHook } from '@testing-library/react'

import { aiJourneyTotalConversationsQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import useAppSelector from 'hooks/useAppSelector'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { useAIJourneyTotalConversations } from './useAIJourneyTotalConversations'

jest.mock('domains/reporting/hooks/useMetric')
jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/Overview/hooks/useCurrency')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalConversations', () => {
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockUseMetric = useMetric as jest.Mock
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        // Setup mocks
        ;(useCurrency as jest.Mock).mockReturnValue({ currency: 'USD' })

        mockUseAppSelector.mockReturnValue({
            userTimezone: 'America/New_York',
        })

        mockUseMetric.mockReturnValue({
            data: { value: 42 },
            isFetching: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return metric data with correct formatting', () => {
        const journeyId = 'test-journey-id'
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({ journeyId, filters }),
        )

        expect(result.current).toEqual({
            label: 'Total Conversations',
            value: 42,
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            currency: 'USD',
            isLoading: false,
        })

        expect(aiJourneyTotalConversationsQueryFactory).toHaveBeenCalledWith(
            expect.objectContaining({
                period: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            }),
            'America/New_York',
            journeyId,
        )
    })

    it('should handle loading state', () => {
        ;(useMetric as jest.Mock).mockReturnValue({
            data: undefined,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({
                journeyId: 'test-journey-id',
                filters,
            }),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.value).toBe(0)
    })

    it('should handle undefined journeyId', () => {
        const { result } = renderHook(() =>
            useAIJourneyTotalConversations({ journeyId: undefined, filters }),
        )

        expect(aiJourneyTotalConversationsQueryFactory).toHaveBeenCalledWith(
            expect.any(Object),
            'America/New_York',
            undefined,
        )

        expect(result.current).toEqual({
            label: 'Total Conversations',
            value: 42,
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            currency: 'USD',
            isLoading: false,
        })
    })
})
