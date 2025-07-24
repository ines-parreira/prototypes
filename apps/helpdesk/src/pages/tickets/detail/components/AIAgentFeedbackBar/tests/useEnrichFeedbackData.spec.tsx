import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mockFlags } from 'jest-launchdarkly-mock'

import { FindFeedbackResult } from '@gorgias/knowledge-service-types'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import {
    useGetMultipleFileIngestionSnippets,
    useGetMultipleHelpCenter,
    useGetMultipleHelpCenterArticleLists,
} from 'models/helpCenter/queries'
import { useGetProductsByIdsFromIntegration } from 'models/integration/queries'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { useMultipleStoreWebsiteQuestions } from 'pages/aiAgent/hooks/useMultipleStoreWebsiteQuestions'
import { useMultiplePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { renderHook } from 'utils/testing/renderHook'

import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import {
    getResourceMetadata,
    useEnrichFeedbackData,
    useGetKnowledgeResourceData,
    useGetKnowledgeResourceMetadata,
    useGetResourceData,
    useGetResourcesReasoningMetadata,
} from '../useEnrichFeedbackData'

// Mock all the hooks that our target hooks depend on
jest.mock('models/helpCenter/queries', () => ({
    useGetMultipleHelpCenterArticleLists: jest.fn(),
    useGetMultipleFileIngestionSnippets: jest.fn(),
    useGetMultipleHelpCenter: jest.fn(),
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

jest.mock('models/integration/queries', () => ({
    useGetProductsByIdsFromIntegration: jest.fn(),
}))

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

// Mock the getAiAgentNavigationRoutes function to prevent feature flag issues
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(() => ({
        guidanceArticleEdit: (id: number) => `/mock/guidance/edit/${id}`,
        articleEdit: (id: number) => `/mock/article/edit/${id}`,
        urlArticlesDetail: (ingestionId: number, articleId: number) =>
            `/mock/articles/detail/${ingestionId}/${articleId}`,
        externalSnippetView: (id: number) => `/mock/snippet/view/${id}`,
        fileSnippetView: (id: number) => `/mock/file/view/${id}`,
        actionEdit: (id: string) => `/mock/action/edit/${id}`,
        editAction: (id: string) => `/mock/action/edit/${id}`,
        fileArticlesDetail: (ingestionId: number, id: number) =>
            `/mock/file/${ingestionId}/${id}`,
        questionsContentDetail: (id: number) => `/mock/content/${id}`,
        orderView: (id: number) => `/mock/order/view/${id}`,
        storeWebsiteQuestionView: (id: number) =>
            `/mock/store-website/view/${id}`,
        productsContentDetail: (id: number) =>
            `/app/ai-agent/shopify/test-store/knowledge/sources/products-content/${id}`,
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
    monitoredSmsIntegrations: [],
    silentHandover: false,
    ticketSampleRate: 0,
    dryRun: false,
    isDraft: false,
    wizardId: null,
    floatingChatInputConfigurationId: null,
    chatChannelDeactivatedDatetime: null,
    emailChannelDeactivatedDatetime: null,
    smsChannelDeactivatedDatetime: null,
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
    handoverMethod: null,
    handoverEmail: null,
    handoverEmailIntegrationId: null,
    handoverHttpIntegrationId: null,
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
        mockFlags({
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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 1,
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
            shopIntegrationId: 1,
            productIds: [400],
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
        const mockActions = [{ id: '6', name: 'Action 1' }]
        const mockStoreWebsiteQuestions = [
            { id: 8, title: 'Store Website Question 1', helpCenterId: 300 },
            { id: 9, title: 'Store Website Question 2', helpCenterId: 300 },
        ]
        const mockProducts = [{ id: 400 }]

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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: mockActions,
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: mockProducts,
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
            actions: mockActions,
            helpCenters: mockHelpCenters,
            storeWebsiteQuestions: mockStoreWebsiteQuestions,
            products: mockProducts,
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

        expect(useGetProductsByIdsFromIntegration).toHaveBeenCalledWith(
            1,
            [400],
            true,
        )

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
            shopIntegrationId: 1,
            productIds: [400],
        }

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [],
            isLoading: true,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true,
        })

        const { result } = renderHook(() => useGetResourceData(params), {
            wrapper,
        })

        expect(result.current).toBe(null)
    })

    it('should return empty products when using fallback shopIntegrationId', () => {
        const params = {
            queriesEnabled: true,
            faqHelpCenterIds: [],
            guidanceHelpCenterIds: [],
            snippetHelpCenterIds: [],
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: -1, // Fallback value when integrationId is null
            productIds: [100, 200],
        }

        // Mock empty response for invalid integration ID
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const { result } = renderHook(() => useGetResourceData(params), {
            wrapper,
        })

        expect(result.current?.products).toEqual([])
        expect(result.current?.isLoading).toBe(false)
        expect(result.current).not.toBe(null)
    })

    it('should return products successfully when using valid shopIntegrationId', () => {
        const params = {
            queriesEnabled: true,
            faqHelpCenterIds: [],
            guidanceHelpCenterIds: [],
            snippetHelpCenterIds: [],
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 98765,
            productIds: [300],
        }

        // Mock successful product response for valid integration ID
        const mockProducts = [{ id: 300, title: 'Super Product' }]
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: mockProducts,
            isLoading: false,
        })

        const { result } = renderHook(() => useGetResourceData(params), {
            wrapper,
        })

        // When using valid integration ID, should return actual products
        expect(result.current?.products).toEqual(mockProducts)
        expect(result.current?.isLoading).toBe(false)
        expect(result.current).not.toBe(null)
    })
})

