import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import {
    CACHE_TIME_MS,
    feedbackDefinitionKeys,
    knowledgeResourcesDefinitionKeys,
    STALE_TIME_MS,
    useFindAllGuidancesKnowledgeResources,
    useGetEarliestExecution,
    useGetFeedback,
    useGetMessageAiReasoning,
} from '../queries'

jest.mock('rest_api/knowledge_service_api/client', () => ({
    getGorgiasKsApiClient: jest.fn(),
}))

describe('knowledgeService queries', () => {
    const queryClient = mockQueryClient()

    const mockClient = {
        findFeedbackFeedback: jest.fn(),
        findAllGuidancesKnowledgeResources: jest.fn(),
        getEarliestExecutionFeedback: jest.fn(),
        findAiReasoningAiReasoning: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(getGorgiasKsApiClient as jest.Mock).mockResolvedValue(mockClient)
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('feedbackDefinitionKeys', () => {
        it('should generate correct all key', () => {
            expect(feedbackDefinitionKeys.all()).toEqual(['feedback'])
        })

        it('should generate correct lists key', () => {
            expect(feedbackDefinitionKeys.lists()).toEqual(['feedback', 'list'])
        })

        it('should generate correct list key with params', () => {
            const params: Paths.FindFeedbackFeedback.QueryParameters = {
                objectId: 'ticket-123',
                objectType: 'TICKET',
            }
            expect(feedbackDefinitionKeys.list(params)).toEqual([
                'feedback',
                'list',
                params,
            ])
        })

        it('should generate correct get key with id', () => {
            expect(feedbackDefinitionKeys.get('123')).toEqual([
                'feedback',
                '123',
            ])
        })

        it('should generate correct earliestExecution key', () => {
            expect(feedbackDefinitionKeys.earliestExecution()).toEqual([
                'feedback',
                'earliestExecution',
            ])
        })

        it('should generate correct getMessageAiReasoning key with params', () => {
            const params: Paths.FindAiReasoningAiReasoning.QueryParameters = {
                objectType: 'TICKET',
                objectId: 'ticket-123',
                messageId: 'message-123',
            }
            expect(
                feedbackDefinitionKeys.getMessageAiReasoning(params),
            ).toEqual(['feedback', 'messageAiReasoning', params])
        })
    })

    describe('useGetFeedback', () => {
        const params: Paths.FindFeedbackFeedback.QueryParameters = {
            objectId: 'ticket-123',
            objectType: 'TICKET',
        }

        const mockResponse = {
            data: {
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: 'Test feedback',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: 'ticket-123',
                                submittedBy: 0,
                                createdDatetime: '2023-01-01T00:00:00.000Z',
                                updatedDatetime: '2023-01-01T00:00:00.000Z',
                            },
                        ],
                        resources: [],
                    },
                ],
            },
        }

        beforeEach(() => {
            mockClient.findFeedbackFeedback.mockResolvedValue(mockResponse)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(() => useGetFeedback(params), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(mockClient.findFeedbackFeedback).toHaveBeenCalledWith(
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
        const mockResponse = {
            data: {
                executionId: 'test-execution-id-123',
                timestamp: '2024-01-01T00:00:00.000Z',
            },
        }

        beforeEach(() => {
            mockClient.getEarliestExecutionFeedback.mockResolvedValue(
                mockResponse,
            )
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(() => useGetEarliestExecution(), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(true)

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(
                mockClient.getEarliestExecutionFeedback,
            ).toHaveBeenCalledWith(
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )

            expect(result.current.data).toEqual(mockResponse.data)
        })

        it('should use correct stale and cache times', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetEarliestExecution(), { wrapper })

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

        it('should use correct query key', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetEarliestExecution(), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: feedbackDefinitionKeys.earliestExecution(),
                }),
            )
        })
    })

    describe('useGetMessageAiReasoning', () => {
        const params: Paths.FindAiReasoningAiReasoning.QueryParameters = {
            objectType: 'TICKET',
            objectId: 'ticket-123',
            messageId: 'message-123',
        }

        const mockResponse = {
            data: {
                executionId: 'exec-123',
                storeConfiguration: {
                    shopName: 'test-shop',
                    shopType: 'shopify',
                },
                resources: [
                    {
                        resourceId: 'resource-1',
                        resourceType: 'ARTICLE',
                        resourceTitle: 'Test Article',
                        resourceSetId: '1',
                    },
                ],
                reasoning: {
                    outcome: 'Test reasoning outcome',
                    response: 'Test reasoning response',
                    task: 'Test reasoning task',
                },
            },
        }

        beforeEach(() => {
            mockClient.findAiReasoningAiReasoning.mockResolvedValue(
                mockResponse,
            )
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

            expect(mockClient.findAiReasoningAiReasoning).toHaveBeenCalledWith(
                params,
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )

            expect(result.current.data).toEqual(mockResponse.data)
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

        it('should use correct query key', async () => {
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetMessageAiReasoning(params), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey:
                        feedbackDefinitionKeys.getMessageAiReasoning(params),
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
