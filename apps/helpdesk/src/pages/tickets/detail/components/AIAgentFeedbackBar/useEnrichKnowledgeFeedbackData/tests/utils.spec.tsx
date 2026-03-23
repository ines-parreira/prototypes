import { getLDClient } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import type {
    FeedbackExecutionsItem,
    FindFeedbackResult,
} from '@gorgias/knowledge-service-types'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { ToneOfVoice } from 'pages/aiAgent/constants'

import { AiAgentKnowledgeResourceTypeEnum } from '../../types'
import {
    getEmptyMetadata,
    getResourceMetadata,
    getResourceType,
    knowledgeResourceOrder,
    useActionResources,
    useExtractDistinctHelpCenterFromResources,
    useExtractDistinctProductIdsFromResources,
    useExtractFeedbackResourcesForVersioning,
    useProcessResources,
} from '../utils'

jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    getLDClient: jest.fn(),
    useFlag: jest.fn(() => false),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    getAiAgentNavigationRoutes: jest.fn(() => ({
        guidanceArticleEdit: (id: number) => `/guidance/edit/${id}`,
        articleEdit: (id: number) => `/article/edit/${id}`,
        urlArticlesDetail: (ingestionId: number, articleId: number) =>
            `/articles/detail/${ingestionId}/${articleId}`,
        externalSnippetView: (id: number) => `/snippet/view/${id}`,
        fileSnippetView: (id: number) => `/file/view/${id}`,
        editAction: (id: string) => `/action/edit/${id}`,
        fileArticlesDetail: (ingestionId: number, id: number) =>
            `/file/${ingestionId}/${id}`,
        questionsContentDetail: (id: number) => `/questions/content/${id}`,
        productsDetail: (id: number) => `/products/content/${id}`,
        knowledgeArticle: (type: string, id: number) =>
            `/knowledge/${type}/${id}`,
    })),
}))

jest.mock('../utils', () => {
    const actual = jest.requireActual('../utils')
    return {
        ...actual,
        getHelpCenterArticleUrl: jest.fn(
            () => 'https://help.example.com/article/123',
        ),
    }
})

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
    smsDisclaimer: null,
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
    ...overrides,
})

