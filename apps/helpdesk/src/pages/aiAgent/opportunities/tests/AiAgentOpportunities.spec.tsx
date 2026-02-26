import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { initialState as statsInitialState } from 'domains/reporting/state/stats/statsSlice'

import { AiAgentOpportunities } from '../AiAgentOpportunities'

jest.mock('domains/reporting/state/stats/selectors', () => {
    const actual = jest.requireActual(
        'domains/reporting/state/stats/statsSlice',
    )
    return {
        getStats: jest.fn(() => actual.initialState),
        getStatsMessagingAndAppIntegrations: jest.fn(() => []),
    }
})

jest.mock('domains/reporting/state/ui/stats/selectors', () => ({
    getCleanStatsFiltersWithTimezone: jest.fn(() => ({})),
}))

const mockStore = configureStore([])

const createMockStore = (initialState = {}) => {
    return mockStore({
        notifications: [],
        ui: {
            helpCenter: {
                viewLanguage: 'en-US',
            },
        },
        integrations: fromJS({
            data: [],
        }),
        stats: statsInitialState,
        ...initialState,
    })
}

const createMockQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0 },
            mutations: { retry: false },
        },
    })
}

interface TestWrapperProps {
    children: React.ReactNode
    store?: any
    queryClient?: QueryClient
    initialRoute?: string
}

const TestWrapper: React.FC<TestWrapperProps> = ({
    children,
    store = createMockStore(),
    queryClient = createMockQueryClient(),
    initialRoute = '/',
}) => {
    return (
        <MemoryRouter initialEntries={[initialRoute]}>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )
}

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('../hooks/useKnowledgeServiceOpportunities', () => ({
    useKnowledgeServiceOpportunities: jest.fn(() => ({
        opportunities: [],
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
        preloadNextPage: jest.fn(),
        totalCount: 0,
        refetch: jest.fn(),
    })),
}))

jest.mock('../hooks/useSelectedOpportunity', () => ({
    useSelectedOpportunity: jest.fn((opportunities) => ({
        selectedOpportunity: opportunities[0] || null,
        selectedOpportunityId: opportunities[0]?.id || null,
        setSelectedOpportunityId: jest.fn(),
        isLoading: false,
    })),
}))

jest.mock('../hooks/useOpportunityPageState', () => ({
    State: {
        LOADING: 'LOADING',
        HAS_OPPORTUNITIES: 'HAS_OPPORTUNITIES',
        ENABLED_NO_OPPORTUNITIES: 'ENABLED_NO_OPPORTUNITIES',
        DISABLED_NEEDS_ENABLE: 'DISABLED_NEEDS_ENABLE',
        DISABLED_NEEDS_SETUP: 'DISABLED_NEEDS_SETUP',
        RESTRICTED_NO_OPPORTUNITIES: 'RESTRICTED_NO_OPPORTUNITIES',
        OPPORTUNITY_NOT_FOUND: 'OPPORTUNITY_NOT_FOUND',
    },
    useOpportunityPageState: jest.fn(() => ({
        currentState: {
            state: 'ENABLED_NO_OPPORTUNITIES',
            isLoading: false,
            title: 'AI Agent is learning from your conversations',
            description:
                "As AI Agent handles more conversations, we'll surface opportunities to improve its accuracy and coverage. Check back soon!",
            media: '/assets/images/ai-agent/opportunities/learning.svg',
            primaryCta: null,
            showEmptyState: true,
        },
        stateConfig: {},
    })),
}))

jest.mock('pages/aiAgent/hooks/useShopIntegrationId', () => ({
    useShopIntegrationId: jest.fn(() => undefined),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: { guidanceHelpCenterId: 1 },
        isLoading: false,
    })),
}))

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterList: jest.fn(() => ({
        data: { data: { data: [] } },
        isLoading: false,
    })),
    useGetHelpCenterArticleList: jest.fn(() => ({
        data: {
            data: [
                {
                    id: 1,
                    template_key: 'template-1',
                    translation: {
                        title: 'Article 1',
                        content: 'Content 1',
                        locale: 'en-US',
                        visibility_status: 'PUBLIC',
                        updated_datetime: '2024-01-01T00:00:00Z',
                    },
                },
                {
                    id: 2,
                    template_key: 'template-2',
                    translation: {
                        title: 'Article 2',
                        content: 'Content 2',
                        locale: 'en-US',
                        visibility_status: 'PUBLIC',
                        updated_datetime: '2024-01-01T00:00:00Z',
                    },
                },
            ],
            meta: { item_count: 2, total_count: 2 },
        },
        isLoading: false,
    })),
}))

