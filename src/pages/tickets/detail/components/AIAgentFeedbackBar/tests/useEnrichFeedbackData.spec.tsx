import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    useGetMultipleFileIngestionSnippets,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { useGetAICompatibleMacros } from 'models/macro/queries'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useMultipleStoreWebsiteQuestions } from 'pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { Components } from 'rest_api/knowledge_service_api/client.generated'
import { renderHook } from 'utils/testing/renderHook'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import {
    useEnrichFeedbackData,
    useGetResourceData,
    useGetResourcesReasoningMetadata,
} from '../useEnrichFeedbackData'

// Mock all the hooks that our target hooks depend on
jest.mock('models/helpCenter/queries', () => ({
    useGetMultipleHelpCenterArticleLists: jest.fn(),
    useGetMultipleFileIngestionSnippets: jest.fn(),
    useGetMultipleHelpCenter: jest.fn(),
}))

jest.mock('models/macro/queries', () => ({
    useGetAICompatibleMacros: jest.fn(),
}))

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticles', () => ({
    useMultipleGuidanceArticles: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/usePublicResources', () => ({
    useMultiplePublicResources: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions', () => ({
    useMultipleStoreWebsiteQuestions: jest.fn(),
}))

// Mock the getAiAgentNavigationRoutes function to prevent feature flag issues
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(() => ({
        guidanceArticleEdit: jest.fn((id) => `/mock/guidance/edit/${id}`),
        articleEdit: jest.fn((id) => `/mock/article/edit/${id}`),
        urlArticlesDetail: jest.fn(
            (ingestionId, articleId) =>
                `/mock/articles/detail/${ingestionId}/${articleId}`,
        ),
        externalSnippetView: jest.fn((id) => `/mock/snippet/view/${id}`),
        fileSnippetView: jest.fn((id) => `/mock/file/view/${id}`),
        macroEdit: jest.fn((id) => `/mock/macro/edit/${id}`),
        actionEdit: jest.fn((id) => `/mock/action/edit/${id}`),
        editAction: jest.fn((id) => `/mock/action/edit/${id}`),
        fileArticlesDetail: jest.fn(
            (ingestionId, id) => `/mock/file/${ingestionId}/${id}`,
        ),
        pagesContentDetail: jest.fn(
            (ingestionId, id) => `/mock/content/${ingestionId}/${id}`,
        ),
        orderView: jest.fn((id) => `/mock/order/view/${id}`),
        storeWebsiteQuestionView: jest.fn(
            (id) => `/mock/store-website/view/${id}`,
        ),
    })),
}))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

// Create a mock StoreConfiguration with all required fields
const createMockStoreConfiguration = (
    overrides?: Partial<StoreConfiguration>,
): StoreConfiguration => ({
    trialModeActivatedDatetime: null,
    previewModeActivatedDatetime: null,
    storeName: 'test-store',
    shopType: 'shopify',
    helpCenterId: 100,
    snippetHelpCenterId: 300,
    guidanceHelpCenterId: 200,
    toneOfVoice: ToneOfVoice.Friendly,
    aiAgentLanguage: null,
    customToneOfVoiceGuidance: null,
    signature: '',
    excludedTopics: [],
    tags: [],
    conversationBot: { id: 1, email: 'bot@example.com', name: 'Test Bot' },
    useEmailIntegrationSignature: true,
    monitoredEmailIntegrations: [],
    monitoredChatIntegrations: [],
    silentHandover: false,
    ticketSampleRate: 0,
    dryRun: false,
    isDraft: false,
    wizardId: null,
    floatingChatInputConfigurationId: null,
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    previewModeValidUntilDatetime: null,
    scopes: [AiAgentScope.Support],
    createdDatetime: new Date().toISOString(),
    salesDiscountMax: null,
    salesDiscountStrategyLevel: null,
    salesPersuasionLevel: null,
    salesDeactivatedDatetime: null,
    isConversationStartersEnabled: false,
    isSalesHelpOnSearchEnabled: null,
    customFieldIds: [],
    ...overrides,
})

