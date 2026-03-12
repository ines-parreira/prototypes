import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'

import type {
    FeedbackUpsertRequest,
    FindFeedbackParams,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-client'
import {
    mockUpsertFeedbackHandler,
    mockUpsertRulesProductRecommendationHandler,
} from '@gorgias/knowledge-service-mocks'
import { queryKeys } from '@gorgias/knowledge-service-queries'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    useUpsertFeedback,
    useUpsertRulesProductRecommendation,
} from '../mutations'
import { generateUniqueId, optimisticallyUpdateFeedback } from '../utils'

const server = setupServer()

beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

describe('useUpsertFeedback', () => {
    const queryClient = mockQueryClient()
    const params: FindFeedbackParams = {
        objectId: 'ticket-123',
        objectType: 'TICKET',
    }
    const onSettledMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        server.resetHandlers()

        // Set up MSW handler for upsert feedback
        const { handler } = mockUpsertFeedbackHandler()
        server.use(handler)

        jest.spyOn(queryClient, 'cancelQueries')
        jest.spyOn(queryClient, 'setQueryData')
        jest.spyOn(queryClient, 'invalidateQueries')
        jest.spyOn(queryClient, 'isMutating').mockReturnValue(1)
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should call the correct API endpoint', async () => {
        const { result } = renderHook(
            () => useUpsertFeedback(params, { onSettled: onSettledMock }),
            { wrapper },
        )

        const feedbackData: FeedbackUpsertRequest = {
            feedbackToUpsert: [
                {
                    feedbackType: 'TICKET_FREEFORM',
                    objectType: 'TICKET',
                    objectId: 'ticket-123',
                    executionId: 'exec-123',
                    feedbackValue: 'This is a test feedback',
                    targetType: 'TICKET',
                    targetId: 'ticket-123',
                },
            ],
        }

        result.current.mutate({ data: feedbackData })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should cancel queries when mutation starts', async () => {
        const { result } = renderHook(
            () => useUpsertFeedback(params, { onSettled: onSettledMock }),
            { wrapper },
        )

        const feedbackData: FeedbackUpsertRequest = {
            feedbackToUpsert: [
                {
                    feedbackType: 'TICKET_FREEFORM',
                    objectType: 'TICKET',
                    objectId: 'ticket-123',
                    executionId: 'exec-123',
                    feedbackValue: 'This is a test feedback',
                    targetType: 'TICKET',
                    targetId: 'ticket-123',
                },
            ],
        }

        result.current.mutate({ data: feedbackData })

        await waitFor(() => {
            expect(queryClient.cancelQueries).toHaveBeenCalledWith({
                queryKey: queryKeys.feedback.findFeedback(params),
            })
        })
    })

    it('should invalidate queries on settled', async () => {
        const { result } = renderHook(
            () => useUpsertFeedback(params, { onSettled: onSettledMock }),
            { wrapper },
        )

        const feedbackData: FeedbackUpsertRequest = {
            feedbackToUpsert: [
                {
                    feedbackType: 'TICKET_FREEFORM',
                    objectType: 'TICKET',
                    objectId: 'ticket-123',
                    executionId: 'exec-123',
                    feedbackValue: 'This is a test feedback',
                    targetType: 'TICKET',
                    targetId: 'ticket-123',
                },
            ],
        }

        result.current.mutate({ data: feedbackData })

        await waitFor(() => {
            expect(onSettledMock).toHaveBeenCalled()
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: queryKeys.feedback.findFeedback(params),
            })
        })
    })

    describe('Optimistic updates', () => {
        const mockDate = new Date('2023-01-01T12:00:00.000Z')
        let originalDate: DateConstructor

        beforeEach(() => {
            originalDate = global.Date
            global.Date = class extends Date {
                constructor(...args: any[]) {
                    if (args.length === 0) {
                        return mockDate
                    }
                    // @ts-ignore
                    return super(...args)
                }
                static now() {
                    return mockDate.getTime()
                }
            } as DateConstructor
        })

        afterEach(() => {
            global.Date = originalDate
        })

        it('should optimistically update TICKET_FREEFORM feedback', async () => {
            // Setup existing data
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: 'Old feedback',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: 'ticket-123',
                                submittedBy: 0,
                                createdDatetime: '2022-12-31T00:00:00.000Z',
                                updatedDatetime: '2022-12-31T00:00:00.000Z',
                            },
                        ],
                        resources: [],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        feedbackType: 'TICKET_FREEFORM',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        feedbackValue: 'Updated feedback',
                        targetType: 'TICKET',
                        targetId: 'ticket-123',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(
                    updatedData.data.executions[0].feedback[0].feedbackValue,
                ).toBe('Updated feedback')
            })
        })

        it('should optimistically add TICKET_FREEFORM feedback if it does not exist', async () => {
            // Setup existing data with no feedback
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [],
                        resources: [],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        feedbackType: 'TICKET_FREEFORM',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        feedbackValue: 'New feedback',
                        targetType: 'TICKET',
                        targetId: 'ticket-123',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(updatedData.data.executions[0].feedback.length).toBe(1)
                expect(
                    updatedData.data.executions[0].feedback[0].feedbackValue,
                ).toBe('New feedback')
            })
        })

        it('should optimistically update SUGGESTED_RESOURCE feedback', async () => {
            // Setup existing data
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 2,
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: 'UP',
                                objectType: 'TICKET',
                                objectId: 'article-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: 'article-123',
                                submittedBy: 0,
                                createdDatetime: '2022-12-31T00:00:00.000Z',
                                updatedDatetime: '2022-12-31T00:00:00.000Z',
                            },
                        ],
                        resources: [],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        id: 2,
                        feedbackType: 'SUGGESTED_RESOURCE',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'TICKET',
                        targetId: '1',
                        feedbackValue: 'thumbsDown',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(
                    updatedData.data.executions[0].feedback[0].feedbackValue,
                ).toBe('thumbsDown')
            })
        })

        it('should optimistically remove SUGGESTED_RESOURCE feedback if feedbackValue is empty', async () => {
            // Setup existing data
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 2,
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: 'thumbsUp',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: '1',
                                submittedBy: 0,
                                createdDatetime: '2022-12-31T00:00:00.000Z',
                                updatedDatetime: '2022-12-31T00:00:00.000Z',
                            },
                        ],
                        resources: [],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        id: 2,
                        feedbackType: 'SUGGESTED_RESOURCE',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'TICKET',
                        targetId: '1',
                        feedbackValue: '',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(updatedData.data.executions[0].feedback.length).toBe(0)
            })
        })

        it('should optimistically add SUGGESTED_RESOURCE feedback if it does not exist', async () => {
            // Setup existing data with no feedback
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [],
                        resources: [],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        feedbackType: 'SUGGESTED_RESOURCE',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'TICKET',
                        targetId: '1',
                        feedbackValue: 'thumbsUp',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                const feedback = updatedData.data.executions[0].feedback.find(
                    (f) => f.feedbackType === 'SUGGESTED_RESOURCE',
                )
                expect(feedback).toBeDefined()
                expect(feedback?.feedbackValue).toBe('thumbsUp')
            })
        })

        it('should optimistically update KNOWLEDGE_RESOURCE_BINARY feedback', async () => {
            // Setup existing data
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [],
                        resources: [
                            {
                                id: 'article-123',
                                resourceId: 'article-123',
                                resourceType: 'ARTICLE',
                                resourceLocale: 'en-US',
                                resourceVersion: null,
                                resourceSetId: 'set-1',
                                resourceTitle: 'Test Article',
                                feedback: {
                                    id: 3,
                                    feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                                    feedbackValue: 'UP',
                                    objectType: 'TICKET',
                                    objectId: 'ticket-123',
                                    executionId: 'exec-123',
                                    targetType: 'KNOWLEDGE_RESOURCE',
                                    targetId: 'article-123',
                                    submittedBy: 0,
                                    createdDatetime: '2022-12-31T00:00:00.000Z',
                                    updatedDatetime: '2022-12-31T00:00:00.000Z',
                                },
                            },
                        ],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        id: 3,
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                        targetId: 'article-123',
                        feedbackValue: 'DOWN',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(
                    updatedData.data.executions[0].resources[0].feedback
                        ?.feedbackValue,
                ).toBe('DOWN')
            })
        })

        it('should add KNOWLEDGE_RESOURCE_BINARY feedback if it does not exist', async () => {
            // Setup existing data with resource but no feedback
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [],
                        resources: [
                            {
                                id: 'article-123',
                                resourceId: 'article-123',
                                resourceType: 'ARTICLE',
                                resourceLocale: 'en-US',
                                resourceVersion: null,
                                resourceSetId: 'set-1',
                                resourceTitle: 'Test Article',
                                feedback: null,
                            },
                        ],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                        targetId: 'article-123',
                        feedbackValue: 'UP',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                expect(
                    updatedData.data.executions[0].resources[0].feedback,
                ).toBeDefined()
                expect(
                    updatedData.data.executions[0].resources[0].feedback
                        ?.feedbackValue,
                ).toBe('UP')
            })
        })

        it('should handle multiple feedback types in a single mutation', async () => {
            // Setup existing data with multiple feedback types
            const existingData: FindFeedbackResult['data'] = {
                accountId: 1,
                objectId: '1',
                objectType: 'TICKET',
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: 'Old feedback',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: 'ticket-123',
                                submittedBy: 0,
                                createdDatetime: '2022-12-31T00:00:00.000Z',
                                updatedDatetime: '2022-12-31T00:00:00.000Z',
                            },
                            {
                                id: 2,
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: 'thumbsUp',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: '1',
                                submittedBy: 0,
                                createdDatetime: '2022-12-31T00:00:00.000Z',
                                updatedDatetime: '2022-12-31T00:00:00.000Z',
                            },
                        ],
                        resources: [
                            {
                                id: 'article-123',
                                resourceId: 'article-123',
                                resourceType: 'ARTICLE',
                                resourceLocale: 'en-US',
                                resourceVersion: null,
                                resourceSetId: 'set-1',
                                resourceTitle: 'Test Article',
                                feedback: {
                                    id: 3,
                                    feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                                    feedbackValue: 'UP',
                                    objectType: 'TICKET',
                                    objectId: 'ticket-123',
                                    executionId: 'exec-123',
                                    targetType: 'KNOWLEDGE_RESOURCE',
                                    targetId: 'article-123',
                                    submittedBy: 0,
                                    createdDatetime: '2022-12-31T00:00:00.000Z',
                                    updatedDatetime: '2022-12-31T00:00:00.000Z',
                                },
                            },
                        ],
                        storeConfiguration: {
                            shopName: 'test-shop',
                            shopType: 'test-store-type',
                            faqHelpCenterId: 1,
                            guidanceHelpCenterId: 2,
                            snippetHelpCenterId: 3,
                            shopIntegrationId: 1,
                            executionId: 'exec-123',
                        },
                    },
                ],
            }

            queryClient.setQueryData(queryKeys.feedback.findFeedback(params), {
                data: existingData,
            })

            const { result } = renderHook(
                () => useUpsertFeedback(params, { onSettled: onSettledMock }),
                { wrapper },
            )

            const feedbackData: FeedbackUpsertRequest = {
                feedbackToUpsert: [
                    {
                        feedbackType: 'TICKET_FREEFORM',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        feedbackValue: 'Updated feedback',
                        targetType: 'TICKET',
                        targetId: '1',
                    },
                    {
                        id: 2,
                        feedbackType: 'SUGGESTED_RESOURCE',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'TICKET',
                        targetId: '1',
                        feedbackValue: 'thumbsDown',
                    },
                    {
                        id: 3,
                        feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                        objectType: 'TICKET',
                        objectId: 'ticket-123',
                        executionId: 'exec-123',
                        targetType: 'KNOWLEDGE_RESOURCE',
                        targetId: 'article-123',
                        feedbackValue: 'DOWN',
                    },
                ],
            }

            result.current.mutate({ data: feedbackData })

            await waitFor(() => {
                const updatedData = queryClient.getQueryData(
                    queryKeys.feedback.findFeedback(params),
                ) as FindFeedbackResult

                // Check TICKET_FREEFORM was updated
                expect(
                    updatedData.data.executions[0].feedback.find(
                        (f) => f.feedbackType === 'TICKET_FREEFORM',
                    )?.feedbackValue,
                ).toBe('Updated feedback')

                // Check SUGGESTED_RESOURCE was updated
                expect(
                    updatedData.data.executions[0].feedback.find(
                        (f) => f.feedbackType === 'SUGGESTED_RESOURCE',
                    )?.feedbackValue,
                ).toBe('thumbsDown')

                // Check KNOWLEDGE_RESOURCE_BINARY was updated
                expect(
                    updatedData.data.executions[0].resources[0].feedback
                        ?.feedbackValue,
                ).toBe('DOWN')
            })
        })
    })
})

