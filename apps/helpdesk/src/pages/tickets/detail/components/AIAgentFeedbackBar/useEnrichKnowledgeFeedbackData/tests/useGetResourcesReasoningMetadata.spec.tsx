import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { FindAiReasoningAiReasoningResult } from '@gorgias/knowledge-service-types'

import { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'
import { getLDClient } from 'utils/launchDarkly'
import { renderHook } from 'utils/testing/renderHook'

import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useGetResourceData } from '../useEnrichFeedbackData'
import { useGetResourcesReasoningMetadata } from '../useGetResourcesReasoningMetadata'
import { getResourceMetadata } from '../utils'

jest.mock('../useEnrichFeedbackData', () => ({
    useGetResourceData: jest.fn(),
}))

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

jest.mock('utils/launchDarkly', () => ({
    getLDClient: jest.fn(),
}))

jest.mock('../utils', () => ({
    getResourceMetadata: jest.fn(),
}))

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const createMockStoreConfiguration = (
    overrides?: Partial<
        FindAiReasoningAiReasoningResult['data']['storeConfiguration']
    >,
): FindAiReasoningAiReasoningResult['data']['storeConfiguration'] => ({
    shopName: 'test-store',
    shopType: 'shopify',
    faqHelpCenterId: 100,
    guidanceHelpCenterId: 200,
    snippetHelpCenterId: 300,
    ...overrides,
})