describe('useEnrichFeedbackData', () => {
    const mockStoreConfiguration = {
        shopName: 'test-store',
        shopType: 'shopify',
        faqHelpCenterId: 100,
        guidanceHelpCenterId: 200,
        snippetHelpCenterId: 300,
    }
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockFlags({
            'linear.project_surface-products-used-by-ai-agent-on-ai-feedback-tab': false,
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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 1,
        })
    })

    describe('when returning enriched data from feedback execution', () => {
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        beforeEach(() => {
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
            const mockProducts = [
                {
                    id: 10,
                },
                {
                    id: 11,
                },
            ]

            ;(
                useGetMultipleHelpCenterArticleLists as jest.Mock
            ).mockReturnValue({
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
            ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue(
                {
                    ingestedFiles: mockIngestedFiles,
                    isLoading: false,
                },
            )
            ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
                data: mockActions,
                isLoading: false,
            })
            ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
                storeWebsiteQuestions: mockStoreWebsiteQuestions,
                isLoading: false,
            })
            ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
                data: mockProducts,
                isLoading: false,
            })
        })

        describe('with product resurfacing disabled', () => {
            it('should return enriched data from feedback executions without products', () => {
                const { result } = renderHook(
                    () =>
                        useEnrichFeedbackData({
                            data: feedbackData,
                            storeConfiguration,
                        }),
                    { wrapper },
                )

                expect(result.current?.isLoading).toBe(false)

                // Check that knowledgeResources has all resource types
                const knowledgeResourceTypes =
                    result.current?.enrichedData.knowledgeResources.map(
                        (kr) => kr.resource.resourceType,
                    )

                expect(knowledgeResourceTypes).toEqual([
                    'GUIDANCE',
                    'ACTION',
                    'ARTICLE',
                    'STORE_WEBSITE_QUESTION_SNIPPET',
                    'ORDER',
                    'EXTERNAL_SNIPPET',
                    'EXTERNAL_SNIPPET',
                    'EXTERNAL_SNIPPET',
                    'FILE_EXTERNAL_SNIPPET',
                ])

                // Check that suggestedResources has all resource types
                const suggestedResourceTypes =
                    result.current?.enrichedData.suggestedResources.map(
                        (sr) => sr.parsedResource.resourceType,
                    )

                expect(suggestedResourceTypes).toEqual([
                    'GUIDANCE',
                    'ACTION',
                    'ARTICLE',
                    'ARTICLE',
                    'EXTERNAL_SNIPPET',
                    'FILE_EXTERNAL_SNIPPET',
                ])
                // Check for the freeForm feedback
                expect(result.current?.enrichedData.freeForm).not.toBeNull()
                expect(
                    result.current?.enrichedData.freeForm?.feedback
                        .feedbackType,
                ).toBe('TICKET_FREEFORM')
            })
        })

        describe('with product resurfacing enabled', () => {
            beforeEach(() => {
                mockFlags({
                    'linear.project_surface-products-used-by-ai-agent-on-ai-feedback-tab': true,
                })
            })

            it('should return enriched data from feedback executions with mock products', () => {
                const { result } = renderHook(
                    () =>
                        useEnrichFeedbackData({
                            data: feedbackData,
                            storeConfiguration,
                        }),
                    { wrapper },
                )

                expect(result.current?.isLoading).toBe(false)

                // Check that knowledgeResources has all resource types
                const knowledgeResourceTypes =
                    result.current?.enrichedData.knowledgeResources.map(
                        (kr) => kr.resource.resourceType,
                    )

                expect(knowledgeResourceTypes).toEqual([
                    'GUIDANCE',
                    'ACTION',
                    'ARTICLE',
                    'STORE_WEBSITE_QUESTION_SNIPPET',
                    'ORDER',
                    'PRODUCT_KNOWLEDGE',
                    'PRODUCT_RECOMMENDATION',
                    'EXTERNAL_SNIPPET',
                    'EXTERNAL_SNIPPET',
                    'EXTERNAL_SNIPPET',
                    'FILE_EXTERNAL_SNIPPET',
                ])

                // Check that suggestedResources has all resource types
                const suggestedResourceTypes =
                    result.current?.enrichedData.suggestedResources.map(
                        (sr) => sr.parsedResource.resourceType,
                    )

                expect(suggestedResourceTypes).toEqual([
                    'GUIDANCE',
                    'ACTION',
                    'ARTICLE',
                    'ARTICLE',
                    'EXTERNAL_SNIPPET',
                    'FILE_EXTERNAL_SNIPPET',
                ])
                // Check for the freeForm feedback
                expect(result.current?.enrichedData.freeForm).not.toBeNull()
                expect(
                    result.current?.enrichedData.freeForm?.feedback
                        .feedbackType,
                ).toBe('TICKET_FREEFORM')
            })
        })
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        // Mock console.error to prevent test output pollution
        const originalConsoleError = console.error
        console.error = jest.fn()

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData).toEqual({
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
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
                        ...mockStoreConfiguration,
                        shopName: '',
                    },
                },
            ],
        } as FindFeedbackResult['data']

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
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should still work but guidance URL might be undefined due to missing shopName
        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata.title,
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
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty data since queries are disabled
        expect(result.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })

    it('should handle null integrationId gracefully and return empty enriched data', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Mock integrationId as null to test graceful handling
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: null,
        })

        // Mock empty products response since integrationId is null
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
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
                            resourceId: '400',
                            resourceType: 'PRODUCT_KNOWLEDGE',
                            resourceSetId: '',
                            resourceTitle: 'Product Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
        expect(result.current?.isLoading).toBe(false)
    })

    it('should successfully process non-product resources when integrationId is available', () => {
        const storeConfiguration = createMockStoreConfiguration()

        // Mock integrationId with a valid value
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 12345,
        })

        // Mock successful article fetch response
        const mockArticle = {
            id: 1,
            translation: { title: 'Test Article', content: 'Article content' },
            helpCenterId: 100,
        }
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [mockArticle],
            isLoading: false,
        })

        // Mock help center response
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [{ id: 100, subdomain: 'test' }],
            isLoading: false,
        })

        // Mock all other hooks to return empty data
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: [],
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
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
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Test Article',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // When integrationId is valid, hook should process resources normally
        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].resource
                .resourceType,
        ).toBe('ARTICLE')
        expect(
            result.current?.enrichedData.knowledgeResources[0].resource
                .resourceId,
        ).toBe('1')
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata.title,
        ).toBe('Test Article')
        expect(result.current?.isLoading).toBe(false)
    })

    it('should handle undefined data parameter', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: undefined, // No data provided
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty data since no data is provided
        expect(result.current?.enrichedData).toEqual({
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

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
                    storeConfiguration,
                }),
            { wrapper },
        )

        const resourceTypes =
            result.current?.enrichedData.knowledgeResources.map(
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as any // Use any to bypass type checking for unknown resource type

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata,
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
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: mockIngestedFiles,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        // Should return empty metadata since file ingestion was not successful
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
    })

    it('should handle STORE_WEBSITE_QUESTION_SNIPPET when no matching question is found', () => {
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
                            resourceId: '999',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Non-existent Question',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
    })

    it('should handle non-existent article resources', () => {
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
                            resourceId: '999',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata
                .isDeleted,
        ).toBe(true)
    })

    it('should handle non-existent suggested article resources', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const timestamp = new Date().toISOString()

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
                            feedbackValue: JSON.stringify({
                                resourceId: '999',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                    ],
                    resources: [],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.suggestedResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.suggestedResources[0].metadata
                .isDeleted,
        ).toBe(true)
    })

    it('should handle when main resource data is loading', () => {
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
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article Title',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )
        expect(result.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })

    it('should handle EXTERNAL_SNIPPET that becomes STORE_WEBSITE_QUESTION_SNIPPET when no matching question found', () => {
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
                            resourceId: '999',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [
                {
                    id: 1,
                    article_id: 123,
                    title: 'Different Question',
                    helpCenterId: 300,
                },
            ],
            isLoading: false,
        })
        ;(useGetMultipleFileIngestionSnippets as jest.Mock).mockReturnValue({
            ingestedFiles: [],
            isLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata
                .isDeleted,
        ).toBe(true)
        expect(
            result.current?.enrichedData.knowledgeResources[0].resource
                .resourceType,
        ).toBe('EXTERNAL_SNIPPET')
    })

    it('should return empty metadata for STORE_WEBSITE_QUESTION_SNIPPET with non-existent question ID', () => {
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
                            resourceId: '999',
                            resourceType: 'STORE_WEBSITE_QUESTION_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Missing Question',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [
                {
                    id: 1,
                    article_id: 123,
                    title: 'Different Question',
                    helpCenterId: 300,
                },
            ],
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )
        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata
                .isDeleted,
        ).toBe(true)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata.title,
        ).toBe('')
    })

    it('should handle unknown resource type gracefully', () => {
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
                            resourceId: '999',
                            resourceType: 'UNKNOWN_RESOURCE_TYPE' as any,
                            resourceSetId: '100',
                            resourceTitle: 'Unknown Resource',
                            resourceLocale: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(1)
        expect(
            result.current?.enrichedData.knowledgeResources[0].metadata
                .isDeleted,
        ).toBe(true)
    })

    it('should handle null executions gracefully', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })

    it('skip resources when getResourceMetadata returns null', () => {
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
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article Title',
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
        } as FindFeedbackResult['data']

        const useEnrichFeedbackDataModule = require('../useEnrichFeedbackData')
        const getResourceMetadataSpy = jest.spyOn(
            useEnrichFeedbackDataModule,
            'getResourceMetadata',
        )

        getResourceMetadataSpy.mockReturnValue(null)

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.knowledgeResources).toHaveLength(0)

        getResourceMetadataSpy.mockRestore()
    })

    it('skip suggested resources when getResourceMetadata returns null', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const timestamp = new Date().toISOString()

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
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
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
        } as FindFeedbackResult['data']

        const useEnrichFeedbackDataModule = require('../useEnrichFeedbackData')
        const getResourceMetadataSpy = jest.spyOn(
            useEnrichFeedbackDataModule,
            'getResourceMetadata',
        )

        getResourceMetadataSpy.mockReturnValue(null)

        const { result } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.enrichedData.suggestedResources).toHaveLength(0)

        getResourceMetadataSpy.mockRestore()
    })
})

