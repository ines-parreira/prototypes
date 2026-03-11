import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { DurationInMs } from '@repo/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { useFindOpportunitiesByTicketIdOpportunity } from '@gorgias/knowledge-service-queries'
import type { FindOpportunitiesByTicketIdOpportunity200Item } from '@gorgias/knowledge-service-types'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import { useHasAccessToOpportunities } from 'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities'
import { getIntegrationByIdAndType } from 'state/integrations/selectors'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../types'
import { ResourceType } from '../types'
import { mapOpportunityDetailToOpportunity } from '../utils/mapOpportunityDetailToOpportunity'
import { useFindTopOpportunityByTicketId } from './useFindTopOpportunityByTicketId'

jest.mock('@gorgias/knowledge-service-queries', () => ({
    useFindOpportunitiesByTicketIdOpportunity: jest.fn(),
}))
jest.mock('../utils/mapOpportunityDetailToOpportunity', () => ({
    mapOpportunityDetailToOpportunity: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/opportunities/hooks/useHasAccessToOpportunities',
    () => ({
        useHasAccessToOpportunities: jest.fn(),
    }),
)

jest.mock('hooks/useAppSelector')

jest.mock('state/integrations/selectors', () => ({
    getIntegrationByIdAndType: jest.fn(),
}))

describe('useFindTopOpportunityByTicketId', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockOpportunityDetail1: FindOpportunitiesByTicketIdOpportunity200Item =
        {
            id: 123,
            accountId: 456,
            opportunityType: 'FILL_KNOWLEDGE_GAP',
            shopIntegrationId: 789,
            shopName: 'Test Shop',
            createdDatetime: '2024-01-01T00:00:00Z',
            detectionCount: 5,
            detectionObjectIds: ['1', '2', '3', '4', '5'],
            insight: 'Test knowledge gap opportunity',
            knowledgeResource: {
                id: 1,
                sourceId: 'source-123',
                sourceSetId: 'source-set-123',
                title: 'Test Knowledge Gap',
                body: '<p>Test content</p>',
                locale: 'en',
                type: 'article',
                origin: null,
                version: 1,
            },
            resources: [],
        } as FindOpportunitiesByTicketIdOpportunity200Item

    const mockOpportunityDetail2: FindOpportunitiesByTicketIdOpportunity200Item =
        {
            id: 456,
            accountId: 456,
            opportunityType: 'RESOLVE_CONFLICT',
            shopIntegrationId: 789,
            shopName: 'Test Shop',
            createdDatetime: '2024-01-02T00:00:00Z',
            detectionCount: 3,
            detectionObjectIds: ['6', '7', '8'],
            insight: 'Test conflict opportunity',
            resources: [
                {
                    id: 1,
                    sourceId: 'source-1',
                    sourceSetId: 'source-set-1',
                    title: 'Resource 1',
                    body: '<p>Content 1</p>',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: 1,
                    insight: 'Insight 1',
                },
                {
                    id: 2,
                    sourceId: 'source-2',
                    sourceSetId: 'source-set-2',
                    title: 'Resource 2',
                    body: '<p>Content 2</p>',
                    locale: 'en',
                    type: 'article',
                    origin: null,
                    version: 1,
                    insight: 'Insight 2',
                },
            ],
        } as unknown as FindOpportunitiesByTicketIdOpportunity200Item

    const mockMappedOpportunity1: Opportunity = {
        id: '123',
        key: 'ks_123',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
        insight: 'Test knowledge gap opportunity',
        resources: [],
    }

    const mockMappedOpportunity2: Opportunity = {
        id: '456',
        key: 'ks_456',
        type: OpportunityType.RESOLVE_CONFLICT,
        ticketCount: 3,
        detectionObjectIds: ['6', '7', '8'],
        insight: 'Test conflict opportunity',
        resources: [
            {
                title: 'Resource 1',
                content: '<p>Content 1</p>',
                type: ResourceType.GUIDANCE,
                isVisible: true,
                insight: 'Insight 1',
            },
            {
                title: 'Resource 2',
                content: '<p>Content 2</p>',
                type: ResourceType.ARTICLE,
                isVisible: false,
                insight: 'Insight 2',
            },
        ],
    }

    const mockRefetch = jest.fn()

    const mockUseFlag = useFlag as jest.Mock
    const mockUseHasAccessToOpportunities =
        useHasAccessToOpportunities as jest.Mock
    const mockUseAppSelector = useAppSelector as jest.Mock
    const mockGetIntegrationByIdAndType = getIntegrationByIdAndType as jest.Mock

    const mockShopIntegration = {
        id: 789,
        name: 'test-shop',
        type: IntegrationType.Shopify,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockUseFlag.mockReturnValue(true)
        mockUseHasAccessToOpportunities.mockReturnValue(true)
        mockUseAppSelector.mockReturnValue(mockShopIntegration)
        mockGetIntegrationByIdAndType.mockReturnValue(jest.fn())
    })

    describe('SDK hook invocation', () => {
        it('should call useFindOpportunitiesByTicketIdOpportunity with provided shopIntegrationId and ticketId', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: true,
                        refetchOnWindowFocus: false,
                    }),
                }),
            )
        })

        it('should handle empty ticketId string', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, ''), {
                wrapper,
            })

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(789, '', expect.anything())
        })
    })

    describe('options handling', () => {
        it('should default enabled to true when not provided', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: true,
                    }),
                }),
            )
        })

        it('should respect provided enabled option', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(
                () =>
                    useFindTopOpportunityByTicketId(789, '12345', {
                        query: { enabled: false },
                    }),
                { wrapper },
            )

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                    }),
                }),
            )
        })

        it('should default refetchOnWindowFocus to false when not provided', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        refetchOnWindowFocus: false,
                    }),
                }),
            )
        })

        it('should respect provided refetchOnWindowFocus option', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(
                () =>
                    useFindTopOpportunityByTicketId(789, '12345', {
                        query: { refetchOnWindowFocus: true },
                    }),
                { wrapper },
            )

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        refetchOnWindowFocus: true,
                    }),
                }),
            )
        })

        it('should set staleTime to 15 minutes', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        staleTime: DurationInMs.FifteenMinutes,
                    }),
                }),
            )
        })

        it('should handle all options provided together', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(
                () =>
                    useFindTopOpportunityByTicketId(789, '12345', {
                        query: {
                            enabled: false,
                            refetchOnWindowFocus: true,
                        },
                    }),
                { wrapper },
            )

            expect(
                mockUseFindOpportunitiesByTicketIdOpportunity,
            ).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                        refetchOnWindowFocus: true,
                    }),
                }),
            )
        })
    })

    describe('select function', () => {
        it('should use select function to transform response data', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            const mockMapOpportunityDetailToOpportunity =
                mapOpportunityDetailToOpportunity as jest.Mock

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })
            mockMapOpportunityDetailToOpportunity.mockReturnValue(
                mockMappedOpportunity1,
            )

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            const selectFunction =
                mockUseFindOpportunitiesByTicketIdOpportunity.mock.calls[0][2]
                    .query.select

            expect(selectFunction).toBeDefined()

            const result = selectFunction({
                data: [mockOpportunityDetail1],
            })

            expect(mockMapOpportunityDetailToOpportunity).toHaveBeenCalledWith(
                mockOpportunityDetail1,
                0,
                [mockOpportunityDetail1],
            )
            expect(result).toEqual([mockMappedOpportunity1])
        })

        it('should map multiple opportunities in select function', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            const mockMapOpportunityDetailToOpportunity =
                mapOpportunityDetailToOpportunity as jest.Mock

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1, mockMappedOpportunity2],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })
            mockMapOpportunityDetailToOpportunity
                .mockReturnValueOnce(mockMappedOpportunity1)
                .mockReturnValueOnce(mockMappedOpportunity2)

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            const selectFunction =
                mockUseFindOpportunitiesByTicketIdOpportunity.mock.calls[0][2]
                    .query.select

            const result = selectFunction({
                data: [mockOpportunityDetail1, mockOpportunityDetail2],
            })

            expect(mockMapOpportunityDetailToOpportunity).toHaveBeenCalledTimes(
                2,
            )
            expect(result).toEqual([
                mockMappedOpportunity1,
                mockMappedOpportunity2,
            ])
        })
    })

    describe('top opportunity selection logic', () => {
        it('should return null when data is empty', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toBeNull()
        })

        it('should return null when data is undefined', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toBeNull()
        })

        it('should return the only opportunity when there is one', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toEqual(
                mockMappedOpportunity1,
            )
        })

        it('should prioritize RESOLVE_CONFLICT over FILL_KNOWLEDGE_GAP', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            // Knowledge gap has more tickets (5) but conflict should be prioritized
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1, mockMappedOpportunity2],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toEqual(
                mockMappedOpportunity2,
            )
            expect(result.current.topOpportunity?.type).toBe(
                OpportunityType.RESOLVE_CONFLICT,
            )
        })

        it('should select opportunity with higher ticket count when types are the same', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            const knowledgeGap1 = {
                ...mockMappedOpportunity1,
                id: '111',
                ticketCount: 10,
            }
            const knowledgeGap2 = {
                ...mockMappedOpportunity1,
                id: '222',
                ticketCount: 5,
            }

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [knowledgeGap2, knowledgeGap1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toEqual(knowledgeGap1)
            expect(result.current.topOpportunity?.ticketCount).toBe(10)
        })

        it('should handle opportunities with undefined ticket counts', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            const opportunityWithCount = {
                ...mockMappedOpportunity1,
                ticketCount: 5,
            }
            const opportunityWithoutCount = {
                ...mockMappedOpportunity1,
                id: '999',
                ticketCount: undefined,
            }

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [opportunityWithoutCount, opportunityWithCount],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toEqual(opportunityWithCount)
        })

        it('should handle all opportunities with undefined ticket counts', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            const opportunity1 = {
                ...mockMappedOpportunity1,
                ticketCount: undefined,
            }
            const opportunity2 = {
                ...mockMappedOpportunity1,
                id: '999',
                ticketCount: undefined,
            }

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [opportunity1, opportunity2],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            // Should return the first one when counts are equal (both 0)
            expect(result.current.topOpportunity).toEqual(opportunity1)
        })

        it('should handle multiple RESOLVE_CONFLICT opportunities and select one with highest ticket count', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            const conflict1 = {
                ...mockMappedOpportunity2,
                id: '111',
                ticketCount: 3,
            }
            const conflict2 = {
                ...mockMappedOpportunity2,
                id: '222',
                ticketCount: 8,
            }
            const conflict3 = {
                ...mockMappedOpportunity2,
                id: '333',
                ticketCount: 5,
            }

            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [conflict1, conflict2, conflict3],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.topOpportunity).toEqual(conflict2)
            expect(result.current.topOpportunity?.ticketCount).toBe(8)
        })
    })

    describe('return value structure', () => {
        it('should return topOpportunity, isLoading, isError, and refetch', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current).toHaveProperty('topOpportunity')
            expect(result.current).toHaveProperty('isLoading')
            expect(result.current).toHaveProperty('isError')
            expect(result.current).toHaveProperty('refetch')
        })

        it('should return loading state from SDK hook', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.topOpportunity).toBeNull()
        })

        it('should return error state from SDK hook', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.isError).toBe(true)
            expect(result.current.topOpportunity).toBeNull()
        })

        it('should return refetch function from SDK hook', () => {
            const mockUseFindOpportunitiesByTicketIdOpportunity =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockUseFindOpportunitiesByTicketIdOpportunity.mockReturnValue({
                data: [mockMappedOpportunity1],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            const { result } = renderHook(
                () => useFindTopOpportunityByTicketId(789, '12345'),
                { wrapper },
            )

            expect(result.current.refetch).toBe(mockRefetch)
            expect(typeof result.current.refetch).toBe('function')
        })
    })

    describe('shouldFetch conditions', () => {
        it('should disable the query when feature flags are disabled', () => {
            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockSDKHook.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })
            mockUseFlag.mockReturnValue(false)

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })

        it('should disable the query when the user does not have access to opportunities', () => {
            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockSDKHook.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })
            mockUseHasAccessToOpportunities.mockReturnValue(false)

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })

        it('should disable the query when shopIntegrationId is 0', () => {
            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockSDKHook.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(0, '12345'), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                0,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })

        it('should disable the query when ticketId is empty', () => {
            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockSDKHook.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, ''), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                789,
                '',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })

        it('should enable the query when all conditions are met', () => {
            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            mockSDKHook.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: true }),
                }),
            )
        })
    })

    describe('shop integration lookup', () => {
        beforeEach(() => {
            ;(
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock
            ).mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                refetch: mockRefetch,
            })
        })

        it('should call getIntegrationByIdAndType with shopIntegrationId and Shopify type', () => {
            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockGetIntegrationByIdAndType).toHaveBeenCalledWith(
                789,
                IntegrationType.Shopify,
            )
        })

        it('should pass integration name to useHasAccessToOpportunities when integration is found', () => {
            mockUseAppSelector.mockReturnValue({
                ...mockShopIntegration,
                name: 'my-shop',
            })

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockUseHasAccessToOpportunities).toHaveBeenCalledWith(
                'my-shop',
            )
        })

        it('should pass empty string to useHasAccessToOpportunities when integration is not found', () => {
            mockUseAppSelector.mockReturnValue(undefined)

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockUseHasAccessToOpportunities).toHaveBeenCalledWith('')
        })

        it('should disable the query when integration is not found and access check fails', () => {
            mockUseAppSelector.mockReturnValue(undefined)
            mockUseHasAccessToOpportunities.mockReturnValue(false)

            const mockSDKHook =
                useFindOpportunitiesByTicketIdOpportunity as jest.Mock

            renderHook(() => useFindTopOpportunityByTicketId(789, '12345'), {
                wrapper,
            })

            expect(mockSDKHook).toHaveBeenCalledWith(
                789,
                '12345',
                expect.objectContaining({
                    query: expect.objectContaining({ enabled: false }),
                }),
            )
        })
    })
})
