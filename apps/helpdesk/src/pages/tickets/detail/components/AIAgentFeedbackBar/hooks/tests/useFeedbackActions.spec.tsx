import { renderHook } from '@repo/testing'

import type { ChoiceOption } from '../../MissingKnowledgeSelect'
import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useFeedbackActions } from '../useFeedbackActions'

const mockDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockDispatch)

// Base types for cleaner mocking
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
    [key: string]: any
}

type MockEnrichedData = {
    knowledgeResources: any[]
    freeForm: null
    suggestedResources: any[]
}

// Test constants
const MOCK_TICKET_ID = 123
const MOCK_EXEC_ID = '987'

// Factory functions for creating mock data
const createMockFeedback = (
    overrides: Partial<MockFeedback> = {},
): MockFeedback => ({
    executions: [{ executionId: MOCK_EXEC_ID }],
    accountId: 1,
    objectType: 'TICKET',
    objectId: String(MOCK_TICKET_ID),
    ...overrides,
})

const createMockStoreConfig = (
    overrides: Partial<MockStoreConfig> = {},
): MockStoreConfig => ({
    helpCenterId: 456,
    guidanceHelpCenterId: 789,
    snippetHelpCenterId: 101,
    previewModeActivatedDatetime: null,
    storeName: 'Test Store',
    shopType: 'test',
    ...overrides,
})

const createMockEnrichedData = (
    overrides: Partial<MockEnrichedData> = {},
): MockEnrichedData => ({
    knowledgeResources: [],
    freeForm: null,
    suggestedResources: [],
    ...overrides,
})

const createMockChoice = (
    type: ChoiceOption['type'],
    overrides: Partial<ChoiceOption> = {},
): ChoiceOption => ({
    meta: {
        url: 'https://example.com',
        title: 'Example Title',
        content: 'Example Content',
    },
    label: `${type} Title`,
    value: `${type.toLowerCase()}-1`,
    type,
    ...overrides,
})

// Create suggested resource for choice type
const createSuggestedResource = (choice: ChoiceOption) => ({
    parsedResource: {
        resourceType: choice.type,
        resourceId: choice.value,
        resourceSetId: getResourceSetId(choice.type),
    },
    feedback: {
        executionId: MOCK_EXEC_ID,
    },
    executionId: MOCK_EXEC_ID,
    metadata: {},
})

const getResourceSetId = (type: ChoiceOption['type']): string => {
    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
            return '456'
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
            return '789'
        case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
        case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
        case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
            return '101'
        default:
            return ''
    }
}

// Create resource data for specific types
const createResourceData = (
    type: ChoiceOption['type'],
    id: string = `${type.toLowerCase()}-1`,
) => {
    switch (type) {
        case AiAgentKnowledgeResourceTypeEnum.ARTICLE:
            return {
                articles: [
                    {
                        id,
                        helpCenterId: 456,
                        translation: {
                            locale: 'en-US',
                            title: 'Article Title',
                        },
                        unlisted_id: 'unlisted-1',
                        created_datetime: '2023-01-01',
                        updated_datetime: '2023-01-02',
                    },
                ],
            }
        case AiAgentKnowledgeResourceTypeEnum.GUIDANCE:
            return {
                guidanceArticles: [
                    {
                        id,
                        helpCenterId: 789,
                        locale: 'en-US',
                        title: 'Guidance Title',
                    },
                ],
            }
        case AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET:
            return {
                sourceItems: [
                    {
                        id,
                        helpCenterId: 101,
                        url: 'https://example.com',
                    },
                ],
            }
        case AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET:
            return {
                ingestedFiles: [
                    {
                        id,
                        helpCenterId: 101,
                        filename: 'test-file.pdf',
                    },
                ],
            }
        case AiAgentKnowledgeResourceTypeEnum.ACTION:
            return {
                actions: [
                    {
                        id,
                        name: 'Action Title',
                    },
                ],
            }
        case AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET:
            return {
                storeWebsiteQuestions: [
                    {
                        id,
                        helpCenterId: 101,
                        url: 'https://store.example.com/faq',
                        article_id: 12345,
                    },
                ],
            }
        default:
            return {}
    }
}