jest.mock('models/aiAgent/queries', () => ({
    useGetAIGeneratedGuidances: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
    aiGeneratedGuidanceKeys: {
        listWithStore: jest.fn(() => ['aiGuidances']),
    },
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(() => false),
}))

jest.mock('state/integrations/selectors', () => ({
    getStoreIntegrations: jest.fn(() => []),
    getIntegrationsByTypes: jest.fn(() => () => []),
}))

jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
    () => ({
        useHelpCenterAIArticlesLibrary: jest.fn(() => ({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        })),
    }),
)

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((selector) => {
        // Return empty integrations array for getStoreIntegrations selector
        if (selector && typeof selector === 'function') {
            return []
        }
        return 'en-US'
    }),
}))

jest.mock('state/ui/helpCenter', () => ({
    getViewLanguage: jest.fn(() => 'en-US'),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: jest.fn(() => ({
        default_locale: 'en-US',
        id: 1,
    })),
}))

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        createGuidanceArticle: jest.fn(),
        isGuidanceArticleUpdating: false,
    })),
}))

jest.mock('pages/settings/helpCenter/queries', () => ({
    useUpsertArticleTemplateReview: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
    })),
    aiArticleKeys: {
        list: jest.fn(() => ['aiArticles']),
    },
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

jest.mock('../../components/GuidanceForm/GuidanceForm', () => ({
    GuidanceForm: () => {
        return <div>GuidanceForm Mock</div>
    },
}))

jest.mock('../../hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            opportunities: '/ai-agent/opportunities',
            guidances: '/ai-agent/guidances',
        },
    })),
}))

describe('AiAgentOpportunities', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with correct structure and attributes', () => {
        const { container } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const layoutElement = document.querySelector('.layout')
        expect(layoutElement).toBeInTheDocument()

        const wrapper = container.querySelector('[data-ai-opportunities]')
        expect(wrapper).toBeInTheDocument()
    })

    it('should render OpportunitiesSidebar and OpportunitiesContent', () => {
        const { getByText, getAllByText, getByRole } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const opportunities = getAllByText('Opportunities')
        expect(opportunities).toHaveLength(1)

        expect(
            getByRole('heading', {
                name: 'AI Agent is learning from your conversations',
            }),
        ).toBeInTheDocument()
        expect(
            getByText(
                /As AI Agent handles more conversations, we'll surface opportunities/,
            ),
        ).toBeInTheDocument()
    })

    it('should handle loading state correctly', () => {
        const {
            useAiAgentStoreConfigurationContext,
        } = require('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
        useAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: null,
            isLoading: true,
        })

        render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const layoutElement = document.querySelector('.layout')
        expect(layoutElement).toBeInTheDocument()
    })

    it('should pass correct shop name from route params', () => {
        const { useParams } = require('react-router-dom')
        useParams.mockReturnValue({ shopName: 'custom-shop' })

        render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const layoutElement = document.querySelector('.layout')
        expect(layoutElement).toBeInTheDocument()
        expect(useParams).toHaveBeenCalled()
    })

    it('should render correctly with or without articles', () => {
        const {
            useHelpCenterAIArticlesLibrary,
        } = require('pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary')
        useHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: [],
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        })

        const { container: containerEmpty } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        expect(
            containerEmpty.querySelector('[data-ai-opportunities]'),
        ).toBeInTheDocument()

        const mockArticles = [
            {
                id: '1',
                title: 'Test Article 1',
                content: 'Content 1',
                html_content: '<p>Content 1</p>',
                article_key: 'article-1',
                article_template_key: 'template-1',
                key: 'ai_1',
            },
        ]

        useHelpCenterAIArticlesLibrary.mockReturnValue({
            articles: mockArticles,
            isLoading: false,
            markArticleAsReviewed: jest.fn(),
        })

        const { container: containerWithArticles } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        expect(
            containerWithArticles.querySelector('[data-ai-opportunities]'),
        ).toBeInTheDocument()
    })

    it('should handle different configurations and locales', () => {
        const {
            useAiAgentStoreConfigurationContext,
        } = require('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
        const {
            useAiAgentHelpCenter,
        } = require('pages/aiAgent/hooks/useAiAgentHelpCenter')
        useAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 42,
                helpCenterId: 99,
            },
            isLoading: false,
        })

        useAiAgentHelpCenter.mockReturnValue({
            default_locale: 'fr-FR',
            id: 42,
        })

        const mockStore = createMockStore({
            notifications: [],
            ui: {
                helpCenter: {
                    viewLanguage: 'fr-FR',
                },
            },
            integrations: {
                data: [],
            },
        })

        const { container } = render(
            <TestWrapper store={mockStore}>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        expect(container.querySelector('.layout')).toBeInTheDocument()
    })
})