describe('useGetResourcesReasoningMetadata', () => {
    const mockStoreConfiguration = {
        shopName: 'test-store',
        shopType: 'shopify',
        faqHelpCenterId: 100,
        guidanceHelpCenterId: 200,
        snippetHelpCenterId: 300,
    }

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
            resourceId: '6',
            resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
        },
        {
            resourceId: '7',
            resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
            resourceTitle: '#123',
        },
        {
            resourceId: '8',
            resourceType: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
            resourceTitle: 'Test shoes',
        },
        {
            resourceId: '9',
            resourceType:
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
            resourceTitle: 'Test backpack',
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
        mockFlags({
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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 1,
        })
    })

    it('should correctly process resources and call useGetResourceData with correct parameters', () => {
        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration: mockStoreConfiguration,
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

        expect(useGetProductsByIdsFromIntegration).toHaveBeenCalledWith(
            1,
            [8, 9],
            true,
        )
    })

    it('should return enriched resource metadata for all resource types', () => {
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
            {
                id: 2,
                title: 'Guidance Title',
                content: 'Guidance Content',
                helpCenterId: 200,
            },
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
        const mockActions = [{ id: '6', name: 'Action Name' }]
        const mockHelpCenters = [{ id: 100, subdomain: 'test' }]
        const mockProducts = [{ id: 8 }, { id: 9 }]

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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: mockActions,
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: mockProducts,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration: mockStoreConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.isLoading).toBe(false)
        expect(result.current?.data).toEqual([
            {
                title: 'Article Title',
                content: 'Article Content',
                url: expect.any(String),
                helpCenterId: 100,
            },
            {
                title: 'Guidance Title',
                content: 'Guidance Content',
                url: '/mock/guidance/edit/2',
                helpCenterId: 200,
            },
            {
                title: 'https://example.com',
                content: 'https://example.com',
                url: '/mock/articles/detail/300/3',
            },
            {
                title: 'test.pdf',
                content: 'test.pdf',
                url: expect.any(String),
            },
            {
                title: 'Action Name',
                content: 'Action Name',
                url: expect.any(String),
            },
            {
                title: 'Order #123',
                content: 'Order #123',
                url: 'https://admin.shopify.com/store/test-store/orders/7',
            },
            {
                title: 'Test shoes',
                content: 'Test shoes',
                url: '/app/ai-agent/shopify/test-store/knowledge/sources/products-content/8',
            },
            {
                title: 'Test backpack',
                content: 'Test backpack',
                url: '/app/ai-agent/shopify/test-store/knowledge/sources/products-content/9',
            },
        ])
    })

    it('should handle loading state correctly', () => {
        // at least one resource has to be loading
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration: mockStoreConfiguration,
                }),
            { wrapper },
        )

        expect(result.current).toBe(null)
    })

    it('should handle disabled queries', () => {
        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration: mockStoreConfiguration,
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

    it('should return empty metadata for product resources when integrationId is null', () => {
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: null,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const productResources: KnowledgeReasoningResource[] = [
            {
                resourceId: '100',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
            },
            {
                resourceId: '200',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
            },
        ]

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources: productResources,
                    storeConfiguration: mockStoreConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.data).toHaveLength(2)
        expect(result.current?.data[0]).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
        expect(result.current?.data[1]).toEqual({
            title: '',
            content: '',
            isDeleted: true,
        })
        expect(result.current?.isLoading).toBe(false)
    })

    it('should return enriched product metadata when integrationId is valid', () => {
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 54321,
        })

        const mockProduct = { id: 300, title: 'Amazing Product' }
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [mockProduct],
            isLoading: false,
        })

        const productResources: KnowledgeReasoningResource[] = [
            {
                resourceId: '300',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                resourceTitle: 'Amazing Product',
            },
        ]

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources: productResources,
                    storeConfiguration: mockStoreConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.data).toHaveLength(1)
        expect(result.current?.data[0]).toEqual({
            title: 'Amazing Product',
            content: 'Amazing Product',
            url: '/app/ai-agent/shopify/test-store/knowledge/sources/products-content/300',
        })
        expect(result.current?.isLoading).toBe(false)
    })
})

