import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type { FindFeedbackResult } from '@gorgias/knowledge-service-types'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { ToneOfVoice } from 'pages/aiAgent/constants'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { useGetResourceData } from '../useEnrichFeedbackData'
import { useGetAllRelatedResourceData } from '../useGetAllRelatedResourceData'
import {
    useExtractDistinctHelpCenterFromResources,
    useExtractDistinctProductIdsFromResources,
} from '../utils'

jest.mock('../useEnrichFeedbackData', () => ({
    useGetResourceData: jest.fn(),
}))

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope', () => ({
    useShopifyIntegrationAndScope: jest.fn(),
}))

jest.mock('../utils', () => ({
    useExtractDistinctHelpCenterFromResources: jest.fn(),
    useExtractDistinctProductIdsFromResources: jest.fn(),
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
    scopes: [],
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
    smsDisclaimer: null,
    ...overrides,
})

describe('useGetAllRelatedResourceData', () => {
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
        ;(
            useExtractDistinctProductIdsFromResources as jest.Mock
        ).mockReturnValue([])
        ;(
            useExtractDistinctHelpCenterFromResources as jest.Mock
        ).mockReturnValue({
            faqHelpCenterMetadata: { ids: [100], recordIds: [1] },
            guidanceHelpCenterMetadata: { ids: [200], recordIds: [2] },
            snippetHelpCenterMetadata: { ids: [300], recordIds: [3] },
            actionIds: [],
        })
    })

    it('should call useGetResourceData with correct parameters when all conditions are met', () => {
        const storeConfiguration = createMockStoreConfiguration()
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith('test-store')
        expect(useExtractDistinctProductIdsFromResources).toHaveBeenCalledWith(
            [],
        )
        expect(useExtractDistinctHelpCenterFromResources).toHaveBeenCalledWith(
            [],
            storeConfiguration,
            false,
        )
        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: true,
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: [],
            faqHelpCenterMetadata: { ids: [100], recordIds: [1] },
            guidanceHelpCenterMetadata: { ids: [200], recordIds: [2] },
            snippetHelpCenterMetadata: { ids: [300], recordIds: [3] },
            actionIds: [],
        })
        expect(result.current).toEqual(mockResourceData)
    })

    it('should disable queries when any required condition is not met and handle nullish coalescing for store properties', () => {
        const testCases = [
            {
                storeConfiguration: createMockStoreConfiguration({
                    storeName: undefined as any,
                }),
                data: {
                    accountId: 123,
                    objectType: 'TICKET',
                    objectId: '123',
                    executions: [],
                } as FindFeedbackResult['data'],
                queriesEnabled: true,
                integrationId: 1,
                expectedQueriesEnabled: false,
                expectedShopName: '',
            },
            {
                storeConfiguration: createMockStoreConfiguration({
                    shopType: undefined as any,
                }),
                data: {
                    accountId: 123,
                    objectType: 'TICKET',
                    objectId: '123',
                    executions: [],
                } as FindFeedbackResult['data'],
                queriesEnabled: true,
                integrationId: 1,
                expectedQueriesEnabled: false,
                expectedShopType: '',
            },
            {
                storeConfiguration: createMockStoreConfiguration(),
                data: undefined,
                queriesEnabled: true,
                integrationId: 1,
                expectedQueriesEnabled: false,
            },
            {
                storeConfiguration: createMockStoreConfiguration(),
                data: {
                    accountId: 123,
                    objectType: 'TICKET',
                    objectId: '123',
                    executions: [],
                } as FindFeedbackResult['data'],
                queriesEnabled: false,
                integrationId: 1,
                expectedQueriesEnabled: false,
            },
            {
                storeConfiguration: createMockStoreConfiguration(),
                data: {
                    accountId: 123,
                    objectType: 'TICKET',
                    objectId: '123',
                    executions: [],
                } as FindFeedbackResult['data'],
                queriesEnabled: true,
                integrationId: null,
                expectedQueriesEnabled: false,
            },
            {
                storeConfiguration: createMockStoreConfiguration(),
                data: {
                    accountId: 123,
                    objectType: 'TICKET',
                    objectId: '123',
                    executions: [],
                } as FindFeedbackResult['data'],
                queriesEnabled: undefined,
                integrationId: 1,
                expectedQueriesEnabled: false,
            },
        ]

        testCases.forEach(
            ({
                storeConfiguration,
                data,
                queriesEnabled,
                integrationId,
                expectedQueriesEnabled,
                expectedShopName,
                expectedShopType,
            }) => {
                ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
                    integrationId,
                })

                renderHook(
                    () =>
                        useGetAllRelatedResourceData({
                            data,
                            storeConfiguration,
                            queriesEnabled,
                        }),
                    { wrapper },
                )

                expect(useGetResourceData).toHaveBeenCalledWith(
                    expect.objectContaining({
                        queriesEnabled: expectedQueriesEnabled,
                        shopName:
                            expectedShopName ??
                            storeConfiguration?.storeName ??
                            '',
                        shopType:
                            expectedShopType ??
                            storeConfiguration?.shopType ??
                            '',
                        shopIntegrationId: integrationId ?? 0,
                    }),
                )

                jest.clearAllMocks()
            },
        )
    })

    it('should handle undefined storeConfiguration with nullish coalescing', () => {
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration: undefined,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith('')
        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                queriesEnabled: false,
                shopName: '',
                shopType: '',
                shopIntegrationId: 1,
            }),
        )
    })

    it('should pass through product IDs and help center data correctly', () => {
        const mockProductIds = [100, 200, 300]
        const mockHelpCenterData = {
            faqHelpCenterMetadata: { ids: [400], recordIds: [10, 20] },
            guidanceHelpCenterMetadata: { ids: [500], recordIds: [30] },
            snippetHelpCenterMetadata: { ids: [600], recordIds: [40, 50, 60] },
            actionIds: ['action1', 'action2'],
        }

        ;(
            useExtractDistinctProductIdsFromResources as jest.Mock
        ).mockReturnValue(mockProductIds)
        ;(
            useExtractDistinctHelpCenterFromResources as jest.Mock
        ).mockReturnValue(mockHelpCenterData)

        const storeConfiguration = createMockStoreConfiguration()
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [],
                    storeConfiguration: {
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        shopName: 'test-store',
                        shopType: 'shopify',
                        snippetHelpCenterId: 300,
                        shopIntegrationId: 1,
                        executionId: 'exec-1',
                    },
                },
            ],
        } as FindFeedbackResult['data']

        renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useExtractDistinctProductIdsFromResources).toHaveBeenCalledWith(
            feedbackData.executions,
        )
        expect(useExtractDistinctHelpCenterFromResources).toHaveBeenCalledWith(
            feedbackData.executions,
            storeConfiguration,
            false,
        )
        expect(useGetResourceData).toHaveBeenCalledWith({
            queriesEnabled: true,
            shopName: 'test-store',
            shopType: 'shopify',
            shopIntegrationId: 1,
            productIds: mockProductIds,
            ...mockHelpCenterData,
        })
    })

    it('should use fallback shopIntegrationId when integrationId is null', () => {
        ;(useShopifyIntegrationAndScope as jest.Mock).mockReturnValue({
            integrationId: null,
        })

        const storeConfiguration = createMockStoreConfiguration()
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                shopIntegrationId: 0,
                queriesEnabled: false,
            }),
        )
    })

    it('should return resource data unchanged from useGetResourceData', () => {
        const customResourceData = {
            isLoading: true,
            articles: [{ id: 1, title: 'Test Article' }],
            guidanceArticles: [{ id: 2, title: 'Test Guidance' }],
            sourceItems: [],
            ingestedFiles: [],
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: [],
            products: [{ id: 100 }],
        }

        ;(useGetResourceData as jest.Mock).mockReturnValue(customResourceData)

        const storeConfiguration = createMockStoreConfiguration()
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        const { result } = renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(result.current).toEqual(customResourceData)
    })

    it('should handle empty store configuration properties', () => {
        const storeConfiguration = createMockStoreConfiguration({
            storeName: '',
            shopType: '',
        })
        const feedbackData = {
            accountId: 123,
            objectType: 'TICKET',
            objectId: '123',
            executions: [],
        } as FindFeedbackResult['data']

        renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: feedbackData,
                    storeConfiguration,
                    queriesEnabled: true,
                }),
            { wrapper },
        )

        expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith('')
        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                queriesEnabled: false,
                shopName: '',
                shopType: '',
            }),
        )
    })

    it('should handle all parameters as undefined', () => {
        renderHook(
            () =>
                useGetAllRelatedResourceData({
                    data: undefined,
                    storeConfiguration: undefined,
                    queriesEnabled: undefined,
                }),
            { wrapper },
        )

        expect(useShopifyIntegrationAndScope).toHaveBeenCalledWith('')
        expect(useExtractDistinctProductIdsFromResources).toHaveBeenCalledWith(
            undefined,
        )
        expect(useExtractDistinctHelpCenterFromResources).toHaveBeenCalledWith(
            undefined,
            undefined,
            false,
        )
        expect(useGetResourceData).toHaveBeenCalledWith(
            expect.objectContaining({
                queriesEnabled: false,
                shopName: '',
                shopType: '',
                shopIntegrationId: 1,
            }),
        )
    })
})