describe('useGetResourceData', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ldClientMock.allFlags.mockReturnValue({
            'ai-shopping-assistant-enabled': false,
        })

        // Setup default mock returns
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [],
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: [] } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
    })

    it('should fetch resources correctly', () => {
        const params = {
            queriesEnabled: true,
            faqHelpCenterIds: [100],
            guidanceHelpCenterIds: [200],
            snippetHelpCenterIds: [300],
            ticketId: 123,
            shopName: 'test-store',
            shopType: 'shopify',
        }

        const mockHelpCenters = [{ id: 1, subdomain: 'test' }]
        const mockArticles = [
            {
                id: 1,
                translation: { title: 'Article 1', content: 'Content 1' },
            },
        ]
        const mockGuidanceArticles = [
            { id: 2, title: 'Guidance 1', content: 'Guidance Content' },
        ]
        const mockSourceItems = [
            { id: 3, title: 'External Snippet', ingestionId: 300 },
        ]
        const mockIngestedFiles = [
            {
                id: 4,
                title: 'test.pdf',
                status: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
            },
        ]
        const mockMacros = [{ id: 5, name: 'Macro 1', intent: 'Macro Intent' }]
        const mockActions = [{ id: '6', name: 'Action 1' }]
        const mockStoreWebsiteQuestions = [
            { id: 8, title: 'Store Website Question 1', helpCenterId: 300 },
            { id: 9, title: 'Store Website Question 2', helpCenterId: 300 },
        ]

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: mockArticles,
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: mockHelpCenters,
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: mockGuidanceArticles,
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: mockSourceItems,
            isSourceItemsListLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: mockMacros } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: mockActions,
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
            isLoading: false,
        })

        const { result } = renderHook(() => useGetResourceData(params), {
            wrapper,
        })

        expect(result.current).toEqual({
            isLoading: false,
            articles: mockArticles,
            guidanceArticles: mockGuidanceArticles,
            sourceItems: mockSourceItems,
            ingestedFiles: mockIngestedFiles,
            macros: mockMacros,
            actions: mockActions,
            helpCenters: mockHelpCenters,
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
        })

        // Verify the hooks were called with correct parameters
        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            [100],
            { version_status: 'latest_draft', per_page: 1000 },
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultipleGuidanceArticles).toHaveBeenCalledWith(
            [200],
            expect.objectContaining({ enabled: true }),
        )

        expect(useGetMultipleHelpCenter).toHaveBeenCalledWith(
            [100, 200],
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultiplePublicResources).toHaveBeenCalledWith({
            helpCenterIds: [300],
            queryOptionsOverrides: expect.objectContaining({ enabled: true }),
        })

        expect(useGetStoreWorkflowsConfigurations).toHaveBeenCalledWith(
            {
                storeName: 'test-store',
                storeType: 'shopify',
                triggers: ['llm-prompt'],
            },
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultipleStoreWebsiteQuestions).toHaveBeenCalledWith({
            snippetHelpCenterIds: [300],
            shopName: 'test-store',
            queryOptionsOverrides: expect.objectContaining({ enabled: true }),
        })
    })

    it('should handle loading states correctly', () => {
        const params = {
            queriesEnabled: true,
            faqHelpCenterIds: [100],
            guidanceHelpCenterIds: [200],
            snippetHelpCenterIds: [300],
            ticketId: 123,
            shopName: 'test-store',
            shopType: 'shopify',
        }

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [],
            isLoading: true,
        })

        const { result } = renderHook(() => useGetResourceData(params), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
    })
})