describe('useGetKnowledgeResourceData', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

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
        ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
        ;(useMultipleStoreWebsiteQuestions as jest.Mock).mockReturnValue({
            storeWebsiteQuestions: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })
    })

    it('should return null when loading', () => {
        const params = {
            queriesEnabled: true,
            faqHelpCenterQueryData: { ids: [100], recordIds: [1] },
            guidanceHelpCenterQueryData: { ids: [200], recordIds: [2] },
            snippetHelpCenterQueryData: { ids: [300], recordIds: [3] },
            actionIds: [6],
            productIds: [7],
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
        }

        // Make at least one dependency loading
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true, // This will trigger the loading state
        })

        const { result } = renderHook(
            () => useGetKnowledgeResourceData(params),
            { wrapper },
        )

        expect(result.current).toBe(null)
    })

    it('should handle integrationId extraction in useGetKnowledgeResourceMetadata', () => {
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 12345,
        })

        const mockStoreConfiguration = createMockStoreConfiguration({
            storeName: 'test-store',
            shopType: 'shopify',
        })

        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useGetKnowledgeResourceMetadata({
                    data: feedbackData,
                    storeConfiguration: mockStoreConfiguration,
                    queriesEnabled: true,
                    hasSurfacedProductsInFeedback: false,
                }),
            { wrapper },
        )

        expect(result.current?.isLoading).toBe(false)
        expect(result.current?.knowledgeResources).toBeDefined()
        expect(Array.isArray(result.current?.knowledgeResources)).toBe(true)
        expect(result.current?.knowledgeResources).toHaveLength(0)
    })
})

describe('getResourceMetadata', () => {
    beforeEach(() => {
        mockFlags({
            'ai-shopping-assistant-enabled': false,
        })
    })

    it('should return null when resourceData is null', () => {
        const result = getResourceMetadata(
            {
                id: '1',
                title: 'Test Title',
                type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            'test-store',
            null,
        )

        expect(result).toBe(null)
    })
})
