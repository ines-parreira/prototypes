import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { FindAiReasoningAiReasoningResult } from '@gorgias/knowledge-service-types'

import type { KnowledgeReasoningResource } from 'models/aiAgentFeedback/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import { useGetResourceData } from '../useEnrichFeedbackData'
import { useGetResourcesReasoningMetadata } from '../useGetResourcesReasoningMetadata'
import { useGetVersionedArticles } from '../useGetVersionedArticles'
import { getResourceMetadata, getResourceType } from '../utils'

jest.mock('../useEnrichFeedbackData', () => ({
    useGetResourceData: jest.fn(),
}))

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

jest.mock('../utils', () => ({
    getResourceMetadata: jest.fn(),
    getResourceType: jest.fn(),
}))

jest.mock('../useGetVersionedArticles', () => ({
    useGetVersionedArticles: jest.fn(),
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
    shopIntegrationId: 1,
    executionId: 'exec-1',
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

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ;(useGetResourceData as jest.Mock).mockReturnValue(mockResourceData)
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: 1,
        })
        ;(getResourceMetadata as jest.Mock).mockImplementation((resource) => ({
            title: resource.title || '',
            content: resource.title || '',
            url: `/mock/${resource.type}/${resource.id}`,
        }))
        ;(getResourceType as jest.Mock).mockImplementation(
            (_resourceId, type) => type,
        )
        ;(useGetVersionedArticles as jest.Mock).mockReturnValue({
            isLoading: false,
            versionedArticlesMap: new Map(),
        })
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

        // First call: fetch all resources with 'current' version (published)
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
            actionIds: ['action-1'],
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [100, 200],
            versionStatus: 'current',
        })

        // Second call: fetch draft resources with 'latest_draft' version (none in this case)
        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: false, // No draft resources, so disabled
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
            versionStatus: 'latest_draft',
        })

        expect(useGetResourceData).toHaveBeenCalledTimes(2)
        expect(getResourceType).toHaveBeenCalledTimes(8)
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

        // First call: fetch all resources with 'current' version
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
            versionStatus: 'current',
        })

        expect(useGetResourceData).toHaveBeenCalledTimes(2)
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

        // First call: fetch all resources with 'current' version
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
            versionStatus: 'current',
        })

        expect(useGetResourceData).toHaveBeenCalledTimes(2)
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
            mockResourceData,
        )

        expect(getResourceMetadata).toHaveBeenCalledWith(
            {
                id: '2',
                title: 'Order Title',
                type: AiAgentKnowledgeResourceTypeEnum.ORDER,
            },
            'test-store',
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

    it('should handle resourceData with undefined storeWebsiteQuestions and ingestedFiles', () => {
        const resourceDataWithUndefined = {
            isLoading: false,
            articles: [],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: undefined,
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: undefined,
            products: [],
        }
        ;(useGetResourceData as jest.Mock).mockReturnValue(
            resourceDataWithUndefined,
        )

        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '1',
                resourceSetId: '100',
                resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                resourceTitle: 'External Snippet',
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

        expect(getResourceType).toHaveBeenCalledWith(
            '1',
            AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            {
                storeWebsiteQuestions: [],
                ingestedFiles: [],
            },
        )

        expect(result.current?.isLoading).toBe(false)
        expect(result.current?.data).toHaveLength(1)
    })

    it('should handle resourceData with defined storeWebsiteQuestions and ingestedFiles', () => {
        const resourceDataWithValues = {
            isLoading: false,
            articles: [],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: [
                {
                    id: 1,
                    title: 'Test File',
                    ingestionStatus: 'SUCCESSFUL',
                    ingestionId: 'test-ingestion-1',
                },
            ],
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: [
                {
                    article_id: 1,
                    title: 'Test Question',
                },
            ],
            products: [],
        }
        ;(useGetResourceData as jest.Mock).mockReturnValue(
            resourceDataWithValues,
        )

        const storeConfiguration = createMockStoreConfiguration()
        const resources: KnowledgeReasoningResource[] = [
            {
                resourceId: '3',
                resourceSetId: '300',
                resourceType: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                resourceTitle: 'External Snippet with Values',
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

        expect(getResourceType).toHaveBeenCalledWith(
            '3',
            AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            {
                storeWebsiteQuestions:
                    resourceDataWithValues.storeWebsiteQuestions,
                ingestedFiles: resourceDataWithValues.ingestedFiles,
            },
        )

        expect(result.current?.isLoading).toBe(false)
        expect(result.current?.data).toHaveLength(1)
    })

    describe('versioned data', () => {
        it('should return versioned title/content and versionId when content differs from current', () => {
            const versionedMap = new Map([
                [
                    '1',
                    {
                        title: 'Old Title',
                        content: 'Old Content',
                        helpCenterId: 100,
                        updatedDatetime: '2024-01-01T00:00:00Z',
                        versionId: 42,
                    },
                ],
            ])
            ;(useGetVersionedArticles as jest.Mock).mockReturnValue({
                isLoading: false,
                versionedArticlesMap: versionedMap,
            })
            ;(getResourceMetadata as jest.Mock).mockReturnValue({
                title: 'Current Title',
                content: 'Current Content',
                url: '/mock/ARTICLE/1',
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
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

            expect(result.current?.data[0]).toEqual({
                title: 'Old Title',
                content: 'Old Content',
                helpCenterId: 100,
                url: '/mock/ARTICLE/1',
                versionId: 42,
            })
        })

        it('should always return versionId regardless of whether content matches current', () => {
            const versionedMap = new Map([
                [
                    '1',
                    {
                        title: 'Same Title',
                        content: 'Same Content',
                        helpCenterId: 100,
                        updatedDatetime: '2024-01-01T00:00:00Z',
                        versionId: 42,
                    },
                ],
            ])
            ;(useGetVersionedArticles as jest.Mock).mockReturnValue({
                isLoading: false,
                versionedArticlesMap: versionedMap,
            })
            ;(getResourceMetadata as jest.Mock).mockReturnValue({
                title: 'Same Title',
                content: 'Same Content',
                url: '/mock/ARTICLE/1',
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
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

            expect(result.current?.data[0]).toHaveProperty('versionId', 42)
        })

        it('should include versionId when fallback resource is deleted', () => {
            const versionedMap = new Map([
                [
                    '1',
                    {
                        title: 'Old Title',
                        content: 'Old Content',
                        helpCenterId: 100,
                        updatedDatetime: '2024-01-01T00:00:00Z',
                        versionId: 55,
                    },
                ],
            ])
            ;(useGetVersionedArticles as jest.Mock).mockReturnValue({
                isLoading: false,
                versionedArticlesMap: versionedMap,
            })
            ;(getResourceMetadata as jest.Mock).mockReturnValue({
                title: '',
                content: '',
                isDeleted: true,
                isLoading: false,
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
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

            expect(result.current?.data[0]).toHaveProperty('versionId', 55)
        })

        it('should return draft title/content when content differs from current', () => {
            const publishedData = { ...mockResourceData }
            const draftData = { ...mockResourceData }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(publishedData)
                .mockReturnValueOnce(draftData)
            ;(getResourceMetadata as jest.Mock).mockImplementation(
                (_resource, _shopName, resourceData) => {
                    if (resourceData === draftData) {
                        return {
                            title: 'Old Title',
                            content: 'Old Content',
                            helpCenterId: 100,
                            url: '/mock/ARTICLE/1',
                        }
                    }
                    return {
                        title: 'Current Title',
                        content: 'Current Content',
                        url: '/mock/ARTICLE/1',
                    }
                },
            )

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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

            expect(result.current?.data[0]).toEqual({
                title: 'Old Title',
                content: 'Old Content',
                helpCenterId: 100,
                url: '/mock/ARTICLE/1',
            })
        })

        it('should return draft data regardless of whether content matches current', () => {
            const publishedData = { ...mockResourceData }
            const draftData = { ...mockResourceData }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(publishedData)
                .mockReturnValueOnce(draftData)
            ;(getResourceMetadata as jest.Mock).mockImplementation(
                (_resource, _shopName, resourceData) => {
                    if (resourceData === draftData) {
                        return {
                            title: 'Same Title',
                            content: 'Same Content',
                            url: '/mock/ARTICLE/1',
                        }
                    }
                    return {
                        title: 'Same Title',
                        content: 'Same Content',
                        url: '/mock/ARTICLE/1',
                    }
                },
            )

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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

            expect(getResourceMetadata).toHaveBeenCalledWith(
                expect.objectContaining({ id: '1' }),
                'test-store',
                draftData,
            )
            expect(result.current?.data[0]).toEqual({
                title: 'Same Title',
                content: 'Same Content',
                url: '/mock/ARTICLE/1',
            })
        })

        it('should fall back to published data when draft resource is deleted', () => {
            const publishedData = { ...mockResourceData }
            const draftData = { ...mockResourceData }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(publishedData)
                .mockReturnValueOnce(draftData)
            ;(getResourceMetadata as jest.Mock).mockImplementation(
                (_resource, _shopName, resourceData) => {
                    if (resourceData === draftData) {
                        return {
                            title: '',
                            content: '',
                            isDeleted: true,
                            isLoading: false,
                        }
                    }
                    return {
                        title: 'Published Title',
                        content: 'Published Content',
                        url: '/mock/ARTICLE/1',
                    }
                },
            )

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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

            expect(result.current?.data[0]).toEqual({
                title: 'Published Title',
                content: 'Published Content',
                url: '/mock/ARTICLE/1',
            })
        })
    })

    describe('isVersionedLoading', () => {
        it('should set isLoading to true when versioned articles are loading', () => {
            ;(useGetVersionedArticles as jest.Mock).mockReturnValue({
                isLoading: true,
                versionedArticlesMap: new Map(),
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
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

        it('should set isLoading to true when draft articles are loading', () => {
            const publishedData = { ...mockResourceData }
            const draftData = { ...mockResourceData, isLoading: true }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(publishedData)
                .mockReturnValueOnce(draftData)

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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
    })

    describe('draft resource metadata', () => {
        it('should use draft metadata when available for draft resources', () => {
            const draftResourceData = {
                ...mockResourceData,
                articles: [
                    {
                        id: 1,
                        translation: {
                            title: 'Draft Title',
                            content: 'Draft Content',
                        },
                        helpCenterId: 100,
                    },
                ],
            }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(mockResourceData)
                .mockReturnValueOnce(draftResourceData)
            ;(getResourceMetadata as jest.Mock).mockReturnValueOnce({
                title: 'Draft Title',
                content: 'Draft Content',
                url: '/mock/ARTICLE/1',
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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

            expect(result.current?.data[0]).toEqual({
                title: 'Draft Title',
                content: 'Draft Content',
                url: '/mock/ARTICLE/1',
            })
        })

        it('should fall back to published data when draft metadata is deleted', () => {
            const draftResourceData = {
                ...mockResourceData,
            }
            ;(useGetResourceData as jest.Mock)
                .mockReturnValueOnce(mockResourceData)
                .mockReturnValueOnce(draftResourceData)
            ;(getResourceMetadata as jest.Mock)
                .mockReturnValueOnce({
                    title: '',
                    content: '',
                    isDeleted: true,
                    isLoading: false,
                })
                .mockReturnValueOnce({
                    title: 'Published Title',
                    content: 'Published Content',
                    url: '/mock/ARTICLE/1',
                })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
                    resourceIsDraft: true,
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

            expect(result.current?.data[0]).toEqual({
                title: 'Published Title',
                content: 'Published Content',
                url: '/mock/ARTICLE/1',
            })
        })

        it('should use published data for non-draft resources', () => {
            ;(getResourceMetadata as jest.Mock).mockReturnValue({
                title: 'Published Title',
                content: 'Published Content',
                url: '/mock/ARTICLE/1',
            })

            const storeConfiguration = createMockStoreConfiguration()
            const resources: KnowledgeReasoningResource[] = [
                {
                    resourceId: '1',
                    resourceSetId: '100',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceTitle: 'Article 1',
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

            expect(result.current?.data[0]).toEqual({
                title: 'Published Title',
                content: 'Published Content',
                url: '/mock/ARTICLE/1',
            })
        })
    })
})
