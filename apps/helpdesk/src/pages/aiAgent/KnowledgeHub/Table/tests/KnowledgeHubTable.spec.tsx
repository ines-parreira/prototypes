import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useGuidanceArticle } from 'pages/aiAgent/hooks/useGuidanceArticle'

import { EMPTY_HELP_CENTER_ID } from '../../../../automate/common/components/HelpCenterSelect'
import { useFaqHelpCenter } from '../../EmptyState/useFaqHelpCenter'
import { KnowledgeType, KnowledgeVisibility } from '../../types'
import { KnowledgeHubTable } from '../KnowledgeHubTable'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('../../../hooks/useSyncStoreDomain', () => ({
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

jest.mock('../../../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(() => ({
        storeConfiguration: { helpCenterId: 1 },
        isLoading: false,
    })),
}))

jest.mock('../../EmptyState/utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
}))

jest.mock('../../EmptyState/useFaqHelpCenter')

jest.mock(
    '../../../components/GuidanceEditor/useGetGuidancesAvailableActions',
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

describe('KnowledgeHubTable', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
        logger: {
            log: console.log,
            warn: console.warn,
            error: () => {},
        },
    })

    const defaultProps = {
        data: mockData,
        isLoading: false,
        onRowClick: jest.fn(),
        selectedFolder: null,
        shopType: 'shopify',
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

    const renderComponent = (props = {}) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <KnowledgeHubTable {...defaultProps} {...props} />
            </QueryClientProvider>,
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
                screen.getByRole('heading', { name: 'Create new content' }),
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
                expect(screen.getByText('Clear search')).toBeInTheDocument()
            })
        })

        it('clears search term when clear search button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            expect(searchInput).toHaveValue('nonexistent')

            const clearButton = await waitFor(() =>
                screen.getByText('Clear search'),
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

            const clearButton = screen.getByText('Clear search')

            await user.click(clearButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'No results found' }),
                ).not.toBeInTheDocument()
            })
        })

        it('shows data after clearing search', async () => {
            const user = userEvent.setup()
            renderComponent()

            const searchInput = screen.getByLabelText('Search knowledge items')

            await user.type(searchInput, 'nonexistent')

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: 'No results found' }),
                ).toBeInTheDocument()
            })

            const clearButton = screen.getByText('Clear search')

            await user.click(clearButton)

            await waitFor(() => {
                expect(screen.getByText('docs.example.com')).toBeInTheDocument()
            })
        })
    })

    describe('filter button', () => {
        it('renders Add Filter button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /add filter/i }),
            ).toBeInTheDocument()
        })
    })

    describe('row selection', () => {
        it('disables selection for grouped rows', () => {
            renderComponent()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            const checkbox = groupRow?.querySelector('input[type="checkbox"]')

            expect(checkbox).toBeDisabled()
        })
    })

    describe('type filtering', () => {
        it('filters data by selected type filter and shows grouped row', () => {
            renderComponent({ selectedTypeFilter: KnowledgeType.FAQ })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow).toHaveTextContent('1')
        })

        it('shows all items when type filter is null', () => {
            renderComponent({ selectedTypeFilter: null })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()

            const groupRow = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow).toHaveTextContent('2')
        })

        it('filters multiple items of the same type across different sources', () => {
            const dataWithMultipleDocs = [
                ...mockData,
                {
                    type: KnowledgeType.Document,
                    title: 'User Guide',
                    lastUpdatedAt: '2024-01-25T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guides.example.com',
                    id: '5',
                },
            ]

            renderComponent({
                data: dataWithMultipleDocs,
                selectedTypeFilter: KnowledgeType.Document,
            })

            expect(screen.getByText('docs.example.com')).toBeInTheDocument()
            expect(screen.getByText('guides.example.com')).toBeInTheDocument()

            const groupRow1 = screen.getByText('docs.example.com').closest('tr')
            expect(groupRow1).toHaveTextContent('1')

            const groupRow2 = screen
                .getByText('guides.example.com')
                .closest('tr')
            expect(groupRow2).toHaveTextContent('1')
        })

        it('shows empty state when filter matches no items', () => {
            const dataWithoutGuidance = mockData.filter(
                (item) => item.type !== KnowledgeType.Guidance,
            )

            renderComponent({
                data: dataWithoutGuidance,
                selectedTypeFilter: KnowledgeType.Guidance,
            })

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create Guidance' }),
            ).toBeInTheDocument()
        })

        it('filters grouped data correctly when multiple types share same source', () => {
            const dataWithSameSourceDifferentTypes = [
                {
                    type: KnowledgeType.Document,
                    title: 'Doc 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '2',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guide 1',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'same-source.com',
                    id: '3',
                },
            ]

            renderComponent({
                data: dataWithSameSourceDifferentTypes,
                selectedTypeFilter: KnowledgeType.Document,
            })

            const groupRow = screen.getByText('same-source.com').closest('tr')
            expect(groupRow).toHaveTextContent('1')
        })

        it('correctly filters items without source', () => {
            const dataWithItemsWithoutSource = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '2',
                },
            ]

            renderComponent({
                data: dataWithItemsWithoutSource,
                selectedTypeFilter: KnowledgeType.Guidance,
            })

            expect(screen.getByText('Guidance 1')).toBeInTheDocument()
            expect(screen.queryByText('FAQ 1')).not.toBeInTheDocument()
        })

        it('respects type filter when displaying item counts', () => {
            renderComponent({ selectedTypeFilter: KnowledgeType.Document })

            const itemCountText = screen.getByText('1 item')
            expect(itemCountText).toBeInTheDocument()
        })
    })

    describe('empty state components', () => {
        describe('EmptyStateAllContent', () => {
            it('renders when no data and no filter is selected', () => {
                renderComponent({ data: [], selectedTypeFilter: null })

                expect(
                    screen.getByRole('heading', { name: 'Create new content' }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('heading', {
                        name: 'Sync or upload external content',
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

                expect(
                    screen.getByText('Help Center articles'),
                ).toBeInTheDocument()
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
                        name: 'Create new content',
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
                        name: 'Create new content',
                    }),
                ).not.toBeInTheDocument()

                rerender(
                    <QueryClientProvider client={queryClient}>
                        <KnowledgeHubTable
                            {...defaultProps}
                            data={[]}
                            isLoading={false}
                        />
                    </QueryClientProvider>,
                )

                expect(
                    screen.getByRole('heading', { name: 'Create new content' }),
                ).toBeInTheDocument()
            })
        })
    })

    describe('row click handling', () => {
        const ungroupedGuidanceData = [
            {
                type: KnowledgeType.Guidance,
                title: 'Return Policy',
                lastUpdatedAt: '2024-01-20T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '123',
            },
        ]

        const ungroupedFaqData = [
            {
                type: KnowledgeType.FAQ,
                title: 'Shipping FAQ',
                lastUpdatedAt: '2024-01-10T10:00:00Z',
                inUseByAI: KnowledgeVisibility.UNLISTED,
                source: 'docs.example.com',
                id: '456',
            },
        ]

        const ungroupedDocumentData = [
            {
                type: KnowledgeType.Document,
                title: 'Product Manual',
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                source: 'docs.example.com',
                id: '789',
            },
        ]

        it('calls onGuidanceRowClick with correct ID when clicking ungrouped Guidance row', async () => {
            const user = userEvent.setup()
            const onGuidanceRowClick = jest.fn()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedGuidanceData,
                selectedFolder: ungroupedGuidanceData[0],
                onGuidanceRowClick,
                onRowClick,
            })

            const guidanceRow = screen.getByText('Return Policy')

            await user.click(guidanceRow)

            expect(onGuidanceRowClick).toHaveBeenCalledWith(123)
            expect(onRowClick).not.toHaveBeenCalled()
        })

        it('calls onFaqRowClick with correct ID when clicking ungrouped FAQ row', async () => {
            const user = userEvent.setup()
            const onFaqRowClick = jest.fn()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedFaqData,
                selectedFolder: ungroupedFaqData[0],
                onFaqRowClick,
                onRowClick,
            })

            const faqRow = screen.getByText('Shipping FAQ')

            await user.click(faqRow)

            expect(onFaqRowClick).toHaveBeenCalledWith(456)
            expect(onRowClick).not.toHaveBeenCalled()
        })

        it('calls onRowClick when clicking grouped rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            renderComponent({
                data: mockData,
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const groupedRow = screen.getByText('docs.example.com')

            await user.click(groupedRow)

            expect(onRowClick).toHaveBeenCalled()
            expect(onGuidanceRowClick).not.toHaveBeenCalled()
            expect(onFaqRowClick).not.toHaveBeenCalled()
        })

        it('calls onRowClick when clicking Document rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            renderComponent({
                data: ungroupedDocumentData,
                selectedFolder: ungroupedDocumentData[0],
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const documentRow = screen.getByText('Product Manual')

            await user.click(documentRow)

            expect(onRowClick).toHaveBeenCalled()
            expect(onGuidanceRowClick).not.toHaveBeenCalled()
            expect(onFaqRowClick).not.toHaveBeenCalled()
        })

        it('calls onRowClick when clicking URL rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const urlData = [
                {
                    type: KnowledgeType.URL,
                    title: 'Help Center',
                    lastUpdatedAt: '2024-01-05T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    id: '999',
                },
            ]

            renderComponent({
                data: urlData,
                selectedFolder: urlData[0],
                onRowClick,
                onGuidanceRowClick,
                onFaqRowClick,
            })

            const urlRow = screen.getByText('Help Center')

            await user.click(urlRow)

            expect(onRowClick).toHaveBeenCalled()
            expect(onGuidanceRowClick).not.toHaveBeenCalled()
            expect(onFaqRowClick).not.toHaveBeenCalled()
        })

        it('falls back to onRowClick when onGuidanceRowClick is not provided for Guidance row', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedGuidanceData,
                selectedFolder: ungroupedGuidanceData[0],
                onRowClick,
            })

            const guidanceRow = screen.getByText('Return Policy')

            await user.click(guidanceRow)

            expect(onRowClick).toHaveBeenCalled()
        })

        it('falls back to onRowClick when onFaqRowClick is not provided for FAQ row', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()

            renderComponent({
                data: ungroupedFaqData,
                selectedFolder: ungroupedFaqData[0],
                onRowClick,
            })

            const faqRow = screen.getByText('Shipping FAQ')

            await user.click(faqRow)

            expect(onRowClick).toHaveBeenCalled()
        })

        it('does not call any handler for grouped Guidance rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onGuidanceRowClick = jest.fn()

            const guidanceWithSourceData = [
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 1',
                    lastUpdatedAt: '2024-01-20T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guidance.example.com',
                    id: '111',
                },
                {
                    type: KnowledgeType.Guidance,
                    title: 'Guidance 2',
                    lastUpdatedAt: '2024-01-21T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'guidance.example.com',
                    id: '222',
                },
            ]

            renderComponent({
                data: guidanceWithSourceData,
                onRowClick,
                onGuidanceRowClick,
            })

            const groupedRow = screen.getByText('guidance.example.com')

            await user.click(groupedRow)

            expect(onRowClick).toHaveBeenCalled()
            expect(onGuidanceRowClick).not.toHaveBeenCalled()
        })

        it('does not call any handler for grouped FAQ rows', async () => {
            const user = userEvent.setup()
            const onRowClick = jest.fn()
            const onFaqRowClick = jest.fn()

            const faqsWithSameSource = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 1',
                    lastUpdatedAt: '2024-01-10T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.UNLISTED,
                    source: 'faq.example.com',
                    id: '333',
                },
                {
                    type: KnowledgeType.FAQ,
                    title: 'FAQ 2',
                    lastUpdatedAt: '2024-01-11T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    source: 'faq.example.com',
                    id: '444',
                },
            ]

            renderComponent({
                data: faqsWithSameSource,
                onRowClick,
                onFaqRowClick,
            })

            const groupedRow = screen.getByText('faq.example.com')

            await user.click(groupedRow)

            expect(onRowClick).toHaveBeenCalled()
            expect(onFaqRowClick).not.toHaveBeenCalled()
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
            expect(screen.getByAltText('action logo')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
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
            expect(screen.queryByAltText('action logo')).not.toBeInTheDocument()
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
            expect(screen.queryByAltText('action logo')).not.toBeInTheDocument()
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
            expect(screen.queryByAltText('action logo')).not.toBeInTheDocument()
        })
    })
})
