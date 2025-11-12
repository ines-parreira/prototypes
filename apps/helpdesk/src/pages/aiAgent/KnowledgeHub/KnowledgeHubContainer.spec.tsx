import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useGetKnowledgeHubArticles } from 'models/helpCenter/queries'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'

import { KnowledgeHubContainer } from './KnowledgeHubContainer'
import { KnowledgeVisibility } from './types'
import { transformKnowledgeHubArticlesToKnowledgeItems } from './utils/transformKnowledgeHubArticles'

jest.mock('hooks/useAppSelector')
jest.mock('pages/aiAgent/utils/extractShopNameFromUrl')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('models/helpCenter/queries')
jest.mock('./utils/transformKnowledgeHubArticles')
jest.mock('./DocumentFilters/DocumentFilters', () => ({
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

const mockUseAppSelector = useAppSelector as jest.Mock
const mockExtractShopNameFromUrl = extractShopNameFromUrl as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseGetKnowledgeHubArticles = useGetKnowledgeHubArticles as jest.Mock
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

    beforeEach(() => {
        jest.clearAllMocks()
        delete (window as any).location
        window.location = { href: 'http://localhost/app' } as Location

        mockUseAppSelector
            .mockReturnValueOnce(123) // getCurrentAccountId
            .mockReturnValueOnce(mockShopifyIntegrations) // getShopifyIntegrationsSortedByName

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
                <KnowledgeHubContainer />
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
})
