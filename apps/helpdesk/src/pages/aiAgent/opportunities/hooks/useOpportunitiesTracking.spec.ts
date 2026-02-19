import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { OpportunityPageReferrer } from 'pages/aiAgent/opportunities/types'

import { useOpportunitiesTracking } from './useOpportunitiesTracking'

jest.mock('@repo/logging')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
const mockStore = configureStore([])

const createMockStore = (accountId: number, userId: number) => {
    return mockStore({
        currentAccount: fromJS({
            id: accountId,
        }),
        currentUser: fromJS({
            id: userId,
        }),
    })
}

const createWrapper = (store: any) => {
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(Provider, { store }, children)
}

describe('useOpportunitiesTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return all tracking callbacks', () => {
        const accountId = 123
        const userId = 456
        const store = createMockStore(accountId, userId)

        const { result } = renderHook(() => useOpportunitiesTracking(), {
            wrapper: createWrapper(store),
        })

        expect(result.current.onOpportunityPageVisited).toBeDefined()
        expect(result.current.onOpportunityViewed).toBeDefined()
        expect(result.current.onOpportunityAccepted).toBeDefined()
        expect(result.current.onOpportunityDismissed).toBeDefined()
        expect(result.current.onRedirectToOpportunityPage).toBeDefined()
    })

    describe('onOpportunityPageVisited', () => {
        it('should log page visited event with account and user context', () => {
            const accountId = 123
            const userId = 456
            const store = createMockStore(accountId, userId)

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
            const store = createMockStore(accountId, userId)
            const opportunityContext = {
                opportunityId: 'opp-123',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            }

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
            const store = createMockStore(accountId, userId)
            const opportunityContext = {
                opportunityId: 'opp-456',
                opportunityType: 'RESOLVE_CONFLICT',
            }

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
            const store = createMockStore(accountId, userId)
            const opportunityContext = {
                opportunityId: 'opp-789',
                opportunityType: 'FILL_KNOWLEDGE_GAP',
            }

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
            const store = createMockStore(accountId, userId)
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

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
            const store = createMockStore(accountId, userId)
            const opportunityContext = {
                opportunityId: 'opp-999',
                opportunityType: 'RESOLVE_CONFLICT',
            }

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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

    describe('onRedirectToOpportunityPage', () => {
        it('should log redirect event with referrer context', () => {
            const accountId = 123
            const userId = 456
            const store = createMockStore(accountId, userId)
            const redirectContext = {
                referrer: OpportunityPageReferrer.OVERVIEW_PAGE,
            }

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

            result.current.onRedirectToOpportunityPage(redirectContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.RedirectToOpportunityPage,
                {
                    accountId,
                    userId,
                    referrer: 'overview-page',
                },
            )
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references when context does not change', () => {
            const accountId = 123
            const userId = 456
            const store = createMockStore(accountId, userId)

            const { result, rerender } = renderHook(
                () => useOpportunitiesTracking(),
                {
                    wrapper: createWrapper(store),
                },
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
            expect(callbacks1.onRedirectToOpportunityPage).toBe(
                callbacks2.onRedirectToOpportunityPage,
            )
        })
    })

    describe('integration scenarios', () => {
        it('should handle multiple event calls in sequence', () => {
            const accountId = 123
            const userId = 456
            const store = createMockStore(accountId, userId)

            const { result } = renderHook(() => useOpportunitiesTracking(), {
                wrapper: createWrapper(store),
            })

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
