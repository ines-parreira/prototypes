import { FeatureFlagKey } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { FindFeedbackResult } from '@gorgias/knowledge-service-types'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { AiAgentScope } from 'models/aiAgent/types'
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

import {
    useEnrichFeedbackData,
    useGetResourceData,
} from '../useEnrichFeedbackData'

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

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(() => ({
        knowledgeArticle: (type: string, id: number) =>
            `mock/knowledge/${type}/${id}`,
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
        productsDetail: (productId: number) =>
            `/app/ai-agent/shopify/test-store/products/${productId}`,
    })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const createMockStoreConfiguration = (
    overrides?: Partial<StoreConfiguration>,
): StoreConfiguration => ({
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
    isConversationStartersDesktopOnly: false,
    embeddedSpqEnabled: false,
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
        const getLDClientMock = require('@repo/feature-flags')
            .getLDClient as jest.Mock
        getLDClientMock.mockReturnValue({
            allFlags: jest.fn().mockReturnValue({
                [FeatureFlagKey.AiShoppingAssistantEnabled]: false,
            }),
            variation: jest.fn((flag, defaultValue) => defaultValue),
            waitForInitialization: jest.fn(() => Promise.resolve()),
            on: jest.fn(),
            off: jest.fn(),
        })
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

    it('should fetch resources correctly and handle loading states, fallback integration IDs, and different product scenarios', () => {
        const baseParams = {
            queriesEnabled: true,
            faqHelpCenterMetadata: { ids: [100], recordIds: [1] },
            guidanceHelpCenterMetadata: { ids: [200], recordIds: [1] },
            snippetHelpCenterMetadata: { ids: [300], recordIds: [1] },
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
                ingestionStatus: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
                ingestionId: 300,
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

        const { result } = renderHook(
            () =>
                useGetResourceData({
                    ...baseParams,
                    productIds: [400],
                    shopIntegrationId: 1,
                }),
            { wrapper },
        )

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

        expect(useGetMultipleHelpCenterArticleLists).toHaveBeenCalledWith(
            [100],
            { version_status: 'current', per_page: 100, ids: [1] },
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultipleGuidanceArticles).toHaveBeenCalledWith(
            [200],
            expect.objectContaining({ enabled: true }),
            { ids: [1], version_status: 'current' },
        )

        expect(useGetMultipleHelpCenter).toHaveBeenCalledWith(
            [100, 200],
            expect.objectContaining({ enabled: true }),
        )

        expect(useMultiplePublicResources).toHaveBeenCalledWith({
            helpCenterIds: [300],
            recordIds: [1],
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
            undefined,
        )

        expect(useMultipleStoreWebsiteQuestions).toHaveBeenCalledWith({
            snippetHelpCenterIds: [300],
            recordIds: [1],
            shopName: 'test-store',
            queryOptionsOverrides: expect.objectContaining({ enabled: true }),
        })
    })

    it('should handle loading states correctly and return empty products when using fallback shopIntegrationId', () => {
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })

        const loadingParams = {
            queriesEnabled: true,
            faqHelpCenterMetadata: { ids: [100], recordIds: [1] },
            guidanceHelpCenterMetadata: { ids: [200], recordIds: [1] },
            snippetHelpCenterMetadata: { ids: [300], recordIds: [1] },
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [400],
        }

        const { result: loadingResult } = renderHook(
            () => useGetResourceData(loadingParams),
            { wrapper },
        )
        expect(loadingResult.current).toEqual({
            isLoading: true,
            articles: [],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: [],
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: [],
            products: [{ id: 400 }],
        })
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const fallbackParams = {
            ...loadingParams,
            shopIntegrationId: -1,
            productIds: [100, 200],
        }

        const { result: fallbackResult } = renderHook(
            () => useGetResourceData(fallbackParams),
            { wrapper },
        )
        expect(fallbackResult.current?.products).toEqual([])
        expect(fallbackResult.current?.isLoading).toBe(false)
        expect(fallbackResult.current).not.toBe(null)

        const mockProducts = [{ id: 300, title: 'Super Product' }]
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: mockProducts,
            isLoading: false,
        })

        const validParams = {
            ...loadingParams,
            shopIntegrationId: 98765,
            productIds: [300],
        }

        const { result: validResult } = renderHook(
            () => useGetResourceData(validParams),
            { wrapper },
        )
        expect(validResult.current?.products).toEqual(mockProducts)
        expect(validResult.current?.isLoading).toBe(false)
        expect(validResult.current).not.toBe(null)
    })

    it('should handle edge cases with undefined recordIds and empty arrays', () => {
        const edgeCaseParams = {
            queriesEnabled: true,
            faqHelpCenterMetadata: { ids: [100] },
            guidanceHelpCenterMetadata: { ids: [200] },
            snippetHelpCenterMetadata: { ids: [300] },
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [],
        }

        const { result: undefinedRecordIdsResult } = renderHook(
            () => useGetResourceData(edgeCaseParams),
            { wrapper },
        )
        expect(undefinedRecordIdsResult.current).not.toBe(null)

        const emptyRecordIdsParams = {
            queriesEnabled: true,
            faqHelpCenterMetadata: { ids: [100], recordIds: [] },
            guidanceHelpCenterMetadata: { ids: [200], recordIds: [] },
            snippetHelpCenterMetadata: { ids: [300], recordIds: [] },
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [],
        }

        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: true,
        })

        const { result: emptyRecordIdsResult } = renderHook(
            () => useGetResourceData(emptyRecordIdsParams),
            { wrapper },
        )
        expect(emptyRecordIdsResult.current).toEqual({
            isLoading: true,
            articles: [],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: [],
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: [],
            products: [],
        })
        ;(useGetProductsByIdsFromIntegration as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false,
        })

        const emptyHelpCenterIdsParams = {
            queriesEnabled: true,
            faqHelpCenterMetadata: { ids: [], recordIds: [1] },
            guidanceHelpCenterMetadata: { ids: [], recordIds: [1] },
            snippetHelpCenterMetadata: { ids: [], recordIds: [1] },
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [],
        }

        const { result: emptyHelpCenterIdsResult } = renderHook(
            () => useGetResourceData(emptyHelpCenterIdsParams),
            { wrapper },
        )
        expect(emptyHelpCenterIdsResult.current).not.toBe(null)
        expect(emptyHelpCenterIdsResult.current?.articles).toEqual([])
        expect(emptyHelpCenterIdsResult.current?.guidanceArticles).toEqual([])
        expect(emptyHelpCenterIdsResult.current?.sourceItems).toEqual([])
    })
})

