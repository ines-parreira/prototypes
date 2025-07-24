import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import {
    FindAiReasoningAiReasoningParams,
    FindFeedbackParams,
    setDefaultConfig,
} from '@gorgias/knowledge-service-client'
import {
    mockFindAiReasoningAiReasoningHandler,
    mockFindFeedbackHandler,
    mockGetEarliestExecutionFeedbackHandler,
    mockGetRulesProductRecommendationHandler,
} from '@gorgias/knowledge-service-mocks'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import {
    CACHE_TIME_MS,
    knowledgeResourcesDefinitionKeys,
    STALE_TIME_MS,
    useFindAllGuidancesKnowledgeResources,
    useGetEarliestExecution,
    useGetFeedback,
    useGetMessageAiReasoning,
    useGetRulesProductRecommendation,
} from '../queries'

jest.mock('rest_api/knowledge_service_api/client', () => ({
    getGorgiasKsApiClient: jest.fn(),
}))

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

setDefaultConfig({
    baseURL: 'http://localhost:3000',
})

describe('knowledgeService queries', () => {
    const queryClient = mockQueryClient()

    const mockClient = {
        findAllGuidancesKnowledgeResources: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        server.resetHandlers()
        // Clear the getGorgiasKsApiClient mock
        ;(getGorgiasKsApiClient as jest.Mock).mockClear()
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('useGetFeedback', () => {
        const params: FindFeedbackParams = {
            objectId: 'ticket-123',
            objectType: 'TICKET',
        }

        beforeEach(() => {
            const { handler } = mockFindFeedbackHandler()
            server.use(handler)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(() => useGetFeedback(params), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            // Just check that we got some data, don't validate exact structure since MSW generates random data
            expect(result.current.data).toBeDefined()
            expect(result.current.data?.executions).toBeDefined()
        })

        it('should use correct stale and cache times', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetFeedback(params), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: STALE_TIME_MS,
                    cacheTime: CACHE_TIME_MS,
                }),
            )
        })

        it('should allow overriding query options', async () => {
            const customStaleTime = 5000
            const customRetry = false

            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetFeedback(params, {
                        staleTime: customStaleTime,
                        retry: customRetry,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: customStaleTime,
                    retry: customRetry,
                }),
            )
        })
    })

    describe('useGetEarliestExecution', () => {
        beforeEach(() => {
            const { handler } = mockGetEarliestExecutionFeedbackHandler()
            server.use(handler)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(() => useGetEarliestExecution(), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toBeDefined()
        })

        it('should use correct stale and cache times with refetch prevention', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetEarliestExecution(), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: Infinity,
                    cacheTime: CACHE_TIME_MS,
                }),
            )
        })

        it('should allow overriding query options', async () => {
            const customStaleTime = 5000
            const customRetry = false

            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetEarliestExecution({
                        staleTime: customStaleTime,
                        retry: customRetry,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: customStaleTime,
                    retry: customRetry,
                }),
            )
        })

        it('should allow overriding refetch behaviors', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetEarliestExecution({
                        refetchOnWindowFocus: true,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    refetchOnWindowFocus: true,
                }),
            )
        })
    })

    describe('useGetMessageAiReasoning', () => {
        const params: FindAiReasoningAiReasoningParams = {
            objectType: 'TICKET',
            objectId: 'ticket-123',
            messageId: 'message-123',
        }

        beforeEach(() => {
            const { handler } = mockFindAiReasoningAiReasoningHandler()
            server.use(handler)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(
                () => useGetMessageAiReasoning(params),
                {
                    wrapper,
                },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            // Just check that we got some data, the underlying hook handles the API call
            expect(result.current.data).toBeDefined()
        })

        it('should use correct stale and cache times', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetMessageAiReasoning(params), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: STALE_TIME_MS,
                    cacheTime: CACHE_TIME_MS,
                }),
            )
        })

        it('should allow overriding query options', async () => {
            const customStaleTime = 5000
            const customRetry = false

            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetMessageAiReasoning(params, {
                        staleTime: customStaleTime,
                        retry: customRetry,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: customStaleTime,
                    retry: customRetry,
                }),
            )
        })
    })

    describe('useGetRulesProductRecommendation', () => {
        beforeEach(() => {
            const { handler } = mockGetRulesProductRecommendationHandler()
            server.use(handler)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(
                () => useGetRulesProductRecommendation(123),
                {
                    wrapper,
                },
            )

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            // Just check that we got some data, the underlying hook handles the API call
            expect(result.current.data).toBeDefined()
        })

        it('should use correct stale and cache times', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetRulesProductRecommendation(123), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: STALE_TIME_MS,
                    cacheTime: CACHE_TIME_MS,
                }),
            )
        })

        it('should allow overriding query options', async () => {
            const customStaleTime = 5000
            const customRetry = false

            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetRulesProductRecommendation(123, {
                        staleTime: customStaleTime,
                        retry: customRetry,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: customStaleTime,
                    retry: customRetry,
                }),
            )
        })
    })

    describe('knowledgeResourcesDefinitionKeys', () => {
        it('should generate correct all key', () => {
            expect(knowledgeResourcesDefinitionKeys.all()).toEqual([
                'knowledge-resources',
            ])
        })

        it('should generate correct lists key', () => {
            expect(knowledgeResourcesDefinitionKeys.lists()).toEqual([
                'knowledge-resources',
                'list',
            ])
        })

        it('should generate correct list key with params', () => {
            const params: Paths.FindAllGuidancesKnowledgeResources.QueryParameters =
                {
                    accountId: 1,
                    actionsIds: ['1', '2'],
                }
            expect(knowledgeResourcesDefinitionKeys.list(params)).toEqual([
                'knowledge-resources',
                'list',
                params,
            ])
        })
    })

    describe('useFindAllGuidancesKnowledgeResources', () => {
        const params: Paths.FindAllGuidancesKnowledgeResources.QueryParameters =
            {
                accountId: 1,
                actionsIds: ['1', '2'],
            }

        const mockResponse = {
            data: [
                {
                    id: 1,
                    accountId: 1,
                    sourceId: '1',
                    sourceSetId: '1',
                    processingState: 'completed',
                    locale: 'en-GB',
                    body: 'Test body content',
                    title: 'Test Title',
                    tags: ['DEFAULT', 'CONTEXT_SPECIFIC'],
                    type: 'article',
                    createdDatetime: '2025-06-12T13:43:16.179Z',
                    updatedDatetime: '2025-06-12T13:43:16.180Z',
                    metadata: {
                        actions: [
                            {
                                pattern: '$$$00AAAAA7AAA0AAA1A50AAAA00A$$$',
                                id: '01JWBNZKENYVRC2P6K3TDF6BZM',
                            },
                            {
                                pattern: '$$$00BBBBB7BBB0BBB1B50BBBB00B$$$',
                                id: '00BBBBB7BBB0BBB1B50BBBB00B',
                            },
                        ],
                        variables: [
                            {
                                variable: 'customer.name',
                                variableType: 'customer',
                            },
                            {
                                variable: 'order.fulfillment.tracking_url',
                                variableType: 'order',
                            },
                        ],
                    },
                },
            ],
        }

        beforeEach(() => {
            mockClient.findAllGuidancesKnowledgeResources.mockResolvedValue(
                mockResponse,
            )
            ;(getGorgiasKsApiClient as jest.Mock).mockResolvedValue(mockClient)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(
                () =>
                    useFindAllGuidancesKnowledgeResources({
                        accountId: 1,
                        actionsIds: ['1', '2'],
                    }),
                {
                    wrapper,
                },
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(
                mockClient.findAllGuidancesKnowledgeResources,
            ).toHaveBeenCalledWith(
                params,
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )

            expect(result.current.data).toEqual(mockResponse.data)
        })
    })
})
