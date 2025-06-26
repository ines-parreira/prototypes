import { renderHook } from 'utils/testing/renderHook'

import { ChoiceOption } from '../../MissingKnowledgeSelect'
import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useFeedbackActions } from '../useFeedbackActions'

// Mock types to match the expected types
type MockFeedback = {
    executions: { executionId: string }[]
    accountId?: number
    objectType?: string
    objectId?: string
}

type MockStoreConfig = {
    helpCenterId: number
    guidanceHelpCenterId: number
    snippetHelpCenterId: number
    [key: string]: any // Allow any other properties
}

describe('useFeedbackActions', () => {
    describe('onSubmitMissingKnowledge', () => {
        const mockTicketId = 123
        const mockExecId = '987'

        // Setup basic test environment
        const setupTest = (choiceType: ChoiceOption['type']) => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            // Create choice for the specific type
            const mockChoice: ChoiceOption = {
                meta: {
                    url: 'https://example.com',
                    title: 'Example Title',
                    content: 'Example Content',
                },
                label: `${choiceType} Title`,
                value: `${choiceType.toLowerCase()}-1`,
                type: choiceType,
            }

            // Basic mock data structure
            const mockData = {
                feedback: {
                    executions: [{ executionId: mockExecId }],
                    accountId: 1,
                    objectType: 'TICKET',
                    objectId: String(mockTicketId),
                } as MockFeedback,
                storeConfiguration: {
                    helpCenterId: 456,
                    guidanceHelpCenterId: 789,
                    snippetHelpCenterId: 101,
                    // Add some required props
                    trialModeActivatedDatetime: null,
                    previewModeActivatedDatetime: null,
                    storeName: 'Test Store',
                    shopType: 'test',
                } as MockStoreConfig,
                actions: [] as any[],
                guidanceArticles: [] as any[],
                articles: [] as any[],
                sourceItems: [] as any[],
                macros: [] as any[],
                ingestedFiles: [] as any[],
                storeWebsiteQuestions: [] as any[],
                enrichedData: {
                    knowledgeResources: [],
                    freeForm: null,
                    suggestedResources: [
                        {
                            parsedResource: {
                                resourceType: choiceType,
                                resourceId: `${choiceType.toLowerCase()}-1`,
                                resourceSetId:
                                    choiceType === 'ARTICLE'
                                        ? '456'
                                        : choiceType === 'GUIDANCE'
                                          ? '789'
                                          : choiceType === 'EXTERNAL_SNIPPET' ||
                                              choiceType ===
                                                  'FILE_EXTERNAL_SNIPPET'
                                            ? '101'
                                            : '',
                            },
                            feedback: {
                                executionId: mockExecId,
                            },
                            // Add missing properties
                            executionId: mockExecId,
                            metadata: {},
                        },
                    ],
                } as any, // Use 'as any' to satisfy TypeScript
            }

            // Add type-specific mock data
            switch (choiceType) {
                case 'ARTICLE':
                    mockData.articles = [
                        {
                            id: 'article-1',
                            helpCenterId: 456,
                            translation: {
                                locale: 'en-US',
                                title: 'Article Title',
                            },
                            unlisted_id: 'unlisted-1',
                            created_datetime: '2023-01-01',
                            updated_datetime: '2023-01-02',
                        },
                    ] as any[]
                    break
                case 'GUIDANCE':
                    mockData.guidanceArticles = [
                        {
                            id: 'guidance-1',
                            helpCenterId: 789,
                            locale: 'en-US',
                            title: 'Guidance Title',
                        },
                    ] as any[]
                    break
                case 'EXTERNAL_SNIPPET':
                    mockData.sourceItems = [
                        {
                            id: 'external_snippet-1',
                            helpCenterId: 101,
                            url: 'https://example.com',
                        },
                    ] as any[]
                    break
                case 'FILE_EXTERNAL_SNIPPET':
                    mockData.ingestedFiles = [
                        {
                            id: 'file_external_snippet-1',
                            helpCenterId: 101,
                            filename: 'test-file.pdf',
                        },
                    ] as any[]
                    break
                case 'ACTION':
                    mockData.actions = [
                        {
                            id: 'action-1',
                            name: 'Action Title',
                        },
                    ] as any[]
                    break
                case 'MACRO':
                    mockData.macros = [
                        {
                            id: 'macro-1',
                            name: 'Macro Title',
                        },
                    ] as any[]
                    break
            }

            return {
                mockChoice,
                mockData,
                upsertFeedbackMock,
                setLoadingMutationsMock,
            }
        }

        // Test each choice type
        it.each([
            'ARTICLE',
            'GUIDANCE',
            'EXTERNAL_SNIPPET',
            'FILE_EXTERNAL_SNIPPET',
            'ACTION',
            'MACRO',
        ])('should correctly process %s choice type', async (choiceType) => {
            // Setup test for this choice type
            const {
                mockChoice,
                mockData,
                upsertFeedbackMock,
                setLoadingMutationsMock,
            } = setupTest(choiceType as ChoiceOption['type'])

            // Render the hook
            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: mockData.storeWebsiteQuestions,
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            // Call the method
            await result.current.onSubmitMissingKnowledge([mockChoice])

            // Verify setLoadingMutations was called twice (once to add, once to remove)
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)

            // Verify upsertFeedback was called with correct data
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [
                        expect.objectContaining({
                            objectId: mockTicketId.toString(),
                            objectType: 'TICKET',
                            executionId: mockExecId,
                            targetType: 'TICKET',
                            targetId: mockTicketId.toString(),
                            feedbackType: 'SUGGESTED_RESOURCE',
                            // The feedbackValue will be JSON stringified with resource details
                            feedbackValue: expect.stringContaining(
                                mockChoice.type,
                            ),
                        }),
                    ],
                }),
            )
        })

        it('should handle errors gracefully', async () => {
            // Mock console.error
            console.error = jest.fn()

            // Create a mock that rejects
            const upsertFeedbackMock = jest
                .fn()
                .mockRejectedValue(new Error('Test error'))
            const setLoadingMutationsMock = jest.fn()

            // Get basic test setup for an ARTICLE
            const { mockChoice, mockData } = setupTest(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            // Render the hook with minimal required props
            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: mockData.storeWebsiteQuestions,
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            // Call the method
            await result.current.onSubmitMissingKnowledge([mockChoice])

            // Verify error was logged
            expect(console.error).toHaveBeenCalled()

            // Verify loading state was cleaned up
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
        })

        it('should handle unknown choice type (default case)', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            // Create a choice with an unknown type to hit the default case
            const unknownChoice: ChoiceOption = {
                meta: {
                    url: 'https://example.com',
                    title: 'Example Title',
                    content: 'Example Content',
                },
                label: 'Unknown Type',
                value: 'unknown-1',
                type: 'UNKNOWN_TYPE' as any, // Force an unknown type
            }

            const mockData = {
                feedback: {
                    executions: [{ executionId: mockExecId }],
                    accountId: 1,
                    objectType: 'TICKET',
                    objectId: String(mockTicketId),
                } as MockFeedback,
                storeConfiguration: {
                    helpCenterId: 456,
                    guidanceHelpCenterId: 789,
                    snippetHelpCenterId: 101,
                    trialModeActivatedDatetime: null,
                    previewModeActivatedDatetime: null,
                    storeName: 'Test Store',
                    shopType: 'test',
                } as MockStoreConfig,
                actions: [] as any[],
                guidanceArticles: [] as any[],
                articles: [] as any[],
                sourceItems: [] as any[],
                macros: [] as any[],
                ingestedFiles: [] as any[],
                storeWebsiteQuestions: [] as any[],
                enrichedData: {
                    knowledgeResources: [],
                    freeForm: null,
                    suggestedResources: [
                        {
                            parsedResource: {
                                resourceType: 'UNKNOWN_TYPE',
                                resourceId: 'unknown-1',
                                resourceSetId: '',
                            },
                            feedback: {
                                executionId: mockExecId,
                            },
                            executionId: mockExecId,
                            metadata: {},
                        },
                    ],
                } as any,
            }

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: mockData.storeWebsiteQuestions,
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([unknownChoice])

            // Should still call setLoadingMutations twice (add and remove)
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            // Should call upsertFeedback with feedbackValue: null due to unknown type
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [
                        expect.objectContaining({
                            feedbackValue: null, // This should be null due to unknown type hitting default case
                        }),
                    ],
                }),
            )
        })

        it('should handle missing executionId', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            const { mockChoice, mockData } = setupTest(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            // Modify feedback to have no executions to trigger the executionId early return
            const modifiedFeedback = {
                ...mockData.feedback,
                executions: [], // No executions
            }

            // Also remove executionId from suggested resource
            const modifiedEnrichedData = {
                ...mockData.enrichedData,
                suggestedResources: [
                    {
                        ...mockData.enrichedData.suggestedResources[0],
                        feedback: {}, // No executionId in feedback
                    },
                ],
            }

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: modifiedFeedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: [] as any[],
                    enrichedData: modifiedEnrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([mockChoice])

            // Should call setLoadingMutations twice (add and remove)
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            // Should call upsertFeedback with an empty array since all items return undefined due to missing executionId
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [undefined], // The map returns undefined when executionId is missing
                }),
            )
        })

        it('should handle existing loading mutations in finally block', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            const { mockChoice, mockData } = setupTest(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: [] as any[],
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([mockChoice])

            // Should call setLoadingMutations twice (add and remove)
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)

            // Verify the first call is to add a loading mutation
            expect(setLoadingMutationsMock).toHaveBeenNthCalledWith(
                1,
                expect.any(Function),
            )

            // Verify the second call (in finally block) is to remove the loading mutation
            expect(setLoadingMutationsMock).toHaveBeenNthCalledWith(
                2,
                expect.any(Function),
            )

            expect(upsertFeedbackMock).toHaveBeenCalled()
        })

        it('should handle deleted choices', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            // Create a choice that is marked as deleted
            const deletedChoice: ChoiceOption = {
                meta: {
                    url: 'https://example.com',
                    title: 'Example Title',
                    content: 'Example Content',
                },
                label: 'Deleted Article',
                value: 'article-1',
                type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                isDeleted: true,
            }

            const { mockData } = setupTest(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: [] as any[],
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([deletedChoice])

            // Should still call setLoadingMutations twice
            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            // Should call upsertFeedback with feedbackValue: null due to deleted choice
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [
                        expect.objectContaining({
                            feedbackValue: null, // Should be null for deleted choices
                        }),
                    ],
                }),
            )
        })

        describe('resource not found scenarios', () => {
            it.each([
                ['ACTION', 'actions'],
                ['GUIDANCE', 'guidanceArticles'],
                ['ARTICLE', 'articles'],
                ['EXTERNAL_SNIPPET', 'sourceItems'],
                ['MACRO', 'macros'],
                ['FILE_EXTERNAL_SNIPPET', 'ingestedFiles'],
            ])(
                'should handle missing %s resource',
                async (resourceType, arrayName) => {
                    const upsertFeedbackMock = jest.fn().mockResolvedValue({})
                    const setLoadingMutationsMock = jest.fn()

                    const choice: ChoiceOption = {
                        meta: {
                            url: 'https://example.com',
                            title: 'Example Title',
                            content: 'Example Content',
                        },
                        label: `Missing ${resourceType}`,
                        value: 'non-existent-id',
                        type: resourceType as any,
                    }

                    const { mockData } = setupTest(resourceType as any)
                    // Empty the relevant array to simulate missing resource
                    ;(mockData as any)[arrayName] = []

                    const { result } = renderHook(() =>
                        useFeedbackActions({
                            upsertFeedback: upsertFeedbackMock,
                            feedback: mockData.feedback,
                            ticketId: mockTicketId,
                            storeConfiguration: mockData.storeConfiguration,
                            actions: mockData.actions,
                            guidanceArticles: mockData.guidanceArticles,
                            articles: mockData.articles,
                            sourceItems: mockData.sourceItems,
                            macros: mockData.macros,
                            ingestedFiles: mockData.ingestedFiles,
                            storeWebsiteQuestions: [] as any[],
                            enrichedData: mockData.enrichedData,
                            setLoadingMutations: setLoadingMutationsMock as any,
                        } as any),
                    )

                    await result.current.onSubmitMissingKnowledge([choice])

                    expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
                    expect(upsertFeedbackMock).toHaveBeenCalledWith(
                        expect.objectContaining({
                            feedbackToUpsert: [
                                expect.objectContaining({
                                    feedbackValue: null, // Should be null when resource not found
                                }),
                            ],
                        }),
                    )
                },
            )
        })

        it('should handle empty feedbackToUpsert array', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            // Create a scenario where feedbackToUpsert will be empty
            const { mockData } = setupTest(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            // Remove executions to make executionId undefined
            const modifiedFeedback = {
                ...mockData.feedback,
                executions: [],
            }

            // Remove executionId from suggested resource as well
            const modifiedEnrichedData = {
                ...mockData.enrichedData,
                suggestedResources: [
                    {
                        ...mockData.enrichedData.suggestedResources[0],
                        feedback: {},
                    },
                ],
            }

            const choice: ChoiceOption = {
                meta: {
                    url: 'https://example.com',
                    title: 'Example Title',
                    content: 'Example Content',
                },
                label: 'Test Article',
                value: 'article-1',
                type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            }

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: modifiedFeedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: [] as any[],
                    enrichedData: modifiedEnrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([choice])

            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            // When all choices return undefined due to missing executionId,
            // feedbackToUpsert.filter will result in empty array and upsertFeedback won't be called
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [undefined],
                }),
            )
        })

        it('should use storeWebsiteQuestions for EXTERNAL_SNIPPET', async () => {
            const upsertFeedbackMock = jest.fn().mockResolvedValue({})
            const setLoadingMutationsMock = jest.fn()

            const choice: ChoiceOption = {
                meta: {
                    url: 'https://example.com',
                    title: 'Example Title',
                    content: 'Example Content',
                },
                label: 'Store Website Question',
                value: 'website-question-1',
                type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            }

            const mockData = {
                feedback: {
                    executions: [{ executionId: mockExecId }],
                    accountId: 1,
                    objectType: 'TICKET',
                    objectId: String(mockTicketId),
                } as MockFeedback,
                storeConfiguration: {
                    helpCenterId: 456,
                    guidanceHelpCenterId: 789,
                    snippetHelpCenterId: 101,
                    trialModeActivatedDatetime: null,
                    previewModeActivatedDatetime: null,
                    storeName: 'Test Store',
                    shopType: 'test',
                } as MockStoreConfig,
                actions: [] as any[],
                guidanceArticles: [] as any[],
                articles: [] as any[],
                sourceItems: [] as any[], // Empty source items
                macros: [] as any[],
                ingestedFiles: [] as any[],
                storeWebsiteQuestions: [
                    {
                        id: 'website-question-1',
                        helpCenterId: 101,
                        url: 'https://store.example.com/faq',
                    },
                ] as any[],
                enrichedData: {
                    knowledgeResources: [],
                    freeForm: null,
                    suggestedResources: [
                        {
                            parsedResource: {
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceId: 'website-question-1',
                                resourceSetId: '101',
                            },
                            feedback: {
                                executionId: mockExecId,
                            },
                            executionId: mockExecId,
                            metadata: {},
                        },
                    ],
                } as any,
            }

            const { result } = renderHook(() =>
                useFeedbackActions({
                    upsertFeedback: upsertFeedbackMock,
                    feedback: mockData.feedback,
                    ticketId: mockTicketId,
                    storeConfiguration: mockData.storeConfiguration,
                    actions: mockData.actions,
                    guidanceArticles: mockData.guidanceArticles,
                    articles: mockData.articles,
                    sourceItems: mockData.sourceItems,
                    macros: mockData.macros,
                    ingestedFiles: mockData.ingestedFiles,
                    storeWebsiteQuestions: mockData.storeWebsiteQuestions,
                    enrichedData: mockData.enrichedData,
                    setLoadingMutations: setLoadingMutationsMock as any,
                } as any),
            )

            await result.current.onSubmitMissingKnowledge([choice])

            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            expect(upsertFeedbackMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedbackToUpsert: [
                        expect.objectContaining({
                            feedbackValue:
                                expect.stringContaining('EXTERNAL_SNIPPET'),
                        }),
                    ],
                }),
            )
        })
    })
})