describe('useEnrichFeedbackData', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ldClientMock.allFlags.mockReturnValue({})
        // Setup default mock returns
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [],
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: [] } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
    })

    it('should return enriched data from feedback executions', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Current timestamp to use for date fields
        const timestamp = new Date().toISOString()

        // Use type casting to bypass strict type checking for testing purposes
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Free form feedback',
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        // Testing all resource types in suggested resources
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '200',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 4,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '3',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 5,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '4',
                                resourceType: 'FILE_EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 6,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '5',
                                resourceType: 'MACRO',
                                resourceSetId: '',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 7,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '6',
                                resourceType: 'ACTION',
                                resourceSetId: '',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                        {
                            id: 8,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '8',
                                resourceType: 'ARTICLE',
                                resourceSetId: '',
                                resourceTitle: 'Article Title',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                    ],
                    resources: [
                        // Adding resources of all types
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-4',
                            resourceId: '4',
                            resourceType: 'FILE_EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'File Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-5',
                            resourceId: '5',
                            resourceType: 'MACRO',
                            resourceSetId: '',
                            resourceTitle: 'Macro',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-6',
                            resourceId: '6',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Action',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-7',
                            resourceId: '7',
                            resourceType: 'ORDER',
                            resourceSetId: '',
                            resourceTitle: 'Order',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-8',
                            resourceId: '8',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-9',
                            resourceId: 'nonexistent',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-10',
                            resourceId: '10',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        const mockArticles = [
            {
                id: 1,
                translation: { title: 'Article 1', content: 'Content 1' },
            },
        ]
        const mockGuidanceArticles = [
            { id: 2, title: 'Guidance Title', content: 'Guidance Content' },
        ]
        const mockSourceItems = [
            { id: 3, title: 'External Snippet', ingestionId: 300 },
        ]
        const mockIngestedFiles = [
            {
                id: 4,
                title: 'test.pdf',
                status: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
            },
        ]
        const mockMacros = [{ id: 5, name: 'Macro 1', intent: 'Macro Intent' }]
        const mockActions = [{ id: '6', name: 'Action 1' }]
        const mockHelpCenters = [{ id: 1, subdomain: 'test' }]
        const mockStoreWebsiteQuestions = [
            {
                id: 8,
                article_id: 8,
                title: 'Store Website Question 1',
                helpCenterId: 300,
            },
            {
                id: 9,
                article_id: 9,
                title: 'Store Website Question 2',
                helpCenterId: 300,
            },
        ]

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: mockArticles,
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: mockHelpCenters,
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: mockGuidanceArticles,
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: mockSourceItems,
            isSourceItemsListLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: mockMacros } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: mockActions,
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)

        // Check that knowledgeResources has all resource types
        const knowledgeResourceTypes =
            result.current.enrichedData.knowledgeResources.map(
                (kr) => kr.resource.resourceType,
            )

        expect(knowledgeResourceTypes).toEqual([
            'GUIDANCE',
            'ACTION',
            'ARTICLE',
            'MACRO',
            'STORE_WEBSITE_QUESTION_SNIPPET',
            'ORDER',
            'EXTERNAL_SNIPPET',
            'EXTERNAL_SNIPPET',
            'EXTERNAL_SNIPPET',
            'FILE_EXTERNAL_SNIPPET',
        ])

        // Check that suggestedResources has all resource types
        const suggestedResourceTypes =
            result.current.enrichedData.suggestedResources.map(
                (sr) => sr.parsedResource.resourceType,
            )

        expect(suggestedResourceTypes).toEqual([
            'GUIDANCE',
            'ACTION',
            'ARTICLE',
            'ARTICLE',
            'MACRO',
            'EXTERNAL_SNIPPET',
            'FILE_EXTERNAL_SNIPPET',
        ])
        // Check for the freeForm feedback
        expect(result.current.enrichedData.freeForm).not.toBeNull()
        expect(
            result.current.enrichedData.freeForm?.feedback.feedbackType,
        ).toBe('TICKET_FREEFORM')
    })

    it('should handle errors in feedback data parsing', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Current timestamp to use for date fields
        const timestamp = new Date().toISOString()

        // Use type casting to bypass strict type checking for testing purposes
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-123',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: '{invalid-json}', // Invalid JSON to trigger error handling
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                    ],
                    resources: [],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        // Mock console.error to prevent test output pollution
        const originalConsoleError = console.error
        console.error = jest.fn()

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })

        expect(console.error).toHaveBeenCalled()

        // Restore console.error
        console.error = originalConsoleError
    })

    it('should handle missing metadata for resources', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Use type casting to bypass strict type checking for testing purposes
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '999', // ID that doesn't exist in our mock data
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Non-existent Article',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            result.current.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
    })

    it('should handle macro pagination when hasNextPage is true', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const mockFetchNextPage = jest.fn()
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: {
                pages: [{ data: { data: [] } }],
                pageParams: [{ ticket_id: 123 }],
            },
            isLoading: false,
            hasNextPage: true,
            fetchNextPage: mockFetchNextPage,
        })

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as Components.Schemas.FeedbackDto

        renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Verify that fetchNextPage was called due to hasNextPage being true
        expect(mockFetchNextPage).toHaveBeenCalledWith({
            pageParam: { ticket_id: 123 },
        })
    })

    it('should handle missing shopName when generating aiAgentRoutes', () => {
        const storeConfiguration = createMockStoreConfiguration({
            storeName: '', // Empty shopName
        })

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: '',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        const mockGuidanceArticles = [
            { id: 1, title: 'Guidance Title', content: 'Guidance Content' },
        ]

        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: mockGuidanceArticles,
            isGuidanceArticleListLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should still work but guidance URL might be undefined due to missing shopName
        expect(result.current.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current.enrichedData.knowledgeResources[0].metadata.title,
        ).toBe('Guidance Title')
    })

    it('should handle disabled queries when store configuration is incomplete', () => {
        const storeConfiguration = createMockStoreConfiguration({
            storeName: '', // Missing store name
            shopType: '', // Missing shop type
        })

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as Components.Schemas.FeedbackDto

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty data since queries are disabled
        expect(result.current.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })

    it('should handle undefined data parameter', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: undefined, // No data provided
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty data since no data is provided
        expect(result.current.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })

    it('should handle getResourceType for different snippet types', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Setup test data for store website questions and file snippets
        const mockStoreWebsiteQuestions = [
            {
                id: 1,
                article_id: 123,
                title: 'Store Website Question',
                helpCenterId: 300,
            },
        ]

        const mockIngestedFiles = [
            {
                id: 456,
                title: 'test.pdf',
                ingestionStatus: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
                ingestionId: 300,
            },
        ]

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '123', // This should match store website question
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Store Website Question',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '456', // This should match file snippet
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'File Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '789', // This should remain as external snippet
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Regular Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        const resourceTypes =
            result.current.enrichedData.knowledgeResources.map(
                (kr) => kr.resource.resourceType,
            )

        // Should include STORE_WEBSITE_QUESTION_SNIPPET and FILE_EXTERNAL_SNIPPET types
        expect(resourceTypes).toContain('STORE_WEBSITE_QUESTION_SNIPPET')
        expect(resourceTypes).toContain('FILE_EXTERNAL_SNIPPET')
        expect(resourceTypes).toContain('EXTERNAL_SNIPPET')
    })

    it('should handle default case in getResourceMetadata', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'UNKNOWN_TYPE', // This will trigger the default case
                            resourceSetId: '100',
                            resourceTitle: 'Unknown Resource',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as any // Use any to bypass type checking for unknown resource type

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            result.current.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
    })

    it('should handle FILE_EXTERNAL_SNIPPET with unsuccessful ingestion status', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const mockIngestedFiles = [
            {
                id: 4,
                title: 'failed-file.pdf',
                ingestionStatus: 'FAILED', // Not successful
                filename: 'failed-file.pdf',
                google_storage_url:
                    'https://storage.example.com/failed-file.pdf',
                ingestionId: 300,
            },
        ]

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-123',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '4',
                            resourceType: 'FILE_EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Failed File',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                    },
                },
            ],
        } as Components.Schemas.FeedbackDto

        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty metadata since file ingestion was not successful
        expect(
            result.current.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
    })
})

