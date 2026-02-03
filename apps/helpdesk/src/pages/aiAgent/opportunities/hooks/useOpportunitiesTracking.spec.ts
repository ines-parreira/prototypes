import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { useOpportunitiesTracking } from './useOpportunitiesTracking'

jest.mock('@repo/logging')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('useOpportunitiesTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return all tracking callbacks', () => {
        const accountId = 123
        const userId = 456

        const { result } = renderHook(() =>
            useOpportunitiesTracking({ accountId, userId }),
        )

        expect(result.current.onOpportunityPageVisited).toBeDefined()
        expect(result.current.onOpportunityViewed).toBeDefined()
        expect(result.current.onOpportunityAccepted).toBeDefined()
        expect(result.current.onOpportunityDismissed).toBeDefined()
    })

    describe('onOpportunityPageVisited', () => {
        it('should log page visited event with account and user context', () => {
            const accountId = 123
            const userId = 456

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityPageVisited()

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityPageVisited,
                { accountId, userId },
            )
        })
    })

    describe('onOpportunityViewed', () => {
        it('should log opportunity viewed event with full context', () => {
            const accountId = 123
            const userId = 456
            const opportunityContext = {
                opportunityId: 'opp-123',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            }

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityViewed(opportunityContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityViewed,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-123',
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                },
            )
        })

        it('should handle different opportunity types', () => {
            const accountId = 123
            const userId = 456
            const opportunityContext = {
                opportunityId: 'opp-456',
                opportunityType: 'RESOLVE_CONFLICT',
            }

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityViewed(opportunityContext)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityViewed,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-456',
                    opportunityType: 'RESOLVE_CONFLICT',
                },
            )
        })
    })

    describe('onOpportunityAccepted', () => {
        it('should log opportunity accepted event for FILL_KNOWLEDGE_GAP without operations', () => {
            const accountId = 123
            const userId = 456
            const opportunityContext = {
                opportunityId: 'opp-789',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            }

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityAccepted(opportunityContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityAccepted,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-789',
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                },
            )
        })

        it('should log opportunity accepted event for RESOLVE_CONFLICT with operations', () => {
            const accountId = 123
            const userId = 456
            const opportunityContext = {
                opportunityId: 'opp-999',
                opportunityType: 'RESOLVE_CONFLICT',
                operations: [
                    {
                        action: 'EDIT',
                        resourceId: 'resource-1',
                        resourceSetId: 'set-1',
                        resourceLocale: 'en',
                        resourceVersion: 'v1',
                    },
                    {
                        action: 'DELETE',
                        resourceId: 'resource-2',
                        resourceSetId: 'set-2',
                        resourceLocale: 'en',
                        resourceVersion: 'v2',
                    },
                    {
                        action: 'DISABLE',
                        resourceId: 'resource-3',
                        resourceSetId: 'set-3',
                        resourceLocale: null,
                        resourceVersion: null,
                    },
                ],
            }

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityAccepted(opportunityContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityAccepted,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-999',
                    opportunityType: 'RESOLVE_CONFLICT',
                    operations: [
                        {
                            action: 'EDIT',
                            resourceId: 'resource-1',
                            resourceSetId: 'set-1',
                            resourceLocale: 'en',
                            resourceVersion: 'v1',
                        },
                        {
                            action: 'DELETE',
                            resourceId: 'resource-2',
                            resourceSetId: 'set-2',
                            resourceLocale: 'en',
                            resourceVersion: 'v2',
                        },
                        {
                            action: 'DISABLE',
                            resourceId: 'resource-3',
                            resourceSetId: 'set-3',
                            resourceLocale: null,
                            resourceVersion: null,
                        },
                    ],
                },
            )
        })
    })

    describe('onOpportunityDismissed', () => {
        it('should log opportunity dismissed event with full context', () => {
            const accountId = 123
            const userId = 456
            const opportunityContext = {
                opportunityId: 'opp-999',
                opportunityType: 'RESOLVE_CONFLICT',
            }

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityDismissed(opportunityContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.OpportunityDismissed,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-999',
                    opportunityType: 'RESOLVE_CONFLICT',
                },
            )
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references when props do not change', () => {
            const accountId = 123
            const userId = 456

            const { result, rerender } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            const callbacks1 = { ...result.current }

            rerender()

            const callbacks2 = { ...result.current }

            expect(callbacks1.onOpportunityPageVisited).toBe(
                callbacks2.onOpportunityPageVisited,
            )
            expect(callbacks1.onOpportunityViewed).toBe(
                callbacks2.onOpportunityViewed,
            )
            expect(callbacks1.onOpportunityAccepted).toBe(
                callbacks2.onOpportunityAccepted,
            )
            expect(callbacks1.onOpportunityDismissed).toBe(
                callbacks2.onOpportunityDismissed,
            )
        })

        it('should update callbacks when accountId changes', () => {
            let accountId = 123
            const userId = 456

            const { result, rerender } = renderHook(
                () => useOpportunitiesTracking({ accountId, userId }),
                {
                    initialProps: { accountId, userId },
                },
            )

            const callback1 = result.current.onOpportunityPageVisited

            accountId = 789
            rerender()

            const callback2 = result.current.onOpportunityPageVisited

            expect(callback1).not.toBe(callback2)
        })

        it('should update callbacks when userId changes', () => {
            const accountId = 123
            let userId = 456

            const { result, rerender } = renderHook(
                () => useOpportunitiesTracking({ accountId, userId }),
                {
                    initialProps: { accountId, userId },
                },
            )

            const callback1 = result.current.onOpportunityPageVisited

            userId = 789
            rerender()

            const callback2 = result.current.onOpportunityPageVisited

            expect(callback1).not.toBe(callback2)
        })
    })

    describe('integration scenarios', () => {
        it('should handle multiple event calls in sequence', () => {
            const accountId = 123
            const userId = 456

            const { result } = renderHook(() =>
                useOpportunitiesTracking({ accountId, userId }),
            )

            result.current.onOpportunityPageVisited()
            result.current.onOpportunityViewed({
                opportunityId: 'opp-1',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            })
            result.current.onOpportunityAccepted({
                opportunityId: 'opp-1',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            })

            expect(mockLogEvent).toHaveBeenCalledTimes(3)
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.OpportunityPageVisited,
                { accountId, userId },
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                2,
                SegmentEvent.OpportunityViewed,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-1',
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                },
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                3,
                SegmentEvent.OpportunityAccepted,
                {
                    accountId,
                    userId,
                    opportunityId: 'opp-1',
                    opportunityType: 'FILL_KNOWLEDGE_GAP',
                },
            )
        })
    })
})
