import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type * as ReactRouterDom from 'react-router-dom'
import { BrowserRouter, useHistory, useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { TicketChannel } from 'business/types/ticket'
import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'
import { selfServiceConfiguration1 } from 'fixtures/self_service_configurations'
import { useArticleRecommendationPredictions } from 'models/articleRecommendationPrediction/queries'
import { articleRecommendationPredictionsResponseFixture } from 'models/articleRecommendationPrediction/tests/article-recommendation-prediction.fixture'
import {
    useGetHelpCenter,
    useGetHelpCenterArticle,
    useUpdateArticleTranslation,
} from 'models/helpCenter/queries'
import type { GorgiasChatIntegration } from 'models/integration/types'
import useApplicationsAutomationSettings from 'pages/automate/common/hooks/useApplicationsAutomationSettings'
import { useHelpCenterPublishedArticlesCount } from 'pages/automate/common/hooks/useHelpCenterPublishedArticlesCount'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import useHelpCenterArticleTree from 'pages/automate/trainMyAi/hooks/useHelpCenterArticleTree'
import useUpdateArticleRecommendationPrediction from 'pages/automate/trainMyAi/hooks/useUpdateArticleRecommendationPrediction'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { useIsAutomateSettings } from 'settings/automate/hooks/useIsAutomateSettings'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ARTICLE_RECOMMENDATION } from '../../common/components/constants'
import TrainMyAiView from '../TrainMyAiView'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
jest.mock('pages/automate/trainMyAi/hooks/useHelpCenterArticleTree')
jest.mock(
    'pages/automate/trainMyAi/hooks/useUpdateArticleRecommendationPrediction',
)
jest.mock('pages/automate/common/hooks/useHelpCenterPublishedArticlesCount')
jest.mock('pages/automate/common/hooks/useSelfServiceChatChannels')
jest.mock('pages/automate/common/hooks/useApplicationsAutomationSettings')
jest.mock('settings/automate/hooks/useIsAutomateSettings', () => ({
    useIsAutomateSettings: jest.fn(),
}))
const useIsAutomateSettingsMock = assumeMock(useIsAutomateSettings)
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
}))
jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof ReactRouterDom),
    useHistory: jest.fn(),
    useParams: jest.fn(),
}))

jest.mock('models/articleRecommendationPrediction/queries')
jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration')