// Helper for creating complete mock data
const createMockData = (
    choiceType: ChoiceOption['type'] = AiAgentKnowledgeResourceTypeEnum.ARTICLE,
    overrides: any = {},
) => {
    const choice = createMockChoice(choiceType)
    const resourceData = createResourceData(choiceType)

    return {
        feedback: createMockFeedback(),
        storeConfiguration: createMockStoreConfig(),
        actions: [],
        guidanceArticles: [],
        articles: [],
        sourceItems: [],
        ingestedFiles: [],
        storeWebsiteQuestions: [],
        enrichedData: createMockEnrichedData({
            suggestedResources: [createSuggestedResource(choice)],
        }),
        ...resourceData,
        ...overrides,
    }
}

// Helper for rendering hook
const renderHookWithData = (
    mockData: ReturnType<typeof createMockData>,
    mocks = {
        upsertFeedback: jest.fn().mockResolvedValue({}),
        setLoadingMutations: jest.fn(),
    },
) => {
    const hookResult = renderHook(() =>
        useFeedbackActions({
            upsertFeedback: mocks.upsertFeedback,
            feedback: mockData.feedback,
            ticketId: MOCK_TICKET_ID,
            storeConfiguration: mockData.storeConfiguration,
            actions: mockData.actions,
            guidanceArticles: mockData.guidanceArticles,
            articles: mockData.articles,
            sourceItems: mockData.sourceItems,
            ingestedFiles: mockData.ingestedFiles,
            storeWebsiteQuestions: mockData.storeWebsiteQuestions,
            enrichedData: mockData.enrichedData,
            setLoadingMutations: mocks.setLoadingMutations,
        } as any),
    )

    return {
        result: hookResult.result,
        mocks,
    }
}