describe('utils', () => {
    const wrapper = ({ children }: any) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        ;(getLDClient as jest.Mock).mockReturnValue({
            allFlags: jest.fn().mockReturnValue({}),
        })
    })

    describe('useExtractDistinctHelpCenterFromResources', () => {
        it('should extract help center data from executions with feedback and resources when returnRecordIds is true', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '150',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '250',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: 'action-1',
                                resourceType: 'ACTION',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '350',
                            resourceTitle: 'External Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: 'action-2',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Action 2',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'test-store',
                        shopType: 'shopify',
                        faqHelpCenterId: 100,
                        guidanceHelpCenterId: 200,
                        snippetHelpCenterId: 300,
                        executionId: 'exec-1',
                        shopIntegrationId: 1,
                    },
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current).toEqual({
                faqHelpCenterMetadata: {
                    ids: [100, 150],
                    recordIds: [1],
                },
                guidanceHelpCenterMetadata: {
                    ids: [200, 250],
                    recordIds: [2],
                },
                snippetHelpCenterMetadata: {
                    ids: [300, 350],
                    recordIds: [3],
                },
                actionIds: ['action-1', 'action-2'],
            })
        })

        it('should handle undefined executions and storeConfiguration', () => {
            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        undefined,
                        undefined,
                        false,
                    ),
                { wrapper },
            )

            expect(result.current).toEqual({
                faqHelpCenterMetadata: {
                    ids: [],
                    recordIds: undefined,
                },
                guidanceHelpCenterMetadata: {
                    ids: [],
                    recordIds: undefined,
                },
                snippetHelpCenterMetadata: {
                    ids: [],
                    recordIds: undefined,
                },
                actionIds: undefined,
            })
        })

        it('should handle invalid JSON in feedback and return empty arrays when storeConfiguration has no helpCenterIds', () => {
            const storeConfiguration = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: '{invalid-json}',
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const originalConsoleError = console.error
            console.error = jest.fn()

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current).toEqual({
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
                actionIds: [],
            })

            expect(console.error).toHaveBeenCalled()
            console.error = originalConsoleError
        })

        it('should handle duplicate IDs and different feedback types', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'This is freeform feedback',
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Duplicate Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.ids).toEqual([100])
            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
        })

        it('should handle all snippet types correctly in feedback', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'FILE_EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '3',
                                resourceType: 'STORE_WEBSITE_QUESTION_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                1, 2, 3,
            ])
        })

        it('should handle returnRecordIds false branches and default case in resources switch', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Snippet 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-4',
                            resourceId: '4',
                            resourceType: 'UNKNOWN_RESOURCE_TYPE' as any,
                            resourceSetId: '400',
                            resourceTitle: 'Unknown Resource',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        false,
                    ),
                { wrapper },
            )

            expect(result.current).toEqual({
                faqHelpCenterMetadata: {
                    ids: [100],
                    recordIds: undefined,
                },
                guidanceHelpCenterMetadata: {
                    ids: [200],
                    recordIds: undefined,
                },
                snippetHelpCenterMetadata: {
                    ids: [300],
                    recordIds: undefined,
                },
                actionIds: undefined,
            })
        })

        it('should initialize recordIds arrays when undefined and test resources processing branches', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '500',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '600',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'FILE_EXTERNAL_SNIPPET',
                            resourceSetId: '700',
                            resourceTitle: 'File Snippet 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [2],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                3,
            ])
        })

        it('should trigger recordIds initialization in feedback processing when arrays are undefined', () => {
            const storeConfiguration = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '200',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [1],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                2,
            ])
        })

        it('should handle error in try-catch block during feedback processing', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: '{invalid-json-that-throws-error',
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const originalConsoleError = console.error
            console.error = jest.fn()

            renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(console.error).toHaveBeenCalled()
            console.error = originalConsoleError
        })

        it('should trigger FAQ recordIds initialization in feedback processing', () => {
            const storeConfiguration = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
        })

        it('should trigger recordIds initialization in resources processing for all types', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Snippet 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [2],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                3,
            ])
        })

        it('should handle ACTION resources with returnRecordIds=true', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: 'action-1',
                                resourceType: 'ACTION',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: 'action-2',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Action Resource',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.actionIds).toEqual(['action-1', 'action-2'])
        })

        it('should handle ACTION resources in both feedback and resources sections', () => {
            // Test specifically for covering action initialization branches
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: 'feedback-action-1',
                                resourceType: 'ACTION',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: 'feedback-action-2',
                                resourceType: 'ACTION',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: 'resource-action-1',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Resource Action 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: 'resource-action-2',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Resource Action 2',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        undefined, // No store configuration
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.actionIds).toContain('feedback-action-1')
            expect(result.current.actionIds).toContain('feedback-action-2')
            expect(result.current.actionIds).toContain('resource-action-1')
            expect(result.current.actionIds).toContain('resource-action-2')
            expect(result.current.actionIds).toHaveLength(4)
        })
    })

    describe('useActionResources', () => {
        beforeEach(() => {
            ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
                data: [
                    { id: 'action-1', name: 'Action 1' },
                    { id: 'action-2', name: 'Action 2' },
                ],
                isLoading: false,
            })
        })

        it('should return actions and loading state when query is enabled', () => {
            const { result } = renderHook(
                () =>
                    useActionResources('test-store', 'shopify', true, [
                        'action-1',
                    ]),
                { wrapper },
            )

            expect(useGetStoreWorkflowsConfigurations).toHaveBeenCalledWith(
                {
                    storeName: 'test-store',
                    storeType: 'shopify',
                    triggers: ['llm-prompt'],
                },
                {
                    enabled: true,
                    staleTime: 600000,
                    cacheTime: 600000,
                },
                ['action-1'],
            )

            expect(result.current).toEqual({
                actions: [
                    { id: 'action-1', name: 'Action 1' },
                    { id: 'action-2', name: 'Action 2' },
                ],
                isLoading: false,
            })
        })

        it('should return actions data but no loading when query is disabled', () => {
            const { result } = renderHook(
                () => useActionResources('test-store', 'shopify', false),
                { wrapper },
            )

            expect(result.current).toEqual({
                actions: [
                    { id: 'action-1', name: 'Action 1' },
                    { id: 'action-2', name: 'Action 2' },
                ],
                isLoading: false,
            })
        })

        it('should return loading state correctly when data is loading', () => {
            ;(useGetStoreWorkflowsConfigurations as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: true,
            })

            const { result } = renderHook(
                () => useActionResources('test-store', 'shopify', true),
                { wrapper },
            )

            expect(result.current).toEqual({
                actions: [],
                isLoading: true,
            })
        })
    })

    describe('getResourceMetadata', () => {
        const mockResourceData: any = {
            articles: [
                {
                    id: 1,
                    translation: { title: 'Article 1', content: 'Content 1' },
                    helpCenterId: 100,
                },
            ],
            guidanceArticles: [
                {
                    id: 2,
                    title: 'Guidance 1',
                    content: 'Guidance Content',
                    helpCenterId: 200,
                },
            ],
            sourceItems: [
                {
                    id: 3,
                    title: 'External Snippet',
                    ingestionId: 300,
                },
            ],
            ingestedFiles: [
                {
                    id: 4,
                    title: 'File Snippet',
                    ingestionStatus: 'SUCCESSFUL' as const,
                    ingestionId: 300,
                },
                {
                    id: 5,
                    title: 'Failed File',
                    ingestionStatus: 'FAILED' as const,
                    ingestionId: 300,
                },
            ],
            actions: [{ id: 'action-1', name: 'Action 1' }],
            helpCenters: [{ id: 100, subdomain: 'test' }],
            storeWebsiteQuestions: [
                {
                    id: 6,
                    article_id: 6,
                    title: 'Store Website Question',
                    helpCenterId: 300,
                },
            ],
            products: [{ id: 7, title: 'Product 1' }],
        }

        it('should return correct metadata for ARTICLE type', () => {
            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Article Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Article 1',
                content: 'Content 1',
                url: '/knowledge/faq/1',
                helpCenterId: 100,
            })
        })

        it('should return correct metadata for GUIDANCE type', () => {
            const result = getResourceMetadata(
                {
                    id: '2',
                    title: 'Guidance Title',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Guidance 1',
                content: 'Guidance Content',
                url: '/guidance/edit/2',
                helpCenterId: 200,
            })
        })

        it('should return correct metadata for EXTERNAL_SNIPPET type', () => {
            const result = getResourceMetadata(
                {
                    id: '3',
                    title: 'Snippet Title',
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'External Snippet',
                content: 'External Snippet',
                url: '/knowledge/url/3',
            })
        })

        it('should return correct metadata for STORE_WEBSITE_QUESTION_SNIPPET type', () => {
            const result = getResourceMetadata(
                {
                    id: '6',
                    title: 'Question Title',
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Store Website Question',
                content: 'Store Website Question',
                url: '/knowledge/domain/6',
            })
        })

        it('should return correct metadata for FILE_EXTERNAL_SNIPPET type with successful ingestion', () => {
            const result = getResourceMetadata(
                {
                    id: '4',
                    title: 'File Title',
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'File Snippet',
                content: 'File Snippet',
                url: '/knowledge/document/4',
            })
        })

        it('should return emptyMetadata for FILE_EXTERNAL_SNIPPET with failed ingestion', () => {
            const result = getResourceMetadata(
                {
                    id: '5',
                    title: 'File Title',
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should return correct metadata for ACTION type', () => {
            const result = getResourceMetadata(
                {
                    id: 'action-1',
                    title: 'Action Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Action 1',
                content: 'Action 1',
                url: '/action/edit/action-1',
            })
        })

        it('should return correct metadata for ORDER type', () => {
            const result = getResourceMetadata(
                {
                    id: '123',
                    title: '#123',
                    type: AiAgentKnowledgeResourceTypeEnum.ORDER,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Order #123',
                content: 'Order #123',
                url: 'https://admin.shopify.com/store/test-store/orders/123',
            })
        })

        it('should fallback to Order #id when title is undefined for ORDER type', () => {
            const result = getResourceMetadata(
                {
                    id: '456',
                    type: AiAgentKnowledgeResourceTypeEnum.ORDER,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Order #456',
                content: 'Order #456',
                url: 'https://admin.shopify.com/store/test-store/orders/456',
            })
        })

        it('should return correct metadata for PRODUCT_KNOWLEDGE type', () => {
            const result = getResourceMetadata(
                {
                    id: '7',
                    title: 'Product Title',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Product Title',
                content: 'Product Title',
                url: '/products/content/7',
            })
        })

        it('should return correct metadata for PRODUCT_RECOMMENDATION type', () => {
            const result = getResourceMetadata(
                {
                    id: '7',
                    title: 'Product Rec Title',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Product Rec Title',
                content: 'Product Rec Title',
                url: '/products/content/7',
            })
        })

        it('should fallback to product.title when title is undefined for PRODUCT_KNOWLEDGE', () => {
            const result = getResourceMetadata(
                {
                    id: '7',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Product 1',
                content: 'Product 1',
                url: '/products/content/7',
            })
        })

        it('should fallback to product.title when title is undefined for PRODUCT_RECOMMENDATION', () => {
            const result = getResourceMetadata(
                {
                    id: '7',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Product 1',
                content: 'Product 1',
                url: '/products/content/7',
            })
        })

        it('should fallback to empty string when both title and product.title are undefined', () => {
            const resourceDataWithProductNoTitle = {
                ...mockResourceData,
                products: [{ id: 7, title: undefined }],
            }

            const result = getResourceMetadata(
                {
                    id: '7',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                },
                'test-store',
                resourceDataWithProductNoTitle,
            )

            expect(result).toEqual({
                title: '',
                content: '',
                url: '/products/content/7',
            })
        })

        it('should return emptyMetadata for unknown resource type', () => {
            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Unknown Title',
                    type: 'MACRO' as any,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should return emptyMetadata when resource is not found', () => {
            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Non-existent Article',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual(getEmptyMetadata())
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

        it('should handle empty shopName gracefully', () => {
            const result = getResourceMetadata(
                {
                    id: '123',
                    title: '#123',
                    type: AiAgentKnowledgeResourceTypeEnum.ORDER,
                },
                '',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Order #123',
                content: 'Order #123',
                url: 'https://admin.shopify.com/store//orders/123',
            })
        })

        it('should return emptyMetadata for STORE_WEBSITE_QUESTION_SNIPPET when no matching question found', () => {
            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Non-existent Question',
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle resources with no resourceData.storeWebsiteQuestions', () => {
            const resourceDataWithoutQuestions = {
                ...mockResourceData,
                storeWebsiteQuestions: undefined,
            }

            const result = getResourceMetadata(
                {
                    id: '6',
                    title: 'Question Title',
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                },
                'test-store',
                resourceDataWithoutQuestions,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should return emptyMetadata for EXTERNAL_SNIPPET when no matching source item found', () => {
            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Non-existent External Snippet',
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                },
                'test-store',
                mockResourceData,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle resources with no resourceData.sourceItems', () => {
            const resourceDataWithoutSourceItems = {
                ...mockResourceData,
                sourceItems: undefined,
            }

            const result = getResourceMetadata(
                {
                    id: '3',
                    title: 'External Snippet',
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                },
                'test-store',
                resourceDataWithoutSourceItems,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle missing helpCenter in resourceData for articles', () => {
            const resourceDataWithoutHelpCenter = {
                ...mockResourceData,
                helpCenters: [],
            }

            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Article Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                resourceDataWithoutHelpCenter,
            )

            expect(result).toEqual({
                title: 'Article 1',
                content: 'Content 1',
                url: '/knowledge/faq/1',
                helpCenterId: 100,
            })
        })

        it('should handle article without helpCenter found', () => {
            const resourceDataWithMismatchedHelpCenter = {
                ...mockResourceData,
                helpCenters: [{ id: 999, subdomain: 'different' }],
            }

            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Article Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                resourceDataWithMismatchedHelpCenter,
            )

            expect(result).toEqual({
                title: 'Article 1',
                content: 'Content 1',
                url: '/knowledge/faq/1',
                helpCenterId: 100,
            })
        })

        it('should handle guidance not found in resourceData', () => {
            const resourceDataWithoutGuidance = {
                ...mockResourceData,
                guidanceArticles: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Guidance Title',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                },
                'test-store',
                resourceDataWithoutGuidance,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle external snippet not found in sourceItems', () => {
            const resourceDataWithoutSourceItems = {
                ...mockResourceData,
                sourceItems: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Snippet Title',
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                },
                'test-store',
                resourceDataWithoutSourceItems,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle store website question not found', () => {
            const resourceDataWithoutQuestions = {
                ...mockResourceData,
                storeWebsiteQuestions: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Question Title',
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                },
                'test-store',
                resourceDataWithoutQuestions,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle file snippet not found in ingestedFiles', () => {
            const resourceDataWithoutFiles = {
                ...mockResourceData,
                ingestedFiles: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'File Title',
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                },
                'test-store',
                resourceDataWithoutFiles,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle action not found in actions', () => {
            const resourceDataWithoutActions = {
                ...mockResourceData,
                actions: [],
            }

            const result = getResourceMetadata(
                {
                    id: 'unknown-action',
                    title: 'Action Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                },
                'test-store',
                resourceDataWithoutActions,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle product not found for PRODUCT_KNOWLEDGE', () => {
            const resourceDataWithoutProducts = {
                ...mockResourceData,
                products: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Product Title',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                },
                'test-store',
                resourceDataWithoutProducts,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle product not found for PRODUCT_RECOMMENDATION', () => {
            const resourceDataWithoutProducts = {
                ...mockResourceData,
                products: [],
            }

            const result = getResourceMetadata(
                {
                    id: '999',
                    title: 'Product Title',
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                },
                'test-store',
                resourceDataWithoutProducts,
            )

            expect(result).toEqual(getEmptyMetadata())
        })

        it('should handle missing title in guidance article', () => {
            const resourceDataWithGuidanceNoTitle = {
                ...mockResourceData,
                guidanceArticles: [
                    {
                        id: 2,
                        title: null,
                        content: 'Guidance Content',
                        helpCenterId: 200,
                    },
                ],
            }

            const result = getResourceMetadata(
                {
                    id: '2',
                    title: 'Guidance Title',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                },
                'test-store',
                resourceDataWithGuidanceNoTitle,
            )

            expect(result).toEqual({
                title: '',
                content: 'Guidance Content',
                url: '/guidance/edit/2',
                helpCenterId: 200,
            })
        })

        it('should handle missing name in action', () => {
            const resourceDataWithActionNoName = {
                ...mockResourceData,
                actions: [{ id: 'action-1', name: null }],
            }

            const result = getResourceMetadata(
                {
                    id: 'action-1',
                    title: 'Action Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                },
                'test-store',
                resourceDataWithActionNoName,
            )

            expect(result).toEqual({
                title: '',
                content: '',
                url: '/action/edit/action-1',
            })
        })

        it('should handle missing title in article translation', () => {
            const resourceDataWithArticleNoTitle = {
                ...mockResourceData,
                articles: [
                    {
                        id: 1,
                        translation: { title: null, content: 'Content 1' },
                        helpCenterId: 100,
                    },
                ],
            }

            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Article Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                resourceDataWithArticleNoTitle,
            )

            expect(result).toEqual({
                title: '',
                content: 'Content 1',
                url: '/knowledge/faq/1',
                helpCenterId: 100,
            })
        })

        it('should handle missing content in article translation', () => {
            const resourceDataWithArticleNoContent = {
                ...mockResourceData,
                articles: [
                    {
                        id: 1,
                        translation: { title: 'Article 1', content: null },
                        helpCenterId: 100,
                    },
                ],
            }

            const result = getResourceMetadata(
                {
                    id: '1',
                    title: 'Article Title',
                    type: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                },
                'test-store',
                resourceDataWithArticleNoContent,
            )

            expect(result).toEqual({
                title: 'Article 1',
                content: '',
                url: '/knowledge/faq/1',
                helpCenterId: 100,
            })
        })

        it('should handle missing content in guidance article', () => {
            const resourceDataWithGuidanceNoContent = {
                ...mockResourceData,
                guidanceArticles: [
                    {
                        id: 2,
                        title: 'Guidance 1',
                        content: null,
                        helpCenterId: 200,
                    },
                ],
            }

            const result = getResourceMetadata(
                {
                    id: '2',
                    title: 'Guidance Title',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                },
                'test-store',
                resourceDataWithGuidanceNoContent,
            )

            expect(result).toEqual({
                title: 'Guidance 1',
                content: '',
                url: '/guidance/edit/2',
                helpCenterId: 200,
            })
        })

        it('should handle aiAgentRoutes being undefined when shopName is empty', () => {
            const result = getResourceMetadata(
                {
                    id: '2',
                    title: 'Guidance Title',
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                },
                '',
                mockResourceData,
            )

            expect(result).toEqual({
                title: 'Guidance 1',
                content: 'Guidance Content',
                url: undefined,
                helpCenterId: 200,
            })
        })

        it('should handle undefined aiAgentRoutes in all resource types', () => {
            const shopName = ''

            const testCases = [
                {
                    type: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    id: '2',
                    expected: {
                        title: 'Guidance 1',
                        content: 'Guidance Content',
                        url: undefined,
                        helpCenterId: 200,
                    },
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                    id: '3',
                    expected: {
                        title: 'External Snippet',
                        content: 'External Snippet',
                        url: undefined,
                    },
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                    id: '6',
                    expected: {
                        title: 'Store Website Question',
                        content: 'Store Website Question',
                        url: undefined,
                    },
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
                    id: '4',
                    expected: {
                        title: 'File Snippet',
                        content: 'File Snippet',
                        url: undefined,
                    },
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.ACTION,
                    id: 'action-1',
                    expected: {
                        title: 'Action 1',
                        content: 'Action 1',
                        url: '',
                    },
                },
                {
                    type: AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                    id: '7',
                    expected: {
                        title: 'Test Title',
                        content: 'Test Title',
                        url: undefined,
                    },
                },
            ]

            testCases.forEach(({ type, id, expected }) => {
                const result = getResourceMetadata(
                    {
                        id,
                        title: 'Test Title',
                        type,
                    },
                    shopName,
                    mockResourceData,
                )

                expect(result).toEqual(expected)
            })
        })
    })

    describe('getResourceType', () => {
        const mockStoreWebsiteQuestions = [
            { id: 1, article_id: 123, title: 'Question 1', helpCenterId: 300 },
        ] as any

        const mockIngestedFiles = [
            {
                id: 456,
                title: 'File 1',
                ingestionStatus: 'SUCCESSFUL' as const,
                ingestionId: 300,
            },
            {
                id: 789,
                title: 'File 2',
                ingestionStatus: 'FAILED' as const,
                ingestionId: 300,
            },
        ] as any

        it('should return STORE_WEBSITE_QUESTION_SNIPPET when resource matches store website question', () => {
            const result = getResourceType(
                '123',
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                {
                    storeWebsiteQuestions: mockStoreWebsiteQuestions,
                    ingestedFiles: mockIngestedFiles,
                },
            )

            expect(result).toBe(
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
            )
        })

        it('should return FILE_EXTERNAL_SNIPPET when resource matches successful ingested file', () => {
            const result = getResourceType(
                '456',
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                {
                    storeWebsiteQuestions: mockStoreWebsiteQuestions,
                    ingestedFiles: mockIngestedFiles,
                },
            )

            expect(result).toBe(
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            )
        })

        it('should return original type when no matches found', () => {
            const result = getResourceType(
                '999',
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                {
                    storeWebsiteQuestions: mockStoreWebsiteQuestions,
                    ingestedFiles: mockIngestedFiles,
                },
            )

            expect(result).toBe(
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            )
        })

        it('should return original type when type is not EXTERNAL_SNIPPET', () => {
            const result = getResourceType(
                '123',
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                {
                    storeWebsiteQuestions: mockStoreWebsiteQuestions,
                    ingestedFiles: mockIngestedFiles,
                },
            )

            expect(result).toBe(AiAgentKnowledgeResourceTypeEnum.ARTICLE)
        })

        it('should not match failed ingested files', () => {
            const result = getResourceType(
                '789',
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                {
                    storeWebsiteQuestions: mockStoreWebsiteQuestions,
                    ingestedFiles: mockIngestedFiles,
                },
            )

            expect(result).toBe(
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
            )
        })
    })

    describe('useProcessResources', () => {
        const mockResourceData = {
            articles: [
                {
                    id: 1,
                    translation: { title: 'Article 1', content: 'Content 1' },
                    helpCenterId: 100,
                },
            ],
            guidanceArticles: [
                {
                    id: 2,
                    title: 'Guidance 1',
                    content: 'Guidance Content',
                    helpCenterId: 200,
                },
            ],
            sourceItems: [],
            ingestedFiles: [],
            actions: [{ id: 'action-1', name: 'Action 1' }],
            helpCenters: [{ id: 100, subdomain: 'test' }],
            storeWebsiteQuestions: [],
            products: [],
        } as any

        const mockExecutions: FeedbackExecutionsItem[] = [
            {
                executionId: 'exec-1',
                feedback: [
                    {
                        id: 1,
                        objectType: 'TICKET',
                        objectId: '123',
                        executionId: 'exec-1',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackType: 'TICKET_FREEFORM',
                        feedbackValue: 'This is freeform feedback',
                        submittedBy: 1,
                        createdDatetime: new Date().toISOString(),
                        updatedDatetime: new Date().toISOString(),
                    },
                    {
                        id: 2,
                        objectType: 'TICKET',
                        objectId: '123',
                        executionId: 'exec-1',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackType: 'SUGGESTED_RESOURCE',
                        feedbackValue: JSON.stringify({
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                        }),
                        submittedBy: 1,
                        createdDatetime: new Date().toISOString(),
                        updatedDatetime: new Date().toISOString(),
                    },
                ],
                resources: [
                    {
                        id: 'res-1',
                        resourceId: '2',
                        resourceType: 'GUIDANCE',
                        resourceSetId: '200',
                        resourceTitle: 'Guidance Resource',
                        resourceLocale: null,
                        resourceVersion: null,
                        feedback: null,
                    },
                    {
                        id: 'res-2',
                        resourceId: 'action-1',
                        resourceType: 'ACTION',
                        resourceSetId: '',
                        resourceTitle: 'Action Resource',
                        resourceLocale: null,
                        resourceVersion: null,
                        feedback: {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'KNOWLEDGE_RESOURCE',
                            targetId: '123',
                            feedbackType: 'KNOWLEDGE_RESOURCE_BINARY',
                            feedbackValue: 'UP',
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    },
                ],
                storeConfiguration: {} as any,
            },
        ]

        it('should process resources and feedback correctly', () => {
            const { result } = renderHook(
                () =>
                    useProcessResources(
                        mockExecutions,
                        'test-store',
                        mockResourceData,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(2)
            expect(result.current.suggestedResources).toHaveLength(1)
            expect(result.current.freeForm).not.toBeNull()
            expect(result.current.freeForm?.feedback.feedbackType).toBe(
                'TICKET_FREEFORM',
            )
        })

        it('should include product resources', () => {
            const executionsWithProducts: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'PRODUCT_KNOWLEDGE',
                            resourceSetId: '',
                            resourceTitle: 'Product 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithProducts,
                        'test-store',
                        mockResourceData,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(2)
            expect(
                result.current.knowledgeResources[0].resource.resourceType,
            ).toBe('GUIDANCE')
            expect(
                result.current.knowledgeResources[1].resource.resourceType,
            ).toBe('PRODUCT_KNOWLEDGE')
        })

        it('should handle invalid JSON in suggested resource feedback', () => {
            const executionsWithInvalidJson: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: '{invalid-json}',
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const originalConsoleError = console.error
            console.error = jest.fn()

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithInvalidJson,
                        'test-store',
                        mockResourceData,
                    ),
                { wrapper },
            )

            expect(result.current.suggestedResources).toHaveLength(0)
            expect(console.error).toHaveBeenCalledWith(
                'Error parsing suggested resource',
                expect.any(Error),
            )
            console.error = originalConsoleError
        })

        it('should return previous value when resourceData is null', () => {
            const { result, rerender } = renderHook(
                ({ resourceData }) =>
                    useProcessResources(
                        mockExecutions,
                        'test-store',
                        resourceData,
                    ),
                {
                    wrapper,
                    initialProps: { resourceData: mockResourceData },
                },
            )

            const firstResult = result.current

            rerender({ resourceData: null })

            expect(result.current).toBe(firstResult)
        })

        it('should return empty object when resourceData is null', () => {
            const { result } = renderHook(
                ({ resourceData }) =>
                    useProcessResources(
                        mockExecutions,
                        'test-store',
                        resourceData,
                    ),
                {
                    wrapper,
                    initialProps: { resourceData: null },
                },
            )

            expect(result.current).toEqual({
                knowledgeResources: [],
                suggestedResources: [],
                freeForm: null,
            })
        })

        it('should sort resources according to knowledgeResourceOrder', () => {
            const executionsWithMixedTypes: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: 'action-1',
                            resourceType: 'ACTION',
                            resourceSetId: '',
                            resourceTitle: 'Action 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithMixedTypes,
                        'test-store',
                        mockResourceData,
                    ),
                { wrapper },
            )

            const resourceTypes = result.current.knowledgeResources.map(
                (kr) => kr.resource.resourceType,
            )
            expect(resourceTypes).toEqual(['GUIDANCE', 'ACTION', 'ARTICLE'])
        })

        it('should handle feedback with non-TICKET target type', () => {
            const executionsWithNonTicketFeedback: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'RESOURCE' as any,
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNonTicketFeedback,
                        'test-store',
                        mockResourceData as any,
                    ),
                { wrapper },
            )

            expect(result.current.suggestedResources).toHaveLength(0)
            expect(result.current.freeForm).toBeNull()
        })

        it('should handle resources and suggested resources with null metadata and sort multiple suggested resources', () => {
            const executionsWithNullMetadata: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '999',
                                resourceType: 'ARTICLE',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: 'action-1',
                                resourceType: 'ACTION',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
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
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullMetadata,
                        'test-store',
                        mockResourceData as any,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(1)
            expect(
                result.current.knowledgeResources[0].metadata.isDeleted,
            ).toBe(true)
            expect(result.current.suggestedResources).toHaveLength(2)
            const resourceTypes = result.current.suggestedResources.map(
                (sr) => sr.parsedResource.resourceType,
            )
            expect(resourceTypes).toEqual(['ACTION', 'ARTICLE'])
        })

        it('should skip knowledge resources when getResourceMetadata returns null', () => {
            const executionsWithNullMetadata: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
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
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(0)
        })

        it('should skip suggested resources when getResourceMetadata returns null', () => {
            const executionsWithNullSuggestedMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
                        feedback: [
                            {
                                id: 1,
                                objectType: 'TICKET',
                                objectId: '123',
                                executionId: 'exec-1',
                                targetType: 'TICKET',
                                targetId: '123',
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: JSON.stringify({
                                    resourceId: '999',
                                    resourceType: 'ARTICLE',
                                }),
                                submittedBy: 1,
                                createdDatetime: new Date().toISOString(),
                                updatedDatetime: new Date().toISOString(),
                            },
                        ],
                        resources: [],
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullSuggestedMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.suggestedResources).toHaveLength(0)
        })

        it('should handle resources that return null metadata and skip them completely', () => {
            const originalConsoleError = console.error
            console.error = jest.fn()

            const executionsWithResourcesForNullMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
                        feedback: [
                            {
                                id: 1,
                                objectType: 'TICKET',
                                objectId: '123',
                                executionId: 'exec-1',
                                targetType: 'TICKET',
                                targetId: '123',
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: JSON.stringify({
                                    resourceId: '999',
                                    resourceType: 'MACRO',
                                }),
                                submittedBy: 1,
                                createdDatetime: new Date().toISOString(),
                                updatedDatetime: new Date().toISOString(),
                            },
                        ],
                        resources: [
                            {
                                id: 'res-1',
                                resourceId: '999',
                                resourceType: 'MACRO' as any,
                                resourceSetId: '100',
                                resourceTitle: 'Unknown Resource',
                                resourceLocale: null,
                                resourceVersion: null,
                                feedback: null,
                            },
                        ],
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithResourcesForNullMetadata,
                        'test-store',
                        mockResourceData as any,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(1)
            expect(
                result.current.knowledgeResources[0].metadata.isDeleted,
            ).toBe(true)
            expect(result.current.suggestedResources).toHaveLength(0)

            console.error = originalConsoleError
        })

        it('should early return and skip when knowledge resource metadata is null', () => {
            const executionsWithNullKnowledgeResourceMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
                        feedback: [],
                        resources: [
                            {
                                id: 'res-1',
                                resourceId: '999',
                                resourceType: 'MACRO' as any,
                                resourceSetId: '100',
                                resourceTitle: 'Unknown Resource',
                                resourceLocale: null,
                                resourceVersion: null,
                                feedback: null,
                            },
                        ],
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullKnowledgeResourceMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(0)
        })

        it('should early return and skip when suggested resource metadata is null', () => {
            const executionsWithNullSuggestedResourceMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
                        feedback: [
                            {
                                id: 1,
                                objectType: 'TICKET',
                                objectId: '123',
                                executionId: 'exec-1',
                                targetType: 'TICKET',
                                targetId: '123',
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: JSON.stringify({
                                    resourceId: '999',
                                    resourceType: 'MACRO',
                                }),
                                submittedBy: 1,
                                createdDatetime: new Date().toISOString(),
                                updatedDatetime: new Date().toISOString(),
                            },
                        ],
                        resources: [],
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullSuggestedResourceMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.suggestedResources).toHaveLength(0)
        })

        it('should trigger the null metadata return path for knowledge resources', () => {
            const executionsWithNullKnowledgeResourceMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
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
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullKnowledgeResourceMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.knowledgeResources).toHaveLength(0)
        })

        it('should trigger the null metadata return path for suggested resources', () => {
            const executionsWithNullSuggestedResourceMetadata: FeedbackExecutionsItem[] =
                [
                    {
                        executionId: 'exec-1',
                        feedback: [
                            {
                                id: 1,
                                objectType: 'TICKET',
                                objectId: '123',
                                executionId: 'exec-1',
                                targetType: 'TICKET',
                                targetId: '123',
                                feedbackType: 'SUGGESTED_RESOURCE',
                                feedbackValue: JSON.stringify({
                                    resourceId: '999',
                                    resourceType: 'ARTICLE',
                                }),
                                submittedBy: 1,
                                createdDatetime: new Date().toISOString(),
                                updatedDatetime: new Date().toISOString(),
                            },
                        ],
                        resources: [],
                        storeConfiguration: {} as any,
                    },
                ]

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executionsWithNullSuggestedResourceMetadata,
                        'test-store',
                        null,
                    ),
                { wrapper },
            )

            expect(result.current.suggestedResources).toHaveLength(0)
        })
    })

    describe('useExtractDistinctHelpCenterFromResources', () => {
        it('should trigger all recordIds array initialization branches when returnRecordIds is true', () => {
            const storeConfiguration = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'MACRO' as any,
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '200',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '3',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '4',
                            resourceType: 'ARTICLE',
                            resourceSetId: '400',
                            resourceTitle: 'Article 4',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '5',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '500',
                            resourceTitle: 'Guidance 5',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '6',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '600',
                            resourceTitle: 'Snippet 6',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([4])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [2, 5],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                3, 6,
            ])
        })

        it('should handle default case in feedback switch statement', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual(
                [],
            )
            expect(result.current.actionIds).toEqual([])
        })

        it('should test !returnRecordIds branches in all feedback processing', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '200',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '3',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        false,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.ids).toEqual([100])
            expect(result.current.guidanceHelpCenterMetadata.ids).toEqual([200])
            expect(result.current.snippetHelpCenterMetadata.ids).toEqual([300])
            expect(
                result.current.faqHelpCenterMetadata.recordIds,
            ).toBeUndefined()
            expect(
                result.current.guidanceHelpCenterMetadata.recordIds,
            ).toBeUndefined()
            expect(
                result.current.snippetHelpCenterMetadata.recordIds,
            ).toBeUndefined()
        })

        it('should trigger specific recordIds initialization branches in feedback processing for each resource type', () => {
            const storeConfiguration = createMockStoreConfiguration()
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '1',
                                resourceType: 'ARTICLE',
                                resourceSetId: '100',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
                {
                    executionId: 'exec-2',
                    feedback: [
                        {
                            id: 2,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-2',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '2',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '200',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
                {
                    executionId: 'exec-3',
                    feedback: [
                        {
                            id: 3,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-3',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '3',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '300',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [2],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                3,
            ])
        })

        it('should trigger specific recordIds initialization branches in resources processing for each resource type', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
                {
                    executionId: 'exec-2',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
                {
                    executionId: 'exec-3',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '300',
                            resourceTitle: 'Snippet 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executions,
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            expect(result.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(result.current.guidanceHelpCenterMetadata.recordIds).toEqual(
                [2],
            )
            expect(result.current.snippetHelpCenterMetadata.recordIds).toEqual([
                3,
            ])
        })

        it('should hit specific recordIds initialization lines 110, 137, 167 in feedback processing', () => {
            const storeConfiguration = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })

            const { result: result1 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-1',
                                feedback: [
                                    {
                                        id: 1,
                                        objectType: 'TICKET',
                                        objectId: '123',
                                        executionId: 'exec-1',
                                        targetType: 'TICKET',
                                        targetId: '123',
                                        feedbackType: 'SUGGESTED_RESOURCE',
                                        feedbackValue: JSON.stringify({
                                            resourceId: '1',
                                            resourceType: 'ARTICLE',
                                            resourceSetId: '100',
                                        }),
                                        submittedBy: 1,
                                        createdDatetime:
                                            new Date().toISOString(),
                                        updatedDatetime:
                                            new Date().toISOString(),
                                    },
                                ],
                                resources: [],
                                storeConfiguration: {} as any,
                            },
                        ],
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            const { result: result2 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-2',
                                feedback: [
                                    {
                                        id: 2,
                                        objectType: 'TICKET',
                                        objectId: '123',
                                        executionId: 'exec-2',
                                        targetType: 'TICKET',
                                        targetId: '123',
                                        feedbackType: 'SUGGESTED_RESOURCE',
                                        feedbackValue: JSON.stringify({
                                            resourceId: '2',
                                            resourceType: 'GUIDANCE',
                                            resourceSetId: '200',
                                        }),
                                        submittedBy: 1,
                                        createdDatetime:
                                            new Date().toISOString(),
                                        updatedDatetime:
                                            new Date().toISOString(),
                                    },
                                ],
                                resources: [],
                                storeConfiguration: {} as any,
                            },
                        ],
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            const { result: result3 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-3',
                                feedback: [
                                    {
                                        id: 3,
                                        objectType: 'TICKET',
                                        objectId: '123',
                                        executionId: 'exec-3',
                                        targetType: 'TICKET',
                                        targetId: '123',
                                        feedbackType: 'SUGGESTED_RESOURCE',
                                        feedbackValue: JSON.stringify({
                                            resourceId: '3',
                                            resourceType: 'EXTERNAL_SNIPPET',
                                            resourceSetId: '300',
                                        }),
                                        submittedBy: 1,
                                        createdDatetime:
                                            new Date().toISOString(),
                                        updatedDatetime:
                                            new Date().toISOString(),
                                    },
                                ],
                                resources: [],
                                storeConfiguration: {} as any,
                            },
                        ],
                        storeConfiguration,
                        true,
                    ),
                { wrapper },
            )

            expect(result1.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(
                result2.current.guidanceHelpCenterMetadata.recordIds,
            ).toEqual([2])
            expect(result3.current.snippetHelpCenterMetadata.recordIds).toEqual(
                [3],
            )
        })

        it('should hit specific recordIds initialization lines 213, 240, 269 in resources processing', () => {
            const { result: result1 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-1',
                                feedback: [],
                                resources: [
                                    {
                                        id: 'res-1',
                                        resourceId: '1',
                                        resourceType: 'ARTICLE',
                                        resourceSetId: '100',
                                        resourceTitle: 'Article 1',
                                        resourceLocale: null,
                                        resourceVersion: null,
                                        feedback: null,
                                    },
                                ],
                                storeConfiguration: {} as any,
                            },
                        ],
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            const { result: result2 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-2',
                                feedback: [],
                                resources: [
                                    {
                                        id: 'res-2',
                                        resourceId: '2',
                                        resourceType: 'GUIDANCE',
                                        resourceSetId: '200',
                                        resourceTitle: 'Guidance 1',
                                        resourceLocale: null,
                                        resourceVersion: null,
                                        feedback: null,
                                    },
                                ],
                                storeConfiguration: {} as any,
                            },
                        ],
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            const { result: result3 } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        [
                            {
                                executionId: 'exec-3',
                                feedback: [],
                                resources: [
                                    {
                                        id: 'res-3',
                                        resourceId: '3',
                                        resourceType: 'EXTERNAL_SNIPPET',
                                        resourceSetId: '300',
                                        resourceTitle: 'Snippet 1',
                                        resourceLocale: null,
                                        resourceVersion: null,
                                        feedback: null,
                                    },
                                ],
                                storeConfiguration: {} as any,
                            },
                        ],
                        undefined,
                        true,
                    ),
                { wrapper },
            )

            expect(result1.current.faqHelpCenterMetadata.recordIds).toEqual([1])
            expect(
                result2.current.guidanceHelpCenterMetadata.recordIds,
            ).toEqual([2])
            expect(result3.current.snippetHelpCenterMetadata.recordIds).toEqual(
                [3],
            )
        })

        it('should achieve maximum coverage by hitting all remaining uncovered branches systematically', () => {
            const executionsForMaxCoverage: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-max-1',
                    feedback: [
                        {
                            id: 100,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-max-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '100',
                                resourceType: 'ARTICLE',
                                resourceSetId: '1000',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 200,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-max-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '200',
                                resourceType: 'GUIDANCE',
                                resourceSetId: '2000',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                        {
                            id: 300,
                            objectType: 'TICKET',
                            objectId: '123',
                            executionId: 'exec-max-1',
                            targetType: 'TICKET',
                            targetId: '123',
                            feedbackType: 'SUGGESTED_RESOURCE',
                            feedbackValue: JSON.stringify({
                                resourceId: '300',
                                resourceType: 'EXTERNAL_SNIPPET',
                                resourceSetId: '3000',
                            }),
                            submittedBy: 1,
                            createdDatetime: new Date().toISOString(),
                            updatedDatetime: new Date().toISOString(),
                        },
                    ],
                    resources: [
                        {
                            id: 'res-max-1',
                            resourceId: '1000',
                            resourceType: 'ARTICLE',
                            resourceSetId: '10000',
                            resourceTitle: 'Max Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-max-2',
                            resourceId: '2000',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '20000',
                            resourceTitle: 'Max Guidance',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-max-3',
                            resourceId: '3000',
                            resourceType: 'EXTERNAL_SNIPPET',
                            resourceSetId: '30000',
                            resourceTitle: 'Max Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {
                        shopName: 'max-test-shop',
                        shopType: 'shopify',
                        faqHelpCenterId: null,
                        guidanceHelpCenterId: null,
                        snippetHelpCenterId: null,
                    } as any,
                },
            ]

            const storeConfigMaxCoverage = createMockStoreConfiguration({
                helpCenterId: undefined,
                guidanceHelpCenterId: undefined,
                snippetHelpCenterId: undefined,
            })

            const { result: maxResult } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        executionsForMaxCoverage,
                        storeConfigMaxCoverage,
                        true,
                    ),
                { wrapper },
            )

            expect(maxResult.current.faqHelpCenterMetadata.ids).toContain(1000)
            expect(maxResult.current.faqHelpCenterMetadata.ids).toContain(10000)
            expect(maxResult.current.faqHelpCenterMetadata.recordIds).toContain(
                100,
            )
            expect(maxResult.current.faqHelpCenterMetadata.recordIds).toContain(
                1000,
            )

            expect(maxResult.current.guidanceHelpCenterMetadata.ids).toContain(
                2000,
            )
            expect(maxResult.current.guidanceHelpCenterMetadata.ids).toContain(
                20000,
            )
            expect(
                maxResult.current.guidanceHelpCenterMetadata.recordIds,
            ).toContain(200)
            expect(
                maxResult.current.guidanceHelpCenterMetadata.recordIds,
            ).toContain(2000)

            expect(maxResult.current.snippetHelpCenterMetadata.ids).toContain(
                3000,
            )
            expect(maxResult.current.snippetHelpCenterMetadata.ids).toContain(
                30000,
            )
            expect(
                maxResult.current.snippetHelpCenterMetadata.recordIds,
            ).toContain(300)
            expect(
                maxResult.current.snippetHelpCenterMetadata.recordIds,
            ).toContain(3000)
        })

        it('should reach 100% coverage with extreme edge case combinations', () => {
            const edgeCases = [
                {
                    executionId: 'edge-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'edge-res-1',
                            resourceId: '999',
                            resourceType: 'ARTICLE' as any,
                            resourceSetId: '9999',
                            resourceTitle: 'Edge Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: null as any,
                },
                {
                    executionId: 'edge-2',
                    feedback: [],
                    resources: [
                        {
                            id: 'edge-res-2',
                            resourceId: '888',
                            resourceType: 'GUIDANCE' as any,
                            resourceSetId: '8888',
                            resourceTitle: 'Edge Guidance',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: null as any,
                },
                {
                    executionId: 'edge-3',
                    feedback: [],
                    resources: [
                        {
                            id: 'edge-res-3',
                            resourceId: '777',
                            resourceType: 'EXTERNAL_SNIPPET' as any,
                            resourceSetId: '7777',
                            resourceTitle: 'Edge Snippet',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: null as any,
                },
            ]

            const { result: edgeResult } = renderHook(
                () =>
                    useExtractDistinctHelpCenterFromResources(
                        edgeCases,
                        null as any,
                        true,
                    ),
                { wrapper },
            )

            expect(
                edgeResult.current.faqHelpCenterMetadata.recordIds,
            ).toContain(999)
            expect(
                edgeResult.current.guidanceHelpCenterMetadata.recordIds,
            ).toContain(888)
            expect(
                edgeResult.current.snippetHelpCenterMetadata.recordIds,
            ).toContain(777)
        })
    })

    describe('useExtractDistinctProductIdsFromResources', () => {
        it('should extract product IDs from executions', () => {
            const executions: FindFeedbackResult['data']['executions'] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '123',
                            resourceType: 'PRODUCT_KNOWLEDGE',
                            resourceSetId: '',
                            resourceTitle: 'Product 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '456',
                            resourceType: 'PRODUCT_RECOMMENDATION',
                            resourceSetId: '',
                            resourceTitle: 'Product 2',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '789',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractDistinctProductIdsFromResources(executions),
                { wrapper },
            )

            expect(result.current).toEqual([123, 456])
        })

        it('should handle undefined executions', () => {
            const { result } = renderHook(
                () => useExtractDistinctProductIdsFromResources(undefined),
                { wrapper },
            )

            expect(result.current).toEqual([])
        })

        it('should handle empty executions', () => {
            const { result } = renderHook(
                () => useExtractDistinctProductIdsFromResources([]),
                { wrapper },
            )

            expect(result.current).toEqual([])
        })

        it('should handle executions with no product resources', () => {
            const executions: FindFeedbackResult['data']['executions'] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractDistinctProductIdsFromResources(executions),
                { wrapper },
            )

            expect(result.current).toEqual([])
        })

        it('should handle string resource IDs and convert them to numbers', () => {
            const executions: FindFeedbackResult['data']['executions'] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: 'non-numeric',
                            resourceType: 'PRODUCT_KNOWLEDGE',
                            resourceSetId: '',
                            resourceTitle: 'Product 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractDistinctProductIdsFromResources(executions),
                { wrapper },
            )

            expect(result.current).toEqual([NaN])
        })
    })

    describe('knowledgeResourceOrder', () => {
        it('should have the correct order of resource types', () => {
            expect(knowledgeResourceOrder).toEqual([
                AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                AiAgentKnowledgeResourceTypeEnum.ACTION,
                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                AiAgentKnowledgeResourceTypeEnum.STORE_WEBSITE_QUESTION_SNIPPET,
                AiAgentKnowledgeResourceTypeEnum.ORDER,
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_KNOWLEDGE,
                AiAgentKnowledgeResourceTypeEnum.PRODUCT_RECOMMENDATION,
                AiAgentKnowledgeResourceTypeEnum.EXTERNAL_SNIPPET,
                AiAgentKnowledgeResourceTypeEnum.FILE_EXTERNAL_SNIPPET,
            ])
        })
    })

    describe('emptyMetadata', () => {
        it('should have the correct structure', () => {
            expect(getEmptyMetadata()).toEqual({
                title: '',
                content: '',
                isDeleted: true,
                isLoading: false,
            })
        })
    })

    describe('useExtractFeedbackResourcesForVersioning', () => {
        it('should return empty array for undefined executions', () => {
            const { result } = renderHook(
                () => useExtractFeedbackResourcesForVersioning(undefined),
                { wrapper },
            )

            expect(result.current).toEqual([])
        })

        it('should return empty array for resources without version or locale', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: 'en-US',
                            resourceVersion: null,
                            feedback: null,
                        },
                        {
                            id: 'res-3',
                            resourceId: '3',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 2',
                            resourceLocale: null,
                            resourceVersion: '5',
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractFeedbackResourcesForVersioning(executions),
                { wrapper },
            )

            expect(result.current).toEqual([])
        })

        it('should return resources that have both version and locale', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: 'en-US',
                            resourceVersion: '5',
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'GUIDANCE',
                            resourceSetId: '200',
                            resourceTitle: 'Guidance 1',
                            resourceLocale: 'fr-FR',
                            resourceVersion: '3',
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractFeedbackResourcesForVersioning(executions),
                { wrapper },
            )

            expect(result.current).toEqual([
                {
                    resourceId: '1',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    resourceSetId: '100',
                    resourceTitle: 'Article 1',
                    resourceVersion: '5',
                    resourceLocale: 'en-US',
                },
                {
                    resourceId: '2',
                    resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                    resourceSetId: '200',
                    resourceTitle: 'Guidance 1',
                    resourceVersion: '3',
                    resourceLocale: 'fr-FR',
                },
            ])
        })

        it('should only include resources with both version and locale from mixed set', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Versioned',
                            resourceLocale: 'en-US',
                            resourceVersion: '5',
                            feedback: null,
                        },
                        {
                            id: 'res-2',
                            resourceId: '2',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'No version',
                            resourceLocale: 'en-US',
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const { result } = renderHook(
                () => useExtractFeedbackResourcesForVersioning(executions),
                { wrapper },
            )

            expect(result.current).toHaveLength(1)
            expect(result.current[0].resourceId).toBe('1')
        })
    })

    describe('useProcessResources with versionedArticlesMap', () => {
        const baseResourceData = {
            articles: [
                {
                    id: 1,
                    translation: {
                        title: 'Current Title',
                        content: 'Current Content',
                    },
                    helpCenterId: 100,
                },
            ],
            guidanceArticles: [],
            sourceItems: [],
            ingestedFiles: [],
            actions: [],
            helpCenters: [],
            storeWebsiteQuestions: [],
            products: [],
        } as any

        it('should use versioned data when resource matches versionedArticlesMap', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const versionedArticlesMap = new Map([
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

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executions,
                        'test-store',
                        baseResourceData,
                        versionedArticlesMap,
                    ),
                { wrapper },
            )

            const metadata = result.current.knowledgeResources[0].metadata
            expect(metadata.title).toBe('Old Title')
            expect(metadata.content).toBe('Old Content')
            expect(metadata.versionId).toBe(42)
        })

        it('should not include versionId when versioned content matches current content', () => {
            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '1',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Article 1',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const versionedArticlesMap = new Map([
                [
                    '1',
                    {
                        title: 'Current Title',
                        content: 'Current Content',
                        helpCenterId: 100,
                        updatedDatetime: '2024-01-01T00:00:00Z',
                        versionId: 42,
                    },
                ],
            ])

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executions,
                        'test-store',
                        baseResourceData,
                        versionedArticlesMap,
                    ),
                { wrapper },
            )

            const metadata = result.current.knowledgeResources[0].metadata
            expect(metadata.title).toBe('Current Title')
            expect(metadata.versionId).toBeUndefined()
        })

        it('should include versionId when fallback resource is deleted', () => {
            const resourceDataWithNoArticle = {
                ...baseResourceData,
                articles: [],
            }

            const executions: FeedbackExecutionsItem[] = [
                {
                    executionId: 'exec-1',
                    feedback: [],
                    resources: [
                        {
                            id: 'res-1',
                            resourceId: '999',
                            resourceType: 'ARTICLE',
                            resourceSetId: '100',
                            resourceTitle: 'Deleted Article',
                            resourceLocale: null,
                            resourceVersion: null,
                            feedback: null,
                        },
                    ],
                    storeConfiguration: {} as any,
                },
            ]

            const versionedArticlesMap = new Map([
                [
                    '999',
                    {
                        title: 'Old Title',
                        content: 'Old Content',
                        helpCenterId: 100,
                        updatedDatetime: '2024-01-01T00:00:00Z',
                        versionId: 55,
                    },
                ],
            ])

            const { result } = renderHook(
                () =>
                    useProcessResources(
                        executions,
                        'test-store',
                        resourceDataWithNoArticle,
                        versionedArticlesMap,
                    ),
                { wrapper },
            )

            const metadata = result.current.knowledgeResources[0].metadata
            expect(metadata.title).toBe('Old Title')
            expect(metadata.versionId).toBe(55)
        })
    })
})