describe('useGetResourcesReasoningMetadata', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockResourceData = {
        isLoading: false,
        articles: [],
        guidanceArticles: [],
        sourceItems: [],
        ingestedFiles: [],
        actions: [],
        helpCenters: [],
        storeWebsiteQuestions: [],
        products: [],
    }

    const mockFlags = {
        'ai-shopping-assistant-enabled': false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ;(useGetResourceData as jest.Mock).mockReturnValue(mockResourceData)
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 1,
        })
        ;(getLDClient as jest.Mock).mockReturnValue({
            allFlags: jest.fn().mockReturnValue(mockFlags),
        })
        ;(getResourceMetadata as jest.Mock).mockImplementation((resource) => ({
            title: resource.title || '',
            content: resource.title || '',
            url: `/mock/${resource.type}/${resource.id}`,
        }))
    })

    it('should process resources correctly and call useGetResourceData with proper parameters when all resource types are present', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                resourceTitle: 'Article 1',
            },
            {
                resourceId: '2',
                resourceSetId: '200',
                resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                resourceTitle: 'Guidance 1',
            },
            {
                resourceId: '3',
                resourceSetId: '300',
                resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                resourceTitle: 'Snippet 1',
            },
            {
                resourceId: '4',
                resourceSetId: '300',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                resourceTitle: 'File Snippet 1',
            },
            {
                resourceId: '5',
                resourceSetId: '300',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                resourceTitle: 'Website Question 1',
            },
            {
                resourceId: 'action-1',
                resourceSetId: 'action-set-1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                resourceTitle: 'Action 1',
            },
            {
                resourceId: '100',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                resourceTitle: 'Product 1',
            },
            {
                resourceId: '200',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                resourceTitle: 'Product Recommendation 1',
            },
        ]

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith('test-store')
        expect(getLDClient().allFlags).toHaveBeenCalled()
        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: true,
            faqHelpCenterMetadata: {
                ids: [100],
                recordIds: [1],
            },
            guidanceHelpCenterMetadata: {
                ids: [200],
                recordIds: [2],
            },
            snippetHelpCenterMetadata: {
                ids: [300],
                recordIds: [3, 4, 5],
            },
            actionIds: ['3', '4', '5', 'action-1'],
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [100, 200],
        })

        expect(getResourceMetadata).toHaveBeenCalledTimes(8)
        expect(result.current?.isLoading).toBe(false)
        expect(result.current?.data).toHaveLength(8)
    })

    it('should handle resources without resourceSetId and action resources correctly', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: 'action-1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                resourceTitle: 'Action 1',
            },
            {
                resourceId: 'action-2',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                resourceTitle: 'Action 2',
            },
            {
                resourceId: '1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                resourceTitle: 'Order 1',
            },
            {
                resourceId: '2',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                resourceTitle: 'Product without resourceSetId',
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: true,
            faqHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            guidanceHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            snippetHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            actionIds: undefined,
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [2],
        })
    })

    it('should handle duplicate resources and merge them correctly', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                resourceId: '2',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                resourceId: 'action-1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
            },
            {
                resourceId: 'action-1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                faqHelpCenterMetadata: {
                    ids: [100],
                    recordIds: [1, 2],
                },
                actionIds: undefined,
            }),
        )
    })

    it('should handle nullish coalescing for storeConfiguration properties', () => {
        const testCases = [
            {
                storeConfiguration: undefined,
                expectedShopName: '',
                expectedShopType: '',
            },
            {
                storeConfiguration: null,
                expectedShopName: '',
                expectedShopType: '',
            },
            {
                storeConfiguration: {
                    shopName: undefined,
                    shopType: undefined,
                } as any,
                expectedShopName: '',
                expectedShopType: '',
            },
            {
                storeConfiguration: {
                    shopName: null,
                    shopType: null,
                } as any,
                expectedShopName: '',
                expectedShopType: '',
            },
        ]

        testCases.forEach(
            ({ storeConfiguration, expectedShopName, expectedShopType }) => {
                renderHook(
                    () =>
                        useGetResourcesReasoningMetadata({
                            resources: [],
                            storeConfiguration,
                        }),
                    { wrapper },
                )

                expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith(
                    expectedShopName,
                )
                expect(useGetResourceData).toHaveBeenCalledWith(
                    expect.objectContaining({
                        shopName: expectedShopName,
                        shopType: expectedShopType,
                    }),
                )

                jest.clearAllMocks()
            },
        )
    })

    it('should return null when resourceData is null', () => {
        ;(useGetResourceData as jest.Mock).mockReturnValue(null)

        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
        ]

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current).toBe(null)
        expect(getResourceMetadata).not.toHaveBeenCalled()
    })

    it('should handle empty resources array', () => {
        const storeConfiguration = createMockStoreConfiguration()

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources: [],
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: true,
            faqHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            guidanceHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            snippetHelpCenterMetadata: {
                ids: [],
                recordIds: [],
            },
            actionIds: undefined,
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [],
        })

        expect(result.current?.data).toEqual([])
        expect(getResourceMetadata).not.toHaveBeenCalled()
    })

    it('should handle queriesEnabled parameter correctly', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                    queriesEnabled: false,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                queriesEnabled: false,
            }),
        )

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                queriesEnabled: true,
            }),
        )
    })

    it('should use fallback shopIntegrationId when integrationId is null', () => {
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: null,
        })

        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = []

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                shopIntegrationId: 0,
            }),
        )
    })

    it('should pass isLoading state from resourceData', () => {
        const loadingResourceData = {
            ...mockResourceData,
            isLoading: true,
        }
        ;(useGetResourceData as jest.Mock).mockReturnValue(loadingResourceData)

        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
            },
        ]

        const { result } = renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(result.current?.isLoading).toBe(true)
    })

    it('should handle resources with missing resourceTitle', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            {
                resourceId: '2',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                resourceTitle: 'Order Title',
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(getResourceMetadata).toHaveBeenCalledWith(
            {
                id: '1',
                title: undefined,
                type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            },
            'test-store',
            mockFlags,
            mockResourceData,
        )

        expect(getResourceMetadata).toHaveBeenCalledWith(
            {
                id: '2',
                title: 'Order Title',
                type: AiAgentKnowledgeResourceTypeEnum.ORDER,
            },
            'test-store',
            mockFlags,
            mockResourceData,
        )
    })

    it('should handle string productIds that need conversion to numbers', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
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
            {
                resourceId: 'non-numeric',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                productIds: [100, 200, NaN],
            }),
        )
    })

    it('should handle mixed snippet types in the same resourceSetId', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '300',
                resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            },
            {
                resourceId: '2',
                resourceSetId: '300',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            },
            {
                resourceId: '3',
                resourceSetId: '300',
                resourceType:
                    AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                snippetHelpCenterMetadata: {
                    ids: [300],
                    recordIds: [1, 2, 3],
                },
            }),
        )
    })

    it('should demonstrate that actions without resourceSetId are completely ignored due to early return', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: 'action-without-set',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ACTION,
                resourceTitle: 'Action Without ResourceSetId',
            },
            {
                resourceId: 'order-without-set',
                resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
                resourceTitle: 'Order Without ResourceSetId',
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                actionIds: undefined,
                faqHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
                guidanceHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
                snippetHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
            }),
        )
    })

    it('should handle unknown resource types with resourceSetId that fall through to default case', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: 'UNKNOWN_RESOURCE_TYPE' as any,
                resourceTitle: 'Unknown Resource',
            },
        ]

        renderHook(
            () =>
                useGetResourcesReasoningMetadata({
                    resources,
                    storeConfiguration,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                actionIds: undefined,
                faqHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
                guidanceHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
                snippetHelpCenterMetadata: {
                    ids: [],
                    recordIds: [],
                },
            }),
        )
    })
})
