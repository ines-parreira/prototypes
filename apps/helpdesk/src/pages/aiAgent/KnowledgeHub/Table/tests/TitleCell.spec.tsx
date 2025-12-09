import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    KnowledgeType,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'

import { TitleCell } from '../TitleCell'

jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: jest.fn(() => ({
        guidanceArticle: null,
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/components/GuidanceList/GuidanceActionsBadge', () => ({
    GuidanceActionsBadge: jest.fn(() => <div>GuidanceActionsBadge</div>),
}))

describe('TitleCell', () => {
    const mockOnClick = jest.fn()

    const mockRow = {
        original: {
            id: '123',
            type: KnowledgeType.Document,
            title: 'Test Document',
            lastUpdatedAt: '2024-01-15T10:00:00Z',
            inUseByAI: KnowledgeVisibility.PUBLIC,
            source: 'docs.example.com',
            isGrouped: false,
            localeCode: 'en-US',
        },
        getValue: () => 'Test Document',
    } as any

    beforeEach(() => {
        mockOnClick.mockClear()
    })

    it('renders title with correct text', () => {
        render(<TitleCell row={mockRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Test Document')).toBeInTheDocument()
    })

    it('highlights search term in title', () => {
        const { container } = render(
            <TitleCell row={mockRow} searchTerm="Test" availableActions={[]} />,
        )

        const highlightedText = container.querySelector('.highlight')
        expect(highlightedText).toBeInTheDocument()
        expect(highlightedText).toHaveTextContent('Test')
    })

    it('renders clickable cell when columnOnClick is provided', () => {
        const { container } = render(
            <TitleCell
                row={mockRow}
                searchTerm=""
                columnOnClick={mockOnClick}
                availableActions={[]}
            />,
        )

        const cell = container.querySelector('.clickableCell')
        expect(cell).toBeInTheDocument()
    })

    it('renders non-clickable cell when columnOnClick is not provided', () => {
        const { container } = render(
            <TitleCell row={mockRow} searchTerm="" availableActions={[]} />,
        )

        const cell = container.querySelector('.nonClickableCell')
        expect(cell).toBeInTheDocument()
    })

    it('calls onClick when cell is clicked and columnOnClick is provided', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <TitleCell
                row={mockRow}
                searchTerm=""
                columnOnClick={mockOnClick}
                availableActions={[]}
            />,
        )

        const cell = container.querySelector('.clickableCell')
        if (cell) {
            await user.click(cell)
        }

        expect(mockOnClick).toHaveBeenCalledWith(mockRow.original)
    })

    it('renders grouped item with item count', () => {
        const groupedRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                isGrouped: true,
                itemCount: 5,
            },
        } as any

        render(
            <TitleCell row={groupedRow} searchTerm="" availableActions={[]} />,
        )

        expect(screen.getByText('5 snippets')).toBeInTheDocument()
    })

    it('renders source for non-grouped items', () => {
        render(<TitleCell row={mockRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('docs.example.com')).toBeInTheDocument()
    })

    it('does not render source for grouped items', () => {
        const groupedRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                isGrouped: true,
                itemCount: 3,
            },
        } as any

        render(
            <TitleCell row={groupedRow} searchTerm="" availableActions={[]} />,
        )

        expect(screen.queryByText('docs.example.com')).not.toBeInTheDocument()
    })

    it('renders Public tag for FAQ with PUBLIC visibility', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                inUseByAI: KnowledgeVisibility.PUBLIC,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Public')).toBeInTheDocument()
    })

    it('renders Draft tag for FAQ with UNLISTED visibility', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                inUseByAI: KnowledgeVisibility.UNLISTED,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders GuidanceActionsBadge for guidance items with article', () => {
        const {
            useGuidanceArticle,
        } = require('pages/aiAgent/hooks/useGuidanceArticle')
        useGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                id: 123,
                title: 'Guidance Article',
                content: 'Some content',
            },
            isLoading: false,
        })

        const guidanceRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.Guidance,
            },
        } as any

        render(
            <TitleCell
                row={guidanceRow}
                searchTerm=""
                availableActions={[]}
                guidanceHelpCenterId={1}
            />,
        )

        expect(screen.getByText('GuidanceActionsBadge')).toBeInTheDocument()
    })

    it('does not render GuidanceActionsBadge for grouped guidance items', () => {
        const {
            useGuidanceArticle,
        } = require('pages/aiAgent/hooks/useGuidanceArticle')
        useGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                id: 123,
                title: 'Guidance Article',
                content: 'Some content',
            },
            isLoading: false,
        })

        const groupedGuidanceRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.Guidance,
                isGrouped: true,
                itemCount: 3,
            },
        } as any

        render(
            <TitleCell
                row={groupedGuidanceRow}
                searchTerm=""
                availableActions={[]}
                guidanceHelpCenterId={1}
            />,
        )

        expect(
            screen.queryByText('GuidanceActionsBadge'),
        ).not.toBeInTheDocument()
    })
})