jest.mock('hooks/useAppSelector')
jest.mock('models/helpCenter/queries')

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock(
    'pages/settings/helpCenter/components/articles/HelpCenterEditor/FroalaEditorComponent',
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const queryClient = mockQueryClient()

const updateMutateMock = jest.fn().mockResolvedValue({})
const updateArticleTranslationMutateMock = jest.fn().mockResolvedValue({})

const useCurrentHelpCenterMock = useCurrentHelpCenter as jest.MockedFunction<
    typeof useCurrentHelpCenter
>

const useUpdateArticleTranslationMock =
    useUpdateArticleTranslation as jest.MockedFunction<
        typeof useUpdateArticleTranslation
    >

const useHelpCenterMock = useGetHelpCenter as jest.MockedFunction<
    typeof useGetHelpCenter
>

const useHelpCenterArticleTreeMock =
    useHelpCenterArticleTree as jest.MockedFunction<
        typeof useHelpCenterArticleTree
    >

const useGetHelpCenterArticleMock =
    useGetHelpCenterArticle as jest.MockedFunction<
        typeof useGetHelpCenterArticle
    >

const useUpdateArticleRecommendationPredictionMock =
    useUpdateArticleRecommendationPrediction as jest.MockedFunction<
        typeof useUpdateArticleRecommendationPrediction
    >

const useArticleRecommendationPredictionsMock =
    useArticleRecommendationPredictions as jest.MockedFunction<
        typeof useArticleRecommendationPredictions
    >

const useSelfServiceChatChannelsMock =
    useSelfServiceChatChannels as jest.MockedFunction<
        typeof useSelfServiceChatChannels
    >

const useHelpCenterPublishedArticlesCountMock =
    useHelpCenterPublishedArticlesCount as jest.MockedFunction<
        typeof useHelpCenterPublishedArticlesCount
    >

const useApplicationsAutomationSettingsMock =
    useApplicationsAutomationSettings as jest.MockedFunction<
        typeof useApplicationsAutomationSettings
    >

const useHistoryMock = useHistory as jest.MockedFunction<typeof useHistory>

const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

const helpCenterArticleData = {
    available_locales: ['en-US'],
    help_center_id: 1,
    id: 1,
    translation: {
        article_id: 10,
        content: '<div>This article exists</div>',
        title: 'Article A',
        slug: 'article-a',
    },
}

describe('<TrainMyAiView />', () => {
    const defaultState = {
        entities: {
            chatsApplicationAutomationSettings: fromJS({}),
        },
    } as RootState

    beforeEach(() => {
        useIsAutomateSettingsMock.mockReturnValue(false)
        useParamsMock.mockReturnValue({
            shopType: 'shopify',
            shopName: 'myShop,',
        }) as unknown as ReturnType<typeof useParamsMock>

        useCurrentHelpCenterMock.mockReturnValue(
            getSingleHelpCenterResponseFixture,
        )

        useHistoryMock.mockReturnValue({
            push: jest.fn(),
        } as unknown as ReturnType<typeof useHistoryMock>)

        useUpdateArticleRecommendationPredictionMock.mockImplementation(() => {
            return {
                mutateAsync: updateMutateMock,
            } as unknown as ReturnType<
                typeof useUpdateArticleRecommendationPrediction
            >
        })

        useGetHelpCenterArticleMock.mockImplementation(() => {
            return {
                data: helpCenterArticleData,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useGetHelpCenterArticleMock>
        })

        useUpdateArticleTranslationMock.mockImplementation(() => {
            return {
                mutateAsync: updateArticleTranslationMutateMock,
            } as unknown as ReturnType<typeof useUpdateArticleTranslationMock>
        })

        useSelfServiceChatChannelsMock.mockReturnValue([
            {
                type: TicketChannel.Chat,
                value: {
                    id: 1,
                    name: 'sfbibcycles chat',
                    meta: {
                        app_id: '1',
                    },
                    decoration: {
                        main_color: GORGIAS_CHAT_DEFAULT_COLOR,
                    },
                } as GorgiasChatIntegration,
            },
        ])

        useHelpCenterArticleTreeMock.mockReturnValue({
            map: new Map([[1, 'value']]),
            isLoading: true,
        } as ReturnType<typeof useHelpCenterArticleTreeMock>)

        window.HTMLElement.prototype.scrollTo = jest.fn()
    })

    it('should render empty information when no article recommendation has been sent', () => {
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: {
                    data: [] as any,
                    meta: {
                        pagination: {
                            totalSize: 0,
                            currentPage: 1,
                            nextPage: null,
                            pageLimit: 50,
                            pageSize: 0,
                            totalPages: 1,
                        },
                        progress: {
                            value: 0,
                            maxValue: 0,
                        },
                        completed: false,
                        totalDistinctArticles: 0,
                        totalLabeledArticles: 0,
                    },
                },
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        expect(
            screen.queryByText('No recommendations have been sent yet'),
        ).toBeInTheDocument()
    })

    it('should render empty information when help center deleted', () => {
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: {
                    data: [] as any,
                    meta: {
                        pagination: {
                            totalSize: 0,
                            currentPage: 1,
                            nextPage: null,
                            pageLimit: 50,
                            pageSize: 0,
                            totalPages: 1,
                        },
                        progress: {
                            value: 0,
                            maxValue: 0,
                        },
                        totalDistinctArticles: 0,
                        totalLabeledArticles: 0,
                    },
                },
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: true,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        expect(
            screen.queryByText(
                'Configure Article Recommendation to access AI training',
            ),
        ).toBeInTheDocument()
    })

    it('should render cards recommendations list', () => {
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: articleRecommendationPredictionsResponseFixture,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        expect(
            screen.getByText('Provide feedback on Article Recommendations.'),
        ).toBeInTheDocument()
    })

    it('should render first unanswered article recommendation preview when clicking "Provide feedback"', () => {
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: articleRecommendationPredictionsResponseFixture,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        fireEvent.click(screen.getByText('Provide feedback'))
        expect(screen.queryByText('Provide feedback')).not.toBeInTheDocument()
        expect(screen.queryByText('This article exists')).toBeInTheDocument()

        // not answered prediction has two identical article titles
        // for the ai banner and for the article preview
        expect(
            screen.queryAllByText(helpCenterArticleData.translation.title),
        ).toHaveLength(2)
    })

    it('should render completition message if feedback provided to all recommendations"', () => {
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: {
                    data: [
                        {
                            id: 1,
                            message: 'message 1',
                            conversationId:
                                '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                            shopName: 'test-store',
                            shopType: 'shopify',
                            locale: 'en-US',
                            accountId: 1,
                            helpCenterId: 3,
                            articleId: 2,
                            articleIdFeedback: 1,
                            isHelpful: false,
                            createdDatetime: '2023-12-03T16:26:52.897Z',
                            updatedDatetime: '2023-12-01T15:59:21.371Z',
                        },
                        {
                            id: 2,
                            message: 'message 2',
                            conversationId:
                                '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                            shopName: 'test-store',
                            shopType: 'shopify',
                            locale: 'en-US',
                            accountId: 1,
                            helpCenterId: 3,
                            articleId: 2,
                            articleIdFeedback: 2,
                            isHelpful: false,
                            createdDatetime: '2023-12-03T16:26:52.897Z',
                            updatedDatetime: '2023-12-01T15:59:21.371Z',
                        },
                        {
                            id: 3,
                            message: 'message 3',
                            conversationId:
                                '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                            shopName: 'test-store',
                            shopType: 'shopify',
                            locale: 'en-US',
                            accountId: 1,
                            helpCenterId: 3,
                            articleId: 1,
                            articleIdFeedback: 3,
                            isHelpful: false,
                            createdDatetime: '2023-12-03T16:26:52.897Z',
                            updatedDatetime: '2023-12-01T15:59:21.371Z',
                        },
                    ],
                    meta: {
                        pagination: {
                            currentPage: 1,
                            nextPage: null,
                            pageLimit: 50,
                            pageSize: 1,
                            totalPages: 1,
                            totalSize: 1,
                        },
                        progress: {
                            value: 1,
                            maxValue: 1,
                        },
                        completed: true,
                        totalDistinctArticles: 1,
                        totalLabeledArticles: 1,
                    },
                },
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        expect(screen.getByText('🎉')).toBeInTheDocument()
    })

    it('should render article recommendation preview with no relevant article"', () => {
        const recommendationData = {
            data: [
                {
                    id: 1,
                    message: 'no relevant feedback',
                    conversationId: '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                    shopName: 'test-store',
                    shopType: 'shopify',
                    locale: 'en-US',
                    accountId: 1,
                    helpCenterId: 3,
                    articleId: 19,
                    articleIdFeedback: -1,
                    isHelpful: false,
                    createdDatetime: '2023-12-03T16:26:52.897Z',
                    updatedDatetime: '2023-12-01T15:59:21.371Z',
                },
            ],
            meta: {
                pagination: {
                    currentPage: 1,
                    nextPage: null,
                    pageLimit: 50,
                    pageSize: 1,
                    totalPages: 1,
                    totalSize: 1,
                },
                progress: {
                    value: 1,
                    maxValue: 1,
                },
                totalDistinctArticles: 1,
                totalLabeledArticles: 1,
            },
        }
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: recommendationData,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
                subdomain: 'subdomain',
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: new RegExp(recommendationData.data[0].message, 'i'),
            }),
        )

        expect(screen.getAllByText('No relevant articles')).toHaveLength(2)

        expect(
            screen.getByText('Which article should have been sent?'),
        ).toBeInTheDocument()
    })

    it('should render article recommendation preview with no feedback"', () => {
        const recommendationData = {
            data: [
                {
                    id: 1,
                    message: 'no feedback',
                    conversationId: '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                    shopName: 'test-store',
                    shopType: 'shopify',
                    locale: 'en-US',
                    accountId: 1,
                    helpCenterId: 3,
                    articleId: 19,
                    articleIdFeedback: null,
                    isHelpful: true,
                    createdDatetime: '2023-12-03T16:26:52.897Z',
                    updatedDatetime: '2023-12-01T15:59:21.371Z',
                },
            ],
            meta: {
                pagination: {
                    currentPage: 1,
                    nextPage: null,
                    pageLimit: 50,
                    pageSize: 1,
                    totalPages: 1,
                    totalSize: 1,
                },
                progress: {
                    value: 1,
                    maxValue: 1,
                },
                totalDistinctArticles: 1,
                totalLabeledArticles: 1,
            },
        }
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: recommendationData,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: new RegExp(recommendationData.data[0].message, 'i'),
            }),
        )

        expect(
            screen.getByText('Was this the best article to recommend?'),
        ).toBeInTheDocument()

        expect(screen.getByText('This article exists')).toBeInTheDocument()
    })

    it('should render article recommendation preview with feedback"', () => {
        const recommendationData = {
            data: [
                {
                    id: 1,
                    message: 'no feedback',
                    conversationId: '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                    shopName: 'test-store',
                    shopType: 'shopify',
                    locale: 'en-US',
                    accountId: 1,
                    helpCenterId: 3,
                    articleId: 10,
                    articleIdFeedback: 11,
                    isHelpful: true,
                    createdDatetime: '2023-12-03T16:26:52.897Z',
                    updatedDatetime: '2023-12-01T15:59:21.371Z',
                },
            ],
            meta: {
                pagination: {
                    currentPage: 1,
                    nextPage: null,
                    pageLimit: 50,
                    pageSize: 1,
                    totalPages: 1,
                    totalSize: 1,
                },

                progress: {
                    value: 1,
                    maxValue: 1,
                },
                totalDistinctArticles: 1,
                totalLabeledArticles: 1,
            },
        }
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: recommendationData,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useHelpCenterMock.mockReturnValue({
            data: {
                account_id: 1,
            },
            isInitialLoading: false,
            isError: false,
        } as ReturnType<typeof useHelpCenterMock>)

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: new RegExp(recommendationData.data[0].message, 'i'),
            }),
        )

        expect(
            screen.getByText('Which article should have been sent?'),
        ).toBeInTheDocument()

        expect(screen.getByText('This article exists')).toBeInTheDocument()
    })

    it('should render update recommendation feedback when confirmed', async () => {
        const recommendationData = {
            data: [
                {
                    id: 1,
                    message: 'no feedback',
                    conversationId: '7a53c1de-993c-4cc3-992c-3f973df46e2e',
                    shopName: 'test-store',
                    shopType: 'shopify',
                    locale: 'en-US',
                    accountId: 1,
                    helpCenterId: 3,
                    articleId: 10,
                    articleIdFeedback: null,
                    isHelpful: true,
                    createdDatetime: '2023-12-03T16:26:52.897Z',
                    updatedDatetime: '2023-12-01T15:59:21.371Z',
                },
            ],
            meta: {
                pagination: {
                    currentPage: 1,
                    nextPage: null,
                    pageLimit: 50,
                    pageSize: 1,
                    totalPages: 1,
                    totalSize: 1,
                },
                progress: {
                    value: 1,
                    maxValue: 1,
                },
                totalDistinctArticles: 1,
                totalLabeledArticles: 1,
            },
        }
        useArticleRecommendationPredictionsMock.mockImplementation(() => {
            return {
                data: recommendationData,
                isInitialLoading: false,
                isFetched: true,
            } as ReturnType<typeof useArticleRecommendationPredictionsMock>
        })
        ;(
            useSelfServiceConfiguration as jest.MockedFn<
                typeof useSelfServiceConfiguration
            >
        ).mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                ...selfServiceConfiguration1,
                articleRecommendationHelpCenterId: 1,
            },
            handleSelfServiceConfigurationUpdate: () => Promise.resolve(),
        })

        useApplicationsAutomationSettingsMock.mockReturnValue({
            applicationsAutomationSettings: {
                1: {
                    id: 1,
                    applicationId: 1,
                    articleRecommendation: { enabled: true },
                    orderManagement: { enabled: false },
                    workflows: { enabled: false },
                    createdDatetime: '2023-01-10T10:11:00.077382+00:00',
                    updatedDatetime: '2023-01-10T10:11:00.077382+00:00',
                },
            },
            isFetchPending: false,
            isUpdatePending: false,
            handleChatApplicationAutomationSettingsUpdate: jest.fn(),
        })

        useHelpCenterPublishedArticlesCountMock.mockReturnValue(1)

        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )

        fireEvent.click(
            screen.getByRole('button', {
                name: new RegExp(recommendationData.data[0].message, 'i'),
            }),
        )

        await waitFor(() => {
            screen.getByText('Keep recommendation')
        })

        fireEvent.click(await screen.findByText('Keep recommendation'))

        expect(screen.getByText('This article exists')).toBeInTheDocument()

        expect(updateMutateMock).toBeCalledWith(
            [
                { id: 1 },
                {
                    data: { articleIdFeedback: 10 },
                    meta: {
                        articleSlugFeedback:
                            helpCenterArticleData.translation.slug,
                        articleTitleFeedback:
                            helpCenterArticleData.translation.title,
                    },
                },
            ],
            { onError: expect.any(Function) },
        )
    })
    it('should not render the title and navigation when on automate settings', () => {
        useIsAutomateSettingsMock.mockReturnValue(true)
        render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <TrainMyAiView />
                    </Provider>
                </QueryClientProvider>
            </BrowserRouter>,
        )
        expect(
            screen.queryByText(ARTICLE_RECOMMENDATION),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Train')).not.toBeInTheDocument()
        expect(screen.queryByText('Configuration')).not.toBeInTheDocument()
    })
})
