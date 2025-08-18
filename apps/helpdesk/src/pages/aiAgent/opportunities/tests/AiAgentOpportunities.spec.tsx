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
    GuidanceForm: ({ onValuesChange, initialFields }: any) => {
        React.useEffect(() => {
            if (onValuesChange && initialFields) {
                onValuesChange(initialFields)
            }
        }, [onValuesChange, initialFields])
        return <div>GuidanceForm Mock</div>
    },
}))

describe('AiAgentOpportunities', () => {
    it('should render OpportunitiesLayout', () => {
        render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const layoutElement = document.querySelector('.layout')
        expect(layoutElement).toBeInTheDocument()
    })

    it('should render with correct data attributes', () => {
        const { container } = render(
            <TestWrapper>
                <AiAgentOpportunities />
            </TestWrapper>,
        )

        const wrapper = container.querySelector('[data-ai-opportunities]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper).toHaveAttribute('data-overflow', 'visible')
    })
})
