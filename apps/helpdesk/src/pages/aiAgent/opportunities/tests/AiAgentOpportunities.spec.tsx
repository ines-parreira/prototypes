import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { AiAgentOpportunities } from '../AiAgentOpportunities'

const mockStore = configureStore([])

const createMockStore = (initialState = {}) => {
    return mockStore({
        notifications: [],
        ui: {
            helpCenter: {
                viewLanguage: 'en-US',
            },
        },
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
        data: { meta: { item_count: 5 } },
        isLoading: false,
    })),
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
    default: jest.fn(() => 'en-US'),
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
        expect(wrapper).toHaveAttribute('data-overflow', 'visible')
    })

    it('should render OpportunitiesSidebar and OpportunitiesContent', () => {
        const { getByText, getAllByText } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const opportunities = getAllByText('Opportunities')
        expect(opportunities).toHaveLength(2)
        expect(getByText('0 items')).toBeInTheDocument()
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
                article_key: 'article-1',
                article_template_key: 'template-1',
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
        })

        const { container } = render(
            <TestWrapper store={mockStore}>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        expect(container.querySelector('.layout')).toBeInTheDocument()
    })
})
