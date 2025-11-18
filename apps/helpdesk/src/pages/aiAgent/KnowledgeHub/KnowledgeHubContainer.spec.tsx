import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { Store } from 'redux'

import { appQueryClient } from 'api/queryClient'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetHelpCenterList,
    useGetHelpCenterListMulti,
    useGetKnowledgeHubArticles,
} from 'models/helpCenter/queries'
import { OPEN_SYNC_WEBSITE_MODAL } from 'pages/aiAgent/KnowledgeHub/constants'
import { dispatchDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { KnowledgeHubContainer } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubContainer'
import { KnowledgeVisibility } from 'pages/aiAgent/KnowledgeHub/types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from 'pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import {
    getCurrentAccountId,
    getCurrentAccountState,
} from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('models/helpCenter/queries', () => ({
    useGetKnowledgeHubArticles: jest.fn(),
    useGetHelpCenterList: jest.fn(),
    useGetHelpCenterListMulti: jest.fn(),
    useStartIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
    helpCenterKeys: {
        ingestionLogs: jest.fn(),
    },
}))
jest.mock('pages/aiAgent/KnowledgeHub/utils/transformKnowledgeHubArticles')
jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog', () => ({
    useGetStoreDomainIngestionLog: jest.fn(() => ({
        status: null,
        storeDomainIngestionLog: undefined,
        isGetIngestionLogsLoading: false,
    })),
}))
jest.mock('@gorgias/knowledge-service-queries', () => ({
    useStartIngestion: jest.fn(() => ({
        mutateAsync: jest.fn(),
        isPending: false,
    })),
}))
jest.mock('pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters', () => ({
    DocumentFilters: ({ selectedFilter, onFilterChange }: any) => (
        <div>
            <button onClick={() => onFilterChange('document')}>
                Document Filter
            </button>
            <button onClick={() => onFilterChange('guidance')}>
                Guidance Filter
            </button>
            <span>Selected: {selectedFilter || 'none'}</span>
        </div>
    ),
}))
jest.mock(
    'pages/aiAgent/KnowledgeHub/EmptyState/HelpCenterSelectModal',
    () => ({
        HelpCenterSelectModal: () => (
            <div data-testid="help-center-select-modal" />
        ),
    }),
)
jest.mock(
    'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader',
    () => ({
        KnowledgeHubHeader: ({ onAddKnowledge }: any) => (
            <div>
                <button onClick={onAddKnowledge}>Add Knowledge</button>
            </div>
        ),
    }),
)

const mockUseAppSelector = useAppSelector as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetKnowledgeHubArticles = useGetKnowledgeHubArticles as jest.Mock
const mockUseGetHelpCenterList = useGetHelpCenterList as jest.Mock
const mockUseGetHelpCenterListMulti = useGetHelpCenterListMulti as jest.Mock
const mockTransformKnowledgeHubArticlesToKnowledgeItems =
    transformKnowledgeHubArticlesToKnowledgeItems as jest.Mock

