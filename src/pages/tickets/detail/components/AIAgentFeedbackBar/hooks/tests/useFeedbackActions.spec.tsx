import React from 'react'

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
    })
})