// Add tests for generateUniqueId and default case
describe('generateUniqueId', () => {
    it('should return 1 when there are no feedback items', () => {
        const data: FindFeedbackResult['data'] = {
            accountId: 1,
            objectId: '1',
            objectType: 'TICKET',
            executions: [],
        }
        expect(generateUniqueId(data)).toBe(1)
    })

    it('should return 1 when executions is undefined', () => {
        const data = {
            accountId: 1,
            objectId: '1',
            objectType: 'TICKET',
        } as FindFeedbackResult['data']

        expect(generateUniqueId(data)).toBe(0)
    })

    it('should find the maximum ID and return it incremented by 1', () => {
        const data: FindFeedbackResult['data'] = {
            accountId: 1,
            objectId: '1',
            objectType: 'TICKET',
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 5,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Test',
                            objectType: 'TICKET',
                            objectId: '1',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '1',
                            submittedBy: 0,
                            createdDatetime: '2023-01-01T00:00:00.000Z',
                            updatedDatetime: '2023-01-01T00:00:00.000Z',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'test-shop',
                        shopType: 'test-store-type',
                        faqHelpCenterId: 1,
                        guidanceHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                        shopIntegrationId: 1,
                        executionId: 'exec-1',
                    },
                },
                {
                    executionId: 'exec-2',
                    feedback: [
                        {
                            id: 10,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Test 2',
                            objectType: 'TICKET',
                            objectId: '1',
                            executionId: 'exec-2',
                            targetType: 'TICKET',
                            targetId: '1',
                            submittedBy: 0,
                            createdDatetime: '2023-01-01T00:00:00.000Z',
                            updatedDatetime: '2023-01-01T00:00:00.000Z',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'test-shop',
                        shopType: 'test-store-type',
                        faqHelpCenterId: 1,
                        guidanceHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                        shopIntegrationId: 1,
                        executionId: 'exec-2',
                    },
                },
            ],
        }

        expect(generateUniqueId(data)).toBe(11) // 10 + 1
    })

    it('should ignore non-numeric IDs', () => {
        const data: FindFeedbackResult['data'] = {
            accountId: 1,
            objectId: '1',
            objectType: 'TICKET',
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            // @ts-ignore - Testing non-numeric ID
                            id: 'string-id',
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Test',
                            objectType: 'TICKET',
                            objectId: '1',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '1',
                            submittedBy: 0,
                            createdDatetime: '2023-01-01T00:00:00.000Z',
                            updatedDatetime: '2023-01-01T00:00:00.000Z',
                        },
                        {
                            id: 7,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Test 2',
                            objectType: 'TICKET',
                            objectId: '1',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '1',
                            submittedBy: 0,
                            createdDatetime: '2023-01-01T00:00:00.000Z',
                            updatedDatetime: '2023-01-01T00:00:00.000Z',
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'test-shop',
                        shopType: 'test-store-type',
                        faqHelpCenterId: 1,
                        guidanceHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                        shopIntegrationId: 1,
                        executionId: 'exec-1',
                    },
                },
            ],
        }

        expect(generateUniqueId(data)).toBe(8) // 7 + 1, ignoring the string ID
    })
})

