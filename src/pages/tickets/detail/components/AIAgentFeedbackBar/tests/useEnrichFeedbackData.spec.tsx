import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ldClientMock } from 'jest-launchdarkly-mock'

import { AiAgentScope, StoreConfiguration } from 'models/aiAgent/types'
import {
    useGetMultipleFileIngestion,
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

import {
    useEnrichFeedbackData,
    useGetResourceData,
} from '../useEnrichFeedbackData'

// Mock all the hooks that our target hooks depend on
jest.mock('models/helpCenter/queries', () => ({
    useGetMultipleHelpCenterArticleLists: jest.fn(),
    useGetMultipleFileIngestion: jest.fn(),
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
    customToneOfVoiceGuidance: null,
    signature: '',
    excludedTopics: [],
    tags: [],
    conversationBot: { id: 1, email: 'bot@example.com' },
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
        ;(useGetMultipleFileIngestion as jest.Mock).mockReturnValue({
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
        const mockSourceItems = [{ id: 3, url: 'https://example.com' }]
        const mockIngestedFiles = [
            {
                id: 4,
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
        ;(useGetMultipleFileIngestion as jest.Mock).mockReturnValue({
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
            [100],
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
        ;(useGetMultipleFileIngestion as jest.Mock).mockReturnValue({
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
        const mockSourceItems = [{ id: 3, url: 'https://example.com' }]
        const mockIngestedFiles = [
            {
                id: 4,
                status: 'SUCCESSFUL',
                filename: 'test.pdf',
                google_storage_url: 'https://storage.example.com/test.pdf',
            },
        ]
        const mockMacros = [{ id: 5, name: 'Macro 1', intent: 'Macro Intent' }]
        const mockActions = [{ id: '6', name: 'Action 1' }]
        const mockHelpCenters = [{ id: 1, subdomain: 'test' }]
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
        ;(useMultipleGuidanceArticles as jest.Mock).mockReturnValue({
            guidanceArticles: mockGuidanceArticles,
            isGuidanceArticleListLoading: false,
        })
        ;(useMultiplePublicResources as jest.Mock).mockReturnValue({
            sourceItems: mockSourceItems,
            isSourceItemsListLoading: false,
        })
        ;(useGetMultipleFileIngestion as jest.Mock).mockReturnValue({
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
            'EXTERNAL_SNIPPET',
            'FILE_EXTERNAL_SNIPPET',
            'ORDER',
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
})
