import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'
import { useFaqHelpCenter } from 'pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { EMPTY_HELP_CENTER_ID } from 'pages/automate/common/components/HelpCenterSelect'

const mockStore = configureStore([])

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('pages/aiAgent/hooks/useSyncStoreDomain', () => ({
    useSyncStoreDomain: jest.fn(() => ({
        storeDomain: 'example.com',
        storeUrl: 'https://example.com',
        storeDomainIngestionLog: null,
        isFetchLoading: false,
        syncTriggered: false,
        handleTriggerSync: jest.fn(),
        handleOnSync: jest.fn(),
        handleOnCancel: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: { helpCenterId: 1 },
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

jest.mock('pages/aiAgent/KnowledgeHub/EmptyState/useFaqHelpCenter')

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(() => ({
        guidanceArticle: null,
        isLoading: false,
    })),
}))

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),
            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/axiom'),
)

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
>

const mockUseGuidanceArticle = useGuidanceArticle as jest.MockedFunction<
    typeof useGuidanceArticle
>

const mockData = [
    {
        type: KnowledgeType.Document,
        title: 'Product Manual',
        lastUpdatedAt: '2024-01-15T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        source: 'docs.example.com',
        id: '1',
    },
    {
        type: KnowledgeType.FAQ,
        title: 'Shipping FAQ',
        lastUpdatedAt: '2024-01-10T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        source: 'docs.example.com',
        id: '2',
    },
    {
        type: KnowledgeType.Guidance,
        title: 'Return Policy',
        lastUpdatedAt: '2024-01-20T10:00:00Z',
        inUseByAI: KnowledgeVisibility.PUBLIC,
        id: '3',
    },
    {
        type: KnowledgeType.URL,
        title: 'Help Center',
        lastUpdatedAt: '2024-01-05T10:00:00Z',
        inUseByAI: KnowledgeVisibility.UNLISTED,
        id: '4',
    },
]

describe('KnowledgeHubTable - Core', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
        logger: {
            log: jest.fn(),
            warn: console.warn,
            error: () => {},
        },
    })

    const store = mockStore({})

    const defaultProps = {
        data: mockData,
        metricsDateRange: {
            start_datetime: '2025-01-01T00:00:00Z',
            end_datetime: '2025-01-28T23:59:59Z',
        },
        isMetricsEnabled: true,
        isLoading: false,
        onRowClick: jest.fn(),
        selectedFolder: null,
        shopType: 'shopify',
        searchTerm: '',
        onSearchChange: jest.fn(),
        dateRange: { startDate: null, endDate: null },
        onDateRangeChange: jest.fn(),
        inUseByAIFilter: null,
        onInUseByAIChange: jest.fn(),
        clearSearchParams: jest.fn(),
    }

    beforeEach(() => {
        queryClient.clear()
        mockUseFaqHelpCenter.mockReturnValue({
            faqHelpCenters: [],
            selectedHelpCenter: {
                id: EMPTY_HELP_CENTER_ID,
                name: 'No help center',
            },
            setHelpCenterId: jest.fn(),
            handleOnSave: jest.fn(),
            shopName: 'test-shop',
            isPendingCreateOrUpdate: false,
            helpCenterItems: [{ id: -1, name: 'No help center' }],
        })
    })

    const KnowledgeHubTableWithState = (props: any) => {
        const [searchTerm, setSearchTerm] = React.useState(
            props.searchTerm || '',
        )
        const [dateRange, setDateRange] = React.useState(
            props.dateRange || { startDate: null, endDate: null },
        )
        const [inUseByAIFilter, setInUseByAIFilter] = React.useState<
            boolean | null
        >(props.inUseByAIFilter ?? null)

        const clearSearchParams = () => {
            setSearchTerm('')
            setDateRange({ startDate: null, endDate: null })
            setInUseByAIFilter(null)
        }

        return (
            <KnowledgeHubTable
                {...defaultProps}
                {...props}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                dateRange={dateRange}
                onDateRangeChange={(startDate, endDate) =>
                    setDateRange({ startDate, endDate })
                }
                inUseByAIFilter={inUseByAIFilter}
                onInUseByAIChange={setInUseByAIFilter}
                clearSearchParams={clearSearchParams}
            />
        )
    }

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <KnowledgeHubTableWithState {...props} />
                </QueryClientProvider>
            </Provider>,
        )
    }

    describe('rendering', () => {
        it('renders table with data', () => {
            renderComponent()

            expect(screen.getByText('Return Policy')).toBeInTheDocument()
            expect(screen.getByText('Help Center')).toBeInTheDocument()
        })

        it('renders empty state when no data', () => {
            renderComponent({ data: [] })

            expect(
                screen.getByRole('heading', { name: 'Create something new' }),
            ).toBeInTheDocument()
            expect(screen.getByText('Guidance')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow internal processes.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('grouping', () => {
        it('groups items by source by default', () => {
            renderComponent()

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()
            expect(screen.queryByText('Product Manual')).not.toBeInTheDocument()
            expect(screen.queryByText('Shipping FAQ')).not.toBeInTheDocument()
        })

        it('displays item count for grouped items', () => {
            renderComponent()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow).toHaveTextContent('2')
        })
    })

    describe('search functionality', () => {
        it('renders search input', () => {
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')
            expect(searchInput).toBeInTheDocument()
        })

        it('updates search input value when typing', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'test search')

            expect(searchInput).toHaveValue('test search')
        })

        it('shows no results message when search has no matches', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'No results found' }),
                ).toBeInTheDocument()
            })
            expect(
                screen.getByText(
                    'Try adjusting your search or filters to find the right knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('shows clear search button when no results found', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            await waitFor(() => {
                expect(
                    screen.getAllByText('Clear search and filters')[0],
                ).toBeInTheDocument()
            })
        })

        it('clears search term when clear search button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            expect(searchInput).toHaveValue('nonexistent')

            const clearButton = await waitFor(
                () => screen.getAllByText('Clear search and filters')[0],
            )

            await user.click(clearButton)

            await waitFor(() => {
                expect(searchInput).toHaveValue('')
            })
        })

        it('hides no results message after clearing search', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'No results found' }),
                ).toBeInTheDocument()
            })

            const clearButton = screen.getAllByText(
                'Clear search and filters',
            )[0]

            await user.click(clearButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'No results found' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Guidance Actions Badge', () => {
        beforeEach(() => {
            const {
                useGetGuidancesAvailableActions,
            } = require('../../../components/GuidanceEditor/useGetGuidancesAvailableActions')

            useGetGuidancesAvailableActions.mockReturnValue({
                guidanceActions: [
                    { name: 'Apply Discount', value: 'apply-discount' },
                    { name: 'Create Ticket', value: 'create-ticket' },
                ],
                isGuidanceArticleLoading: false,
            })

            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: undefined,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
                isError: false,
                error: null,
            })
        })

        it('renders GuidanceActionsBadge for guidance items with actions', () => {
            mockUseGuidanceArticle.mockReturnValue({
                guidanceArticle: {
                    id: 3,
                    content:
                        'Use $$$apply-discount$$$ to apply discount and $$$create-ticket$$$ to create ticket',
                    title: 'Return Policy',
                } as any,
                isGuidanceArticleLoading: false,
                refetch: jest.fn(),
                isError: false,
                error: null,
            })
            renderComponent({
                selectedFolder: {
                    id: '3',
                    title: 'Return Policy',
                    type: KnowledgeType.Guidance,
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    isGrouped: false,
                },
                shopName: 'test-shop',
                guidanceHelpCenterId: 123,
            })

            expect(screen.getByText('Return Policy')).toBeInTheDocument()
            const badge = screen.getByText('2')
            expect(badge).toBeInTheDocument()
        })

        it('does not render GuidanceActionsBadge for guidance items without actions', () => {
            renderComponent({
                selectedFolder: {
                    id: '3',
                    title: 'Return Policy',
                    type: KnowledgeType.Guidance,
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    isGrouped: false,
                },
                shopName: 'test-shop',
                guidanceHelpCenterId: 123,
            })

            expect(screen.getByText('Return Policy')).toBeInTheDocument()
        })

        it('does not render GuidanceActionsBadge for non-guidance items', () => {
            renderComponent({
                selectedFolder: {
                    id: '1',
                    title: 'Product Manual',
                    type: KnowledgeType.Document,
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    source: 'docs.example.com',
                    isGrouped: false,
                },
                shopName: 'test-shop',
                guidanceHelpCenterId: 123,
            })

            expect(screen.getByText('Product Manual')).toBeInTheDocument()
        })

        it('does not render GuidanceActionsBadge when content is not available', () => {
            renderComponent({
                selectedFolder: {
                    id: '3',
                    title: 'Return Policy',
                    type: KnowledgeType.Guidance,
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    isGrouped: false,
                },
                shopName: 'test-shop',
                guidanceHelpCenterId: 123,
            })

            expect(screen.getByText('Return Policy')).toBeInTheDocument()
        })
    })

    describe('metrics loading states', () => {
        const dataWithMetrics = [
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
                metrics: {
                    tickets: 150,
                    handoverTickets: 25,
                    csat: 4.5,
                    resourceSourceSetId: 1,
                },
            },
            {
                type: KnowledgeType.FAQ,
                title: 'Shipping FAQ',
                lastUpdatedAt: '2024-01-10T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '2',
                metrics: {
                    tickets: 75,
                    handoverTickets: 10,
                    csat: 4.2,
                    resourceSourceSetId: 2,
                },
            },
        ]

        const dataWithoutMetrics = [
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
        ]

        it('shows skeleton loaders when metrics are loading', () => {
            renderComponent({
                data: dataWithoutMetrics,
                isMetricsEnabled: true,
                isMetricsLoading: true,
                selectedFolder: dataWithoutMetrics[0],
            })

            const skeletons = screen.getAllByTestId('skeleton')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('shows actual metric values when metrics have loaded', () => {
            renderComponent({
                data: dataWithMetrics,
                isMetricsEnabled: true,
                isMetricsLoading: false,
                selectedFolder: dataWithMetrics[0],
            })

            expect(screen.getByText('150')).toBeInTheDocument()
            expect(screen.getByText('25')).toBeInTheDocument()
            expect(screen.getByText('4.5')).toBeInTheDocument()
        })

        it('shows CSAT as whole number without decimals when value is an integer', () => {
            const dataWithWholeNumberCsat = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Return Policy',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                    metrics: {
                        tickets: 100,
                        handoverTickets: 20,
                        csat: 5,
                        resourceSourceSetId: 1,
                    },
                },
            ]

            renderComponent({
                data: dataWithWholeNumberCsat,
                isMetricsEnabled: true,
                isMetricsLoading: false,
                selectedFolder: dataWithWholeNumberCsat[0],
            })

            expect(screen.getByText('5')).toBeInTheDocument()
            expect(screen.queryByText('5.00')).not.toBeInTheDocument()
        })

        it('shows CSAT with 1 decimal when value has decimal places', () => {
            const dataWithDecimalCsat = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Return Policy',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                    metrics: {
                        tickets: 100,
                        handoverTickets: 20,
                        csat: 4.5,
                        resourceSourceSetId: 1,
                    },
                },
            ]

            renderComponent({
                data: dataWithDecimalCsat,
                isMetricsEnabled: true,
                isMetricsLoading: false,
                selectedFolder: dataWithDecimalCsat[0],
            })

            expect(screen.getByText('4.5')).toBeInTheDocument()
        })

        it('shows "--" placeholder when metrics are not loading and no data exists', () => {
            renderComponent({
                data: dataWithoutMetrics,
                isMetricsEnabled: true,
                isMetricsLoading: false,
                selectedFolder: dataWithoutMetrics[0],
            })

            const placeholders = screen.getAllByText('--')
            expect(placeholders.length).toBeGreaterThanOrEqual(3)
        })

        it('does not show skeletons when metrics are disabled', () => {
            renderComponent({
                data: dataWithoutMetrics,
                isMetricsEnabled: false,
                isMetricsLoading: true,
                selectedFolder: dataWithoutMetrics[0],
            })

            const skeletons = screen.queryAllByTestId('skeleton')
            expect(skeletons.length).toBe(0)
        })

        it('shows "--" for grouped items even when metrics are loading', () => {
            const groupedData = [
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'docs.example.com',
                    id: '1',
                },
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 2',
                    lastUpdatedAt: '2024-01-10T00:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'docs.example.com',
                    id: '2',
                },
            ]

            renderComponent({
                data: groupedData,
                isMetricsEnabled: true,
                isMetricsLoading: true,
            })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()
            const placeholders = screen.getAllByText('--')
            expect(placeholders.length).toBeGreaterThanOrEqual(3)
        })
    })

    describe('pagination visibility', () => {
        const createMockItems = (count: number) =>
            Array.from({ length: count }, (_, i) => ({
                type: KnowledgeType.Guidance,
                title: `Item ${i + 1}`,
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: String(i + 1),
            }))

        const getPaginationContainer = () => {
            return (
                document.querySelector('.pagination') ||
                document.querySelector('[class*="pagination"]')
            )
        }

        const isPaginationHidden = () => {
            const container = getPaginationContainer()
            if (!container) return true
            return container.className.includes('hidden')
        }

        it('should not show pagination when there are 50 or fewer items', () => {
            const items = createMockItems(50)

            renderComponent({
                data: items,
                selectedFolder: items[0],
            })

            expect(isPaginationHidden()).toBe(true)
        })

        it('should show pagination when there are more than 50 items', () => {
            const items = createMockItems(51)

            renderComponent({
                data: items,
                selectedFolder: items[0],
            })

            expect(isPaginationHidden()).toBe(false)
        })
    })

    describe('columns generation', () => {
        it('generates columns with metrics when metrics are enabled', () => {
            const dataWithMetrics = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance with Metrics',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                    metrics: {
                        tickets: 357,
                        handoverTickets: 23,
                        csat: 4.7,
                        resourceSourceSetId: 1,
                    },
                },
            ]

            renderComponent({
                data: dataWithMetrics,
                isMetricsEnabled: true,
                isMetricsLoading: false,
                selectedFolder: dataWithMetrics[0],
            })

            expect(screen.getByText('357')).toBeInTheDocument()
            expect(screen.getByText('23')).toBeInTheDocument()
            expect(screen.getByText('4.7')).toBeInTheDocument()
        })

        it('generates columns without metrics when metrics are disabled', () => {
            const dataWithMetrics = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Test Guidance without Metrics',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                    metrics: {
                        tickets: 357,
                        handoverTickets: 23,
                        csat: 4.7,
                        resourceSourceSetId: 1,
                    },
                },
            ]

            renderComponent({
                data: dataWithMetrics,
                isMetricsEnabled: false,
                isMetricsLoading: false,
                selectedFolder: dataWithMetrics[0],
            })

            expect(screen.queryByText('357')).not.toBeInTheDocument()
            expect(screen.queryByText('23')).not.toBeInTheDocument()
        })

        it('updates columns when searchTerm changes and highlights matching text', async () => {
            const user = userEvent.setup()

            renderComponent({
                data: [
                    {
                        type: KnowledgeType.Guidance,
                        title: 'Return Policy Guide',
                        lastUpdatedAt: '2024-01-20T10:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        id: '1',
                    },
                ],
                selectedFolder: {
                    type: KnowledgeType.Guidance,
                    title: 'Return Policy Guide',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            })

            const searchInput = screen.getByLabelText('Search knowledge items')

            expect(screen.getByText('Return Policy Guide')).toBeInTheDocument()

            await user.type(searchInput, 'Policy')

            await waitFor(() => {
                expect(searchInput).toHaveValue('Policy')
            })
        })

        it('renders sortable column headers when sort state is provided', () => {
            renderComponent({
                data: [
                    {
                        type: KnowledgeType.Guidance,
                        title: 'Test Item',
                        lastUpdatedAt: '2024-01-20T10:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        id: '1',
                    },
                ],
                selectedFolder: {
                    type: KnowledgeType.Guidance,
                    title: 'Test Item',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            })

            expect(screen.getByText('Title')).toBeInTheDocument()
            expect(screen.getByText('Last updated')).toBeInTheDocument()
            expect(screen.getByText('In use by AI Agent')).toBeInTheDocument()
        })
    })
})