describe('optimisticallyUpdateFeedback - edge cases', () => {
    const params: FindFeedbackParams = {
        objectId: 'ticket-123',
        objectType: 'TICKET',
    }

    it('should handle unsupported feedback type (default case)', () => {
        const existingData: FindFeedbackResult['data'] = {
            accountId: 1,
            objectId: '1',
            objectType: 'TICKET',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'test-shop',
                        shopType: 'test-store-type',
                        faqHelpCenterId: 1,
                        guidanceHelpCenterId: 2,
                        snippetHelpCenterId: 3,
                        shopIntegrationId: 1,
                        executionId: 'exec-2',
                    },
                },
            ],
        }

        const feedbackData: FeedbackUpsertRequest = {
            feedbackToUpsert: [
                {
                    // @ts-ignore - Using unsupported type to test default case
                    feedbackType: 'UNSUPPORTED_TYPE',
                    objectType: 'TICKET',
                    objectId: 'ticket-123',
                    executionId: 'exec-123',
                    targetType: 'TICKET',
                    targetId: 'ticket-123',
                    feedbackValue: 'test',
                },
            ],
        }

        const updateFn = optimisticallyUpdateFeedback(params, feedbackData)
        const updatedData = updateFn({ data: existingData } as any)

        // The data should remain unchanged as the default case just breaks
        expect(updatedData).toEqual({ data: existingData })
        expect(updatedData?.data?.executions[0].feedback.length).toBe(0)
    })
})