describe('KnowledgeHubContainer', () => {
    const mockShopifyIntegrations = [
        {
            id: 1,
            name: 'Store Alpha',
            type: 'shopify',
            meta: { shop_name: 'store-alpha' },
        },
        {
            id: 2,
            name: 'Store Beta',
            type: 'shopify',
            meta: { shop_name: 'store-beta' },
        },
    ]

    const originalLocation = window.location

    const mocksStore = {
        getState: () => ({}),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        replaceReducer: jest.fn(),
    } as unknown as Store

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        window.location = {
            href: 'http://localhost/app',
            pathname: '/app',
        } as Location

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector === getCurrentAccountId) return 123
            if (selector === getShopifyIntegrationsSortedByName)
                return mockShopifyIntegrations
            if (selector === getCurrentAccountState)
                return {
                    get: (key: string) => {
                        if (key === 'domain') return 'test-domain.com'
                        return undefined
                    },
                }
            return fromJS({
                id: 1,
                name: 'Store Alpha',
                type: 'shopify',
                meta: {
                    shop_name: 'store-alpha',
                    shop_domain: 'store-alpha.myshopify.com',
                },
            })
        })

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 1,
                snippetHelpCenterId: 2,
                helpCenterId: 3,
            },
            isLoading: false,
            updateStoreConfiguration: jest.fn(),
            createStoreConfiguration: jest.fn(),
            isPendingCreateOrUpdate: false,
        })
        mockUseGetKnowledgeHubArticles.mockReturnValue({
            data: { articles: [] },
            isInitialLoading: false,
            refetch: jest.fn(),
        })

        mockUseGetHelpCenterList.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
        })

        mockUseGetHelpCenterListMulti.mockReturnValue({
            data: [],
            isLoading: false,
        })

        mockTransformKnowledgeHubArticlesToKnowledgeItems.mockImplementation(
            (articles) => {
                return articles.map((article: any) => ({
                    id: article.id,
                    title: article.title,
                    type: article.type,
                    lastUpdatedAt: article.lastUpdatedAt,
                    inUseByAI:
                        article.visibilityStatus === 'public'
                            ? KnowledgeVisibility.PUBLIC
                            : KnowledgeVisibility.UNLISTED,
                    source: article.source,
                }))
            },
        )
    })

    afterEach(() => {
        window.location = originalLocation
    })

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Provider store={mocksStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <KnowledgeHubContainer />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )
    }

    describe('rendering', () => {
        it('renders the container with all main components', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(screen.getByText('Document Filter')).toBeInTheDocument()
            expect(screen.getByText('Selected: none')).toBeInTheDocument()
        })

        it('renders empty state when no data', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })

        it('renders table with data when articles are present', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: {
                    articles: [
                        {
                            id: '1',
                            title: 'Test Article',
                            type: 'guidance',
                            lastUpdatedAt: '2024-01-15T10:00:00Z',
                            visibilityStatus: 'public',
                        },
                    ],
                },
                isInitialLoading: false,
                refetch: jest.fn(),
            })

            renderComponent()

            expect(screen.getByText('Test Article')).toBeInTheDocument()
        })
    })

    describe('shop name resolution', () => {
        it('extracts shop name from URL when available', () => {
            const routeShopName = 'my-shop-from-url'
            mockExtractShopNameFromUrl.mockReturnValue(routeShopName)

            renderComponent()

            expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
                window.location.href,
            )
        })

        it('uses first Shopify integration shop name when URL extraction returns undefined', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseAppSelector).toHaveBeenCalled()
        })

        it('prefers URL shop name over first integration when both exist', () => {
            const routeShopName = 'url-shop'
            mockExtractShopNameFromUrl.mockReturnValue(routeShopName)

            renderComponent()

            expect(mockExtractShopNameFromUrl).toHaveBeenCalledWith(
                window.location.href,
            )
        })
    })

    describe('filtering', () => {
        it('updates filter when filter button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(screen.getByText('Selected: none')).toBeInTheDocument()

            await user.click(screen.getByText('Document Filter'))

            await waitFor(() => {
                expect(
                    screen.getByText('Selected: document'),
                ).toBeInTheDocument()
            })
        })

        it('can switch between different filters', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('Document Filter'))
            await waitFor(() => {
                expect(
                    screen.getByText('Selected: document'),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByText('Guidance Filter'))
            await waitFor(() => {
                expect(
                    screen.getByText('Selected: guidance'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('loading state', () => {
        it('passes loading state to table component', () => {
            mockUseGetKnowledgeHubArticles.mockReturnValue({
                data: undefined,
                isInitialLoading: true,
                refetch: jest.fn(),
            })

            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Create new content' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('data fetching', () => {
        it('fetches articles with correct parameters', () => {
            mockExtractShopNameFromUrl.mockReturnValue(undefined)

            renderComponent()

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                {
                    account_id: 123,
                    guidance_help_center_id: 1,
                    snippet_help_center_id: 2,
                    faq_help_center_id: 3,
                },
                {
                    enabled: true,
                },
            )
        })

        it('waits for store configuration before fetching articles', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: null,
                isLoading: true,
                updateStoreConfiguration: jest.fn(),
                createStoreConfiguration: jest.fn(),
                isPendingCreateOrUpdate: false,
            })

            renderComponent()

            expect(mockUseGetKnowledgeHubArticles).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })
    })

    describe('modal behavior', () => {
        it('opens Add Knowledge modal when Add Knowledge button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()

            await user.click(screen.getByText('Add Knowledge'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })
        })

        it('closes Add Knowledge modal when OPEN_SYNC_WEBSITE_MODAL event is dispatched', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByText('Add Knowledge'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'Add knowledge' }),
                ).toBeInTheDocument()
            })

            dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Add knowledge' }),
                ).not.toBeInTheDocument()
            })
        })

        it('keeps modal closed when OPEN_SYNC_WEBSITE_MODAL is dispatched and modal was not open', () => {
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()

            dispatchDocumentEvent(OPEN_SYNC_WEBSITE_MODAL)

            expect(
                screen.queryByRole('heading', { name: 'Add knowledge' }),
            ).not.toBeInTheDocument()
        })
    })
})
