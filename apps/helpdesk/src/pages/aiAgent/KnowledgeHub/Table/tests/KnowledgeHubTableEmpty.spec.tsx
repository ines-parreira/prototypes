import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

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

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
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

describe('KnowledgeHubTable - Empty States', () => {
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

    describe('EmptyStateAllContent', () => {
        it('renders when no data and no filter is selected', () => {
            renderComponent({ data: [], selectedTypeFilter: null })

            expect(
                screen.getByRole('heading', {
                    name: 'Create something new',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('heading', {
                    name: 'Bring in existing content',
                }),
            ).toBeInTheDocument()
        })

        it('displays all knowledge type cards in create section', () => {
            renderComponent({ data: [], selectedTypeFilter: null })

            expect(screen.getByText('Guidance')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow internal processes.',
                ),
            ).toBeInTheDocument()

            expect(screen.getByText('Help Center articles')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Let AI Agent use published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('displays all knowledge type cards in sync section', () => {
            renderComponent({ data: [], selectedTypeFilter: null })

            expect(screen.getByText('Store website')).toBeInTheDocument()
            expect(
                screen.getByText('Sync your site content'),
            ).toBeInTheDocument()

            expect(screen.getByText('URLs')).toBeInTheDocument()
            expect(
                screen.getByText('Sync single-page URLs'),
            ).toBeInTheDocument()

            expect(screen.getByText('Documents')).toBeInTheDocument()
            expect(
                screen.getByText('Upload external files'),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateGuidance', () => {
        it('renders when Guidance filter is selected with no data', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.Guidance,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow end-to-end processes with internal-facing Guidance.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create Guidance' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateFAQ', () => {
        it('renders with "Connect Help Center" when helpCenterId is not provided', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.FAQ,
                faqHelpCenterId: null,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Let AI Agent use your published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Connect Help Center' }),
            ).toBeInTheDocument()
        })

        it('renders with "Create Help Center article" when helpCenterId is provided with no articles', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.FAQ,
                faqHelpCenterId: 123,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Let AI Agent use your published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: 'Create Help Center article',
                }),
            ).toBeInTheDocument()
        })

        it('shows different description when helpCenterId exists but articles are available', () => {
            const faqData = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'docs.example.com',
                    id: '1',
                },
            ]

            renderComponent({
                data: faqData,
                selectedTypeFilter: KnowledgeType.Document,
                faqHelpCenterId: 123,
            })

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDomain', () => {
        it('renders when Domain filter is selected with no data', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.Domain,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Sync your store website',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Use your website.s content and product pages as knowledge for AI Agent/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Sync/ }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateURL', () => {
        it('renders when URL filter is selected with no data', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.URL,
            })

            expect(
                screen.getByRole('heading', { name: 'Add URLs' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Add links to public pages AI Agent can learn from like blog posts or external documentation.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Add URL' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDocument', () => {
        it('renders when Document filter is selected with no data', () => {
            renderComponent({
                data: [],
                selectedTypeFilter: KnowledgeType.Document,
            })

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Upload external documents such as policies or product manuals to help your AI Agent provide more accurate answers.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Upload Document' }),
            ).toBeInTheDocument()
        })
    })

    describe('empty state visibility', () => {
        it('does not render empty state when loading', () => {
            renderComponent({ data: [], isLoading: true })

            expect(
                screen.queryByRole('heading', {
                    name: 'Create something new',
                }),
            ).not.toBeInTheDocument()
        })

        it('renders empty state when data becomes empty after loading', () => {
            const { rerender } = renderComponent({
                data: mockData,
                isLoading: true,
            })

            expect(
                screen.queryByRole('heading', {
                    name: 'Create something new',
                }),
            ).not.toBeInTheDocument()

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            data={[]}
                            isLoading={false}
                        />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Create something new',
                }),
            ).toBeInTheDocument()
        })
    })

    describe('no results state', () => {
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
})