describe('useGetResourcesReasoningMetadata', () => {
    const resources: KnowledgeReasoningResource[] = [
        {
            resourceId: '1',
            resourceSetId: '100',
            resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        },
        {
            resourceId: '2',
            resourceSetId: '200',
            resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
        },
        {
            resourceId: '3',
            resourceSetId: '300',
            resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            resourceTitle: 'https://example.com',
        },
        {
            resourceId: '4',
            resourceSetId: '300',
            resourceType:
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            resourceTitle: 'test.pdf',
        },
        {
            resourceId: '5',
            resourceType: AiAgentKnowledgeResourceTypeEnum.MACRO,
        },
        {
            resourceId: '6',
            resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
        },
        {
            resourceId: '7',
            resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
            resourceTitle: '#123',
        },
    ]

    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ldClientMock.allFlags.mockReturnValue({
            'ai-shopping-assistant-enabled': false,
        })

        // Setup default mock returns for useGetResourcesReasoningMetadata tests
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [],
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: [] } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
    })

    it('should correctly process resources and call useGetResourceData with correct parameters', () => {
        const storeConfiguration = createMockStoreConfiguration()

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    ticketId: 123,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            [100],
            { version_status: 'latest_draft', per_page: 1000 },
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultipleGuidanceArticles).toHaveBeenCalledWith(
            [200],
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultiplePublicResources).toHaveBeenCalledWith({
            helpCenterIds: [300, 300], // two resources tied to the same help center are requested
            queryOptionsOverrides: expect.objectContaining({ enabled: true }),
        })
    })

    it('should return enriched resource metadata for all resource types', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const mockArticles = [
            {
                id: 1,
                translation: {
                    title: 'Article Title',
                    content: 'Article Content',
                },
                helpCenterId: 100,
            },
        ]
        const mockGuidanceArticles = [
            { id: 2, title: 'Guidance Title', content: 'Guidance Content' },
        ]
        const mockSourceItems = [
            {
                id: 3,
                title: 'https://example.com',
                url: 'https://example.com',
                ingestionId: 300,
            },
        ]
        const mockIngestedFiles = [
            {
                id: 4,
                title: 'test.pdf',
                ingestionStatus: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
                ingestionId: 300,
            },
        ]
        const mockMacros = [
            { id: 5, name: 'Macro Name', intent: 'Macro Intent' },
        ]
        const mockActions = [{ id: '6', name: 'Action Name' }]
        const mockHelpCenters = [{ id: 100, subdomain: 'test' }]

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: mockArticles,
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: mockHelpCenters,
            isLoading: false,
        })
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: mockGuidanceArticles,
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: mockSourceItems,
            isSourceItemsListLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })
        ;(useGetAICompatibleMacros as jest.Mock).mockReturnValue({
            data: { pages: [{ data: { data: mockMacros } }] },
            isLoading: false,
            hasNextPage: false,
            fetchNextPage: jest.fn(),
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: mockActions,
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toHaveLength(7)

        expect(result.current.data[0]).toEqual({
            title: 'Article Title',
            content: 'Article Content',
            url: expect.any(String),
            helpCenterId: 100,
        })

        expect(result.current.data[1]).toEqual({
            title: 'Guidance Title',
            content: 'Guidance Content',
            url: expect.any(String),
        })

        expect(result.current.data[2]).toEqual({
            title: 'https://example.com',
            content: 'https://example.com',
            url: '/mock/articles/detail/300/3',
        })

        expect(result.current.data[3]).toEqual({
            title: 'test.pdf',
            content: 'test.pdf',
            url: expect.any(String),
        })

        expect(result.current.data[4]).toEqual({
            title: 'Macro Name',
            content: 'Macro Intent',
            url: '/app/settings/macros/5',
        })

        expect(result.current.data[5]).toEqual({
            title: 'Action Name',
            content: 'Action Name',
            url: expect.any(String),
        })

        expect(result.current.data[6]).toEqual({
            title: 'Order #123',
            content: 'Order #123',
            url: 'https://admin.shopify.com/store/test-store/orders/7',
        })
    })

    it('should handle loading state correctly', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // at least one resource has to be loading
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    ticketId: 123,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should handle disabled queries', () => {
        const storeConfiguration = createMockStoreConfiguration()

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    ticketId: 123,
                    storeConfiguration,
                    queriesEnabled: false,
                }),
            { wrapper },
        )

        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            [100],
            { version_status: 'latest_draft', per_page: 1000 },
            expect.objectContaining({ enabled: false }),
        )
    })
})
