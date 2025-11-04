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

            expect(screen.getByText('0 items')).toBeInTheDocument()
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

            expect(screen.getByText('0 items')).toBeInTheDocument()
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
})
