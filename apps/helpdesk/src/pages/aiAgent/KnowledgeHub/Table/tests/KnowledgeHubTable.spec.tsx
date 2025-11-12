import { render, screen } from '@testing-library/react'

import { KnowledgeType, KnowledgeVisibility } from '../../types'
import { KnowledgeHubTable } from '../KnowledgeHubTable'

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
    const defaultProps = {
        data: mockData,
        isLoading: false,
        onRowClick: jest.fn(),
        selectedFolder: null,
    }

    const renderComponent = (props = {}) => {
        return render(<KnowledgeHubTable {...defaultProps} {...props} />)
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
                    <KnowledgeHubTable
                        {...defaultProps}
                        data={[]}
                        isLoading={false}
                    />,
                )

                expect(
                    screen.getByRole('heading', { name: 'Create new content' }),
                ).toBeInTheDocument()
            })
        })
    })
})