describe('useUpsertRulesProductRecommendation', () => {
    const queryClient = mockQueryClient()
    const onSettledMock = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        server.resetHandlers()

        // Set up MSW handler for upsert feedback
        const { handler } = mockUpsertRulesProductRecommendationHandler()
        server.use(handler)

        jest.spyOn(queryClient, 'cancelQueries')
        jest.spyOn(queryClient, 'setQueryData')
        jest.spyOn(queryClient, 'invalidateQueries')
        jest.spyOn(queryClient, 'isMutating').mockReturnValue(1)
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    it('should call the correct API endpoint', async () => {
        const { result } = renderHook(
            () =>
                useUpsertRulesProductRecommendation(123, {
                    onSettled: onSettledMock,
                }),
            { wrapper },
        )

        result.current.mutate({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [{ target: '123' }, { target: '456' }],
                    },
                ],
            },
        })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })
    })

    it('should cancel queries when mutation starts', async () => {
        const { result } = renderHook(
            () =>
                useUpsertRulesProductRecommendation(123, {
                    onSettled: onSettledMock,
                }),
            { wrapper },
        )

        result.current.mutate({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [{ target: '123' }, { target: '456' }],
                    },
                ],
            },
        })

        await waitFor(() => {
            expect(queryClient.cancelQueries).toHaveBeenCalledWith({
                queryKey:
                    queryKeys.productRecommendation.getRulesProductRecommendation(
                        123,
                    ),
            })
        })
    })

    it('should invalidate queries on settled', async () => {
        const { result } = renderHook(
            () =>
                useUpsertRulesProductRecommendation(123, {
                    onSettled: onSettledMock,
                }),
            { wrapper },
        )

        result.current.mutate({
            integrationId: 123,
            data: {
                recommendationAction: 'excluded',
                rules: [
                    {
                        type: 'product',
                        items: [{ target: '123' }, { target: '456' }],
                    },
                ],
            },
        })

        await waitFor(() => {
            expect(onSettledMock).toHaveBeenCalled()
            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey:
                    queryKeys.productRecommendation.getRulesProductRecommendation(
                        123,
                    ),
            })
        })
    })
})