describe('useFeedbackActions', () => {
    beforeEach(() => {
        mockDispatch.mockClear()
    })

    describe('onSubmitMissingKnowledge', () => {
        // Test all choice types with parameterized test
        it.each([
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            AiAgentKnowledgeResourceTypeEnum.ACTION,
        ] as const)(
            'should correctly process %s choice type',
            async (choiceType) => {
                const mockData = createMockData(choiceType)
                const { result, mocks } = renderHookWithData(mockData)
                const mockChoice = createMockChoice(choiceType)

                await result.current.onSubmitMissingKnowledge([mockChoice])

                expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
                expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: {
                            feedbackToUpsert: [
                                expect.objectContaining({
                                    objectId: MOCK_TICKET_ID.toString(),
                                    objectType: 'TICKET',
                                    executionId: MOCK_EXEC_ID,
                                    targetType: 'TICKET',
                                    targetId: MOCK_TICKET_ID.toString(),
                                    feedbackType: 'SUGGESTED_RESOURCE',
                                    feedbackValue:
                                        expect.stringContaining(choiceType),
                                }),
                            ],
                        },
                    }),
                )
            },
        )

        it('should handle STORE_WEBSITE_QUESTION_SNIPPET type', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            )
            const { result, mocks } = renderHookWithData(mockData)
            const mockChoice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            )

            await result.current.onSubmitMissingKnowledge([mockChoice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                feedbackValue: expect.stringContaining(
                                    'STORE_WEBSITE_QUESTION_SNIPPET',
                                ),
                            }),
                        ],
                    },
                }),
            )
        })

        it('should handle errors gracefully', async () => {
            console.error = jest.fn()
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
            const errorMocks = {
                upsertFeedback: jest
                    .fn()
                    .mockRejectedValue(new Error('Test error')),
                setLoadingMutations: jest.fn(),
            }
            const { result } = renderHookWithData(mockData, errorMocks)
            const mockChoice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )

            await result.current.onSubmitMissingKnowledge([mockChoice])

            expect(console.error).toHaveBeenCalled()
            expect(errorMocks.setLoadingMutations).toHaveBeenCalledTimes(2)
        })

        it('should handle unknown choice type (default case)', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
            const { result, mocks } = renderHookWithData(mockData)
            const unknownChoice = createMockChoice('UNKNOWN_TYPE' as any, {
                value: 'unknown-1',
            })

            await result.current.onSubmitMissingKnowledge([unknownChoice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle missing executionId', async () => {
            const mockData = createMockData('ARTICLE' as any, {
                feedback: createMockFeedback({ executions: [] }),
                enrichedData: createMockEnrichedData({
                    suggestedResources: [
                        {
                            parsedResource: {
                                resourceType: 'ARTICLE',
                                resourceId: 'article-1',
                                resourceSetId: '456',
                            },
                            feedback: {}, // No executionId in feedback
                            executionId: undefined,
                            metadata: {},
                        },
                    ],
                }),
            })
            const { result, mocks } = renderHookWithData(mockData)
            const mockChoice = createMockChoice('ARTICLE' as any)

            await result.current.onSubmitMissingKnowledge([mockChoice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle deleted choices without existing feedback id', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
            const { result, mocks } = renderHookWithData(mockData)
            const deletedChoice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                {
                    isDeleted: true,
                },
            )

            await result.current.onSubmitMissingKnowledge([deletedChoice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
            expect(mockDispatch).toHaveBeenCalled()
        })

        it('should handle deleted choices with existing feedback id', async () => {
            const choice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                { isDeleted: true },
            )
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                {
                    enrichedData: createMockEnrichedData({
                        suggestedResources: [
                            {
                                ...createSuggestedResource(choice),
                                feedback: {
                                    id: 'existing-feedback-id',
                                    executionId: MOCK_EXEC_ID,
                                },
                            },
                        ],
                    }),
                },
            )
            const { result, mocks } = renderHookWithData(mockData)

            await result.current.onSubmitMissingKnowledge([choice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                id: 'existing-feedback-id',
                                feedbackValue: null,
                            }),
                        ],
                    },
                }),
            )
        })

        it('should filter out feedback with null value and no existing id', async () => {
            const validChoice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            )
            const deletedChoiceNoId = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                { isDeleted: true },
            )

            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                {
                    enrichedData: createMockEnrichedData({
                        suggestedResources: [
                            createSuggestedResource(validChoice),
                            createSuggestedResource(deletedChoiceNoId),
                        ],
                    }),
                },
            )
            const { result, mocks } = renderHookWithData(mockData)

            await result.current.onSubmitMissingKnowledge([
                validChoice,
                deletedChoiceNoId,
            ])

            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                feedbackValue:
                                    expect.stringContaining('ARTICLE'),
                            }),
                        ],
                    },
                }),
            )
            expect(mockDispatch).toHaveBeenCalled()
        })

        // Test resource not found scenarios
        it.each([
            [AiAgentKnowledgeResourceTypeEnum.ACTION, 'actions'],
            [AiAgentKnowledgeResourceTypeEnum.GUIDANCE, 'guidanceArticles'],
            [AiAgentKnowledgeResourceTypeEnum.ARTICLE, 'articles'],
            [AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET, 'sourceItems'],
            [
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                'ingestedFiles',
            ],
        ] as const)(
            'should handle missing %s resource',
            async (resourceType, arrayName) => {
                const mockData = createMockData(resourceType, {
                    [arrayName]: [],
                })
                const { result, mocks } = renderHookWithData(mockData)
                const choice = createMockChoice(resourceType, {
                    value: 'non-existent-id',
                })

                await result.current.onSubmitMissingKnowledge([choice])

                expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
                expect(mocks.upsertFeedback).not.toHaveBeenCalled()
            },
        )

        it('should handle multiple choices with mixed valid and invalid resources', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                {
                    articles: [
                        {
                            id: 'article-1',
                            translation: {
                                locale: 'en-US',
                                title: 'Valid Article',
                            },
                        },
                    ],
                    actions: [], // Empty to make action invalid
                },
            )

            const { result, mocks } = renderHookWithData(mockData)

            const choices = [
                createMockChoice(AiAgentKnowledgeResourceTypeEnum.ARTICLE, {
                    value: 'article-1',
                }),
                createMockChoice(AiAgentKnowledgeResourceTypeEnum.ACTION, {
                    value: 'action-nonexistent',
                }),
            ]

            // Add corresponding suggested resources
            mockData.enrichedData.suggestedResources = choices.map(
                createSuggestedResource,
            )

            await result.current.onSubmitMissingKnowledge(choices)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                feedbackValue:
                                    expect.stringContaining('ARTICLE'),
                            }),
                        ],
                    },
                }),
            )
        })

        it('should handle edge cases', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.ACTION,
                {
                    actions: [
                        { id: undefined, name: 'Action with undefined ID' },
                    ],
                    sourceItems: undefined,
                    ingestedFiles: undefined,
                    storeConfiguration: undefined,
                },
            )

            const { result, mocks } = renderHookWithData(mockData)
            const choice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.ACTION,
                {
                    value: 'action-undefined',
                },
            )

            await result.current.onSubmitMissingKnowledge([choice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle missing STORE_WEBSITE_QUESTION_SNIPPET resource', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                {
                    storeWebsiteQuestions: [],
                },
            )
            const { result, mocks } = renderHookWithData(mockData)
            const choice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                { value: 'non-existent-website-question' },
            )

            await result.current.onSubmitMissingKnowledge([choice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle FILE_EXTERNAL_SNIPPET with null snippetHelpCenterId', async () => {
            const mockData = createMockData(
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                {
                    storeConfiguration: createMockStoreConfig({
                        snippetHelpCenterId: undefined, // This should trigger the ?? null fallback
                    }),
                },
            )
            const { result, mocks } = renderHookWithData(mockData)
            const mockChoice = createMockChoice(
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            )

            await result.current.onSubmitMissingKnowledge([mockChoice])

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                feedbackValue: expect.stringContaining(
                                    '"resourceSetId":null',
                                ),
                            }),
                        ],
                    },
                }),
            )
        })
    })

    describe('onSubmitNewMissingKnowledge', () => {
        const getBasicMockData = (
            feedbackOverride?: Partial<MockFeedback>,
        ) => ({
            feedback: createMockFeedback(feedbackOverride),
            storeConfiguration: createMockStoreConfig(),
            actions: [],
            guidanceArticles: [],
            articles: [],
            sourceItems: [],
            ingestedFiles: [],
            storeWebsiteQuestions: [],
            enrichedData: createMockEnrichedData(),
        })

        it('should correctly process a new missing knowledge resource', async () => {
            const mockData = getBasicMockData()
            const { result, mocks } = renderHookWithData(mockData)

            const mockResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceId: 'new-article-1',
                resourceSetId: '456',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(mockResource)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                objectId: MOCK_TICKET_ID.toString(),
                                objectType: 'TICKET',
                                executionId: MOCK_EXEC_ID,
                                targetType: 'TICKET',
                                targetId: MOCK_TICKET_ID.toString(),
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: JSON.stringify(mockResource),
                            }),
                        ],
                    },
                }),
            )
        })

        it('should handle different resource types', async () => {
            const mockData = getBasicMockData()
            const { result, mocks } = renderHookWithData(mockData)

            const guidanceResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                resourceId: 'new-guidance-1',
                resourceSetId: '789',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(guidanceResource)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                feedbackValue: JSON.stringify(guidanceResource),
                            }),
                        ],
                    },
                }),
            )
        })

        it('should handle missing executionId', async () => {
            const mockData = getBasicMockData({ executions: [] })
            const { result, mocks } = renderHookWithData(mockData)

            const mockResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceId: 'new-article-1',
                resourceSetId: '456',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(mockResource)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle errors gracefully', async () => {
            console.error = jest.fn()
            const mockData = getBasicMockData()
            const errorMocks = {
                upsertFeedback: jest
                    .fn()
                    .mockRejectedValue(new Error('Test error')),
                setLoadingMutations: jest.fn(),
            }
            const { result } = renderHookWithData(mockData, errorMocks)

            const mockResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceId: 'new-article-1',
                resourceSetId: '456',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(mockResource)

            expect(console.error).toHaveBeenCalled()
            expect(errorMocks.setLoadingMutations).toHaveBeenCalledTimes(2)
        })

        it('should handle undefined feedback', async () => {
            const mockData = { ...getBasicMockData(), feedback: undefined }
            const { result, mocks } = renderHookWithData(mockData as any)

            const mockResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceId: 'new-article-1',
                resourceSetId: '456',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(mockResource)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle setLoadingMutations with undefined oldValue (line 192)', async () => {
            const mockData = getBasicMockData()
            const setLoadingMutationsMock = jest.fn((callback) => {
                const result = callback(undefined)
                return result
            })
            const mocks = {
                upsertFeedback: jest.fn().mockResolvedValue({}),
                setLoadingMutations: setLoadingMutationsMock,
            }
            const { result } = renderHookWithData(mockData, mocks)

            const mockResource = {
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceId: 'new-article-1',
                resourceSetId: '456',
                resourceLocale: 'en-US',
            }

            await result.current.onSubmitNewMissingKnowledge(mockResource)

            expect(setLoadingMutationsMock).toHaveBeenCalledTimes(2)
            expect(setLoadingMutationsMock).toHaveBeenCalledWith(
                expect.any(Function),
            )
        })
    })

    describe('coverage edge cases with undefined arrays', () => {
        it('should handle all undefined resource arrays', async () => {
            const mockData = {
                feedback: createMockFeedback(),
                storeConfiguration: createMockStoreConfig(),
                actions: undefined,
                guidanceArticles: undefined,
                articles: undefined,
                sourceItems: undefined,
                ingestedFiles: undefined,
                storeWebsiteQuestions: undefined,
                enrichedData: undefined,
            }

            const { result, mocks } = renderHookWithData(mockData as any)

            const choices = [
                createMockChoice(AiAgentKnowledgeResourceTypeEnum.ACTION),
                createMockChoice(AiAgentKnowledgeResourceTypeEnum.GUIDANCE),
                createMockChoice(AiAgentKnowledgeResourceTypeEnum.ARTICLE),
                createMockChoice(
                    AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                ),
                createMockChoice(
                    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                ),
                createMockChoice(
                    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                ),
            ]

            await result.current.onSubmitMissingKnowledge(choices)

            expect(mocks.setLoadingMutations).toHaveBeenCalledTimes(2)
            expect(mocks.upsertFeedback).not.toHaveBeenCalled()
        })

        it('should handle individual undefined resource arrays', async () => {
            const testCases = [
                {
                    type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    arrayName: 'actions',
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    arrayName: 'guidanceArticles',
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    arrayName: 'sourceItems',
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                    arrayName: 'ingestedFiles',
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                    arrayName: 'storeWebsiteQuestions',
                },
            ]

            for (const testCase of testCases) {
                const mockData = createMockData(testCase.type, {
                    [testCase.arrayName]: undefined,
                })

                const { result, mocks } = renderHookWithData(mockData as any)
                const choice = createMockChoice(testCase.type)

                await result.current.onSubmitMissingKnowledge([choice])

                expect(mocks.upsertFeedback).not.toHaveBeenCalled()

                mocks.upsertFeedback.mockClear()
                mocks.setLoadingMutations.mockClear()
            }
        })
    })
})
