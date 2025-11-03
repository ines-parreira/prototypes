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
})