describe('useEnrichFeedbackData', () => {
    const mockStoreConfiguration = {
        shopName: 'test-store',
        shopType: 'shopify',
        faqHelpCenterId: 100,
        guidanceHelpCenterId: 200,
        snippetHelpCenterId: 300,
        shopIntegrationId: 1,
        executionId: 'exec-123',
    }
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
    const mockFlags = {}

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        const getLDClientMock = require('@repo/feature-flags')
            .getLDClient as jest.Mock
        getLDClientMock.mockReturnValue({
            allFlags: jest.fn().mockReturnValue(mockFlags),
            variation: jest.fn((flag, defaultValue) => defaultValue),
            waitForInitialization: jest.fn(() => Promise.resolve()),
            on: jest.fn(),
            off: jest.fn(),
        })
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
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Free form feedback',
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
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
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article Title',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance Title',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-4',
                            resourceId: '4',
                            resourceType: 'FILE_EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'File Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-6',
                            resourceId: '6',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Action',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-7',
                            resourceId: '7',
                            resourceType: 'ORDER',
                            resourceSetId: '',
                            resourceTitle: 'Order',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-8',
                            resourceId: '8',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-9',
                            resourceId: 'nonexistent',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-10',
                            resourceId: '10',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-11',
                            resourceId: '10',
                            resourceType: 'PRODUCT_KNOWLEDGE',
                            resourceSetId: '',
                            resourceTitle: 'Product Knowledge',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-12',
                            resourceId: '11',
                            resourceType: 'PRODUCT_RECOMMENDATION',
                            resourceSetId: '',
                            resourceTitle: 'Product Recommendation',
                            resourceLocale: null,
                            resourceVersion: null,
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
                    ingestionStatus: 'SUCCESSFUL',
                    filename: 'test.pdf',
                    google_storage_url: 'https://storage.example.com/test.pdf',
                    ingestionId: 300,
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
                { id: 10, title: 'Product 1' },
                { id: 11, title: 'Product 2' },
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

        it('should return enriched data from feedback executions', () => {
            const { result: result } = renderHook(
                () =>
                    useEnrichFeedbackData({
                        data: feedbackData,
                        storeConfiguration,
                    }),
                { wrapper },
            )

            expect(result.current?.isLoading).toBe(false)

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

            const suggestedResourceTypes =
                result.current?.enrichedData.suggestedResources.map(
                    (sr) => sr.parsedResource.resourceType,
                )

            expect(suggestedResourceTypes).toEqual([
                'GUIDANCE',
                'ACTION',
                'ARTICLE',
                'EXTERNAL_SNIPPET',
                'FILE_EXTERNAL_SNIPPET',
            ])

            expect(result.current?.enrichedData.freeForm).not.toBeNull()
            expect(
                result.current?.enrichedData.freeForm?.feedback.feedbackType,
            ).toBe('TICKET_FREEFORM')
        })
    })

    it('should handle errors in feedback data parsing, missing metadata, missing shopName, disabled queries, null integrationId, and undefined data', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const timestamp = new Date().toISOString()

        const invalidFeedbackData = {
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
                            feedbackValue: '{invalid-json}',
                            submittedBy: 1,
                            createdDatetime: timestamp,
                            updatedDatetime: timestamp,
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '999',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Non-existent Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const originalConsoleError = console.error
        console.error = jest.fn()

        const { result: invalidResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: invalidFeedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            invalidResult.current?.enrichedData.knowledgeResources,
        ).toHaveLength(1)
        expect(
            invalidResult.current?.enrichedData.knowledgeResources[0]?.metadata,
        ).toEqual({
            title: '',
            content: '',
            isDeleted: true,
            isLoading: false,
        })
        expect(invalidResult.current?.enrichedData.suggestedResources).toEqual(
            [],
        )
        expect(invalidResult.current?.enrichedData.freeForm).toBeNull()
        expect(console.error).toHaveBeenCalled()

        const validFeedbackData = {
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
                            resourceTitle: 'Non-existent Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: mockStoreConfiguration,
                },
            ],
        } as FindFeedbackResult['data']

        const emptyStoreConfig = createMockStoreConfiguration({ storeName: '' })
        const { result: emptyShopResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: validFeedbackData,
                    storeConfiguration: emptyStoreConfig,
                }),
            { wrapper },
        )

        expect(
            emptyShopResult.current?.enrichedData.knowledgeResources,
        ).toHaveLength(1)

        const incompleteConfig = createMockStoreConfiguration({
            storeName: '',
            shopType: '',
        })
        const { result: disabledQueriesResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: {
                        accountId: 123,
                        objectType: 'TICKET',
                        objectId: '123',
                        executions: [],
                    },
                    storeConfiguration: incompleteConfig,
                }),
            { wrapper },
        )

        expect(disabledQueriesResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: null,
        })
        const { result: nullIntegrationResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: validFeedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            nullIntegrationResult.current?.enrichedData.knowledgeResources,
        ).toHaveLength(1)
        expect(
            nullIntegrationResult.current?.enrichedData.suggestedResources,
        ).toEqual([])
        expect(nullIntegrationResult.current?.enrichedData.freeForm).toBeNull()
        expect(nullIntegrationResult.current?.isLoading).toBe(false)

        const { result: undefinedDataResult } = renderHook(
            () =>
                useEnrichFeedbackData({ data: undefined, storeConfiguration }),
            { wrapper },
        )

        expect(undefinedDataResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })

        console.error = originalConsoleError
    })

    it('should handle getResourceType for different snippet types and various edge cases', () => {
        const storeConfiguration = createMockStoreConfiguration()

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
            {
                id: 789,
                title: 'failed-file.pdf',
                ingestionStatus: 'FAILED',
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
                            resourceId: '123',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Store Website Question',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '456',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'File Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '789',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Regular Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-4',
                            resourceId: '789',
                            resourceType: 'FILE_EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Failed File',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-5',
                            resourceId: '999',
                            resourceType: 'STORE_WEBSITE_QUESTION_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Missing Question',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-6',
                            resourceId: '999',
                            resourceType: 'UNKNOWN_RESOURCE_TYPE' as any,
                            resourceSetId: '100',
                            resourceTitle: 'Unknown Resource',
                            resourceLocale: null,
                            resourceVersion: null,
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

        const resourceTypes =
            result.current?.enrichedData.knowledgeResources.map(
                (kr) => kr.resource.resourceType,
            )

        expect(resourceTypes).toContain('STORE_WEBSITE_QUESTION_SNIPPET')
        expect(resourceTypes).toContain('FILE_EXTERNAL_SNIPPET')
        expect(resourceTypes).toContain('EXTERNAL_SNIPPET')

        const metadataList =
            result.current?.enrichedData.knowledgeResources.map(
                (kr) => kr.metadata,
            )
        const deletedResources = metadataList?.filter(
            (metadata) => metadata.isDeleted,
        )
        expect(deletedResources?.length).toBeGreaterThan(0)
    })

    it('should successfully process non-product resources when integrationId is available and handle loading', () => {
        const storeConfiguration = createMockStoreConfiguration()

        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 12345,
        })

        const mockArticle = {
            id: 1,
            translation: { title: 'Test Article', content: 'Article content' },
            helpCenterId: 100,
        }
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [mockArticle],
            isLoading: false,
        })
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [{ id: 100, subdomain: 'test' }],
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
                            resourceVersion: null,
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
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: true,
        })

        const { result: loadingResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration,
                }),
            { wrapper },
        )
        expect(
            loadingResult.current?.enrichedData.knowledgeResources,
        ).toHaveLength(1)
        expect(
            loadingResult.current?.enrichedData.knowledgeResources[0].metadata
                .isLoading,
        ).toBe(true)
        expect(
            loadingResult.current?.enrichedData.knowledgeResources[0].metadata
                .isDeleted,
        ).toBe(false)
        expect(loadingResult.current?.enrichedData.suggestedResources).toEqual(
            [],
        )
        expect(loadingResult.current?.enrichedData.freeForm).toBeNull()

        // Reset mocks to avoid affecting subsequent tests
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
            isLoading: false,
        })
    })

    it('should handle null executions gracefully and non-existent suggested resources', () => {
        // Clear all mocks first
        jest.clearAllMocks()

        // Reset all mocks to ensure clean state
        ;(useGetMultipleHelpCenterArticleLists as jest.Mock).mockReturnValue({
            articles: [],
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

        const storeConfiguration = createMockStoreConfiguration()
        const timestamp = new Date().toISOString()

        const nullExecutionsData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const { result: nullResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: nullExecutionsData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(nullResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })

        const nonExistentSuggestedData = {
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
        ;(useGetMultipleHelpCenter as jest.Mock).mockReturnValue({
            helpCenters: [{ id: 100, subdomain: 'test' }],
            isLoading: false,
        })

        const { result: nonExistentResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: nonExistentSuggestedData,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(
            nonExistentResult.current?.enrichedData.suggestedResources,
        ).toHaveLength(0)
        // Non-existent resources are filtered out when isDeleted is true
    })

    it('should handle nullish coalescing for undefined storeConfiguration properties', () => {
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const undefinedStoreConfig = undefined
        const { result: undefinedConfigResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration: undefinedStoreConfig,
                }),
            { wrapper },
        )
        expect(undefinedConfigResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })

        const partialStoreConfig = {} as StoreConfiguration
        const { result: partialConfigResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration: partialStoreConfig,
                }),
            { wrapper },
        )
        expect(partialConfigResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })

        const storeConfigWithUndefinedProps = {
            storeName: undefined,
            shopType: undefined,
        } as any
        const { result: undefinedPropsResult } = renderHook(
            () =>
                useEnrichFeedbackData({
                    data: feedbackData,
                    storeConfiguration: storeConfigWithUndefinedProps,
                }),
            { wrapper },
        )
        expect(undefinedPropsResult.current?.enrichedData).toEqual({
            knowledgeResources: [],
            suggestedResources: [],
            freeForm: null,
        })
    })
})
