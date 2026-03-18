import { renderHook } from '@testing-library/react'

import { useAIJourneyOptOutAfterReply } from 'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply'
import { useAIJourneyOptOutAfterReplyRate } from 'AIJourney/hooks/useAIJourneyOptOutAfterReplyRate/useAIJourneyOptOutAfterReplyRate'
import { useAIJourneyOptOutRate } from 'AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate'
import { useAIJourneyTotalConversations } from 'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations'
import { useAIJourneyTotalOptOuts } from 'AIJourney/hooks/useAIJourneyTotalOptOuts/useAIJourneyTotalOptOuts'
import { useAIJourneyTotalReplies } from 'AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'

import { useAIJourneyAudienceHealthMetrics } from './useAIJourneyAudienceHealthMetrics'

jest.mock(
    'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply',
)
jest.mock(
    'AIJourney/hooks/useAIJourneyOptOutAfterReplyRate/useAIJourneyOptOutAfterReplyRate',
)
jest.mock('AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate')
jest.mock(
    'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations',
)
jest.mock('AIJourney/hooks/useAIJourneyTotalOptOuts/useAIJourneyTotalOptOuts')
jest.mock('AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies')

describe('useAIJourneyAudienceHealthMetrics', () => {
    const integrationId = '123'
    const userTimezone = 'America/New_York'
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }
    const shopName = 'test-shop'
    const journeyIds = ['journey-1', 'journey-2']

    const mockTotalConversations = {
        trend: {
            data: { label: 'Recipients', value: 100, prevValue: 80 },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        hint: { title: 'Recipients hint' },
        drilldownMetricName: AIJourneyMetric.TotalConversations,
    }
    const mockOptOutRate = {
        trend: {
            data: { label: 'Opt-out rate', value: 0.05, prevValue: 0.04 },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'less-is-better',
        metricFormat: 'percent',
        hint: { title: 'Opt-out rate hint' },
    }
    const mockTotalOptOut = {
        trend: {
            data: { label: 'Total opt-outs', value: 5, prevValue: 4 },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        hint: { title: 'Total opt-outs hint' },
        drilldownMetricName: AIJourneyMetric.TotalOptOuts,
    }
    const mockRecipientsWhoReplied = {
        trend: {
            data: { label: 'Replied', value: 30, prevValue: 25 },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        hint: { title: 'Replied hint' },
        drilldownMetricName: AIJourneyMetric.TotalReplies,
    }
    const mockOptOutRateAfterReply = {
        trend: {
            data: {
                label: 'Opt-out rate after reply',
                value: 0.02,
                prevValue: 0.01,
            },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'less-is-better',
        metricFormat: 'percent',
        hint: { title: 'Opt-out after reply rate hint' },
    }
    const mockOptedOutAfterReply = {
        trend: {
            data: { label: 'Opted-out after reply', value: 2, prevValue: 1 },
            isFetching: false,
            isError: false,
        },
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        hint: { title: 'Opted-out after reply hint' },
        drilldownMetricName: AIJourneyMetric.OptOutAfterReply,
    }

    beforeEach(() => {
        ;(useAIJourneyTotalConversations as jest.Mock).mockReturnValue(
            mockTotalConversations,
        )
        ;(useAIJourneyOptOutRate as jest.Mock).mockReturnValue(mockOptOutRate)
        ;(useAIJourneyTotalOptOuts as jest.Mock).mockReturnValue(
            mockTotalOptOut,
        )
        ;(useAIJourneyTotalReplies as jest.Mock).mockReturnValue(
            mockRecipientsWhoReplied,
        )
        ;(useAIJourneyOptOutAfterReplyRate as jest.Mock).mockReturnValue(
            mockOptOutRateAfterReply,
        )
        ;(useAIJourneyOptOutAfterReply as jest.Mock).mockReturnValue(
            mockOptedOutAfterReply,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return an array of 6 metrics in the correct order', () => {
        const { result } = renderHook(() =>
            useAIJourneyAudienceHealthMetrics(
                integrationId,
                userTimezone,
                filters,
                shopName,
                journeyIds,
            ),
        )

        expect(result.current).toHaveLength(6)
        expect(result.current[0]).toBe(mockTotalConversations)
        expect(result.current[1]).toBe(mockOptOutRate)
        expect(result.current[2]).toBe(mockTotalOptOut)
        expect(result.current[3]).toBe(mockRecipientsWhoReplied)
        expect(result.current[4]).toBe(mockOptOutRateAfterReply)
        expect(result.current[5]).toBe(mockOptedOutAfterReply)
    })

    it('should call each sub-hook with the correct arguments', () => {
        renderHook(() =>
            useAIJourneyAudienceHealthMetrics(
                integrationId,
                userTimezone,
                filters,
                shopName,
                journeyIds,
            ),
        )

        expect(useAIJourneyTotalConversations).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            journeyIds,
        )
        expect(useAIJourneyOptOutRate).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            shopName,
            journeyIds,
        )
        expect(useAIJourneyTotalOptOuts).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            journeyIds,
        )
        expect(useAIJourneyTotalReplies).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            journeyIds,
        )
        expect(useAIJourneyOptOutAfterReplyRate).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            journeyIds,
        )
        expect(useAIJourneyOptOutAfterReply).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            journeyIds,
        )
    })

    it('should pass an empty journeyIds array to all sub-hooks', () => {
        renderHook(() =>
            useAIJourneyAudienceHealthMetrics(
                integrationId,
                userTimezone,
                filters,
                shopName,
                [],
            ),
        )

        expect(useAIJourneyTotalConversations).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            [],
        )
        expect(useAIJourneyOptOutRate).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            shopName,
            [],
        )
        expect(useAIJourneyTotalOptOuts).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            [],
        )
        expect(useAIJourneyTotalReplies).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            [],
        )
        expect(useAIJourneyOptOutAfterReplyRate).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            [],
        )
        expect(useAIJourneyOptOutAfterReply).toHaveBeenCalledWith(
            integrationId,
            userTimezone,
            filters,
            [],
        )
    })
})
