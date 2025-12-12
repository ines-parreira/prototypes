import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

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
            source: 'docs.example.com',
            isGrouped: false,
            localeCode: 'en-US',
            draftVersionId: 456,
            publishedVersionId: 789,
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
                draftVersionId: null,
                publishedVersionId: null,
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
                draftVersionId: null,
                publishedVersionId: null,
            },
        } as any

        render(
            <TitleCell row={groupedRow} searchTerm="" availableActions={[]} />,
        )

        expect(screen.queryByText('docs.example.com')).not.toBeInTheDocument()
    })

    it('renders Public tag for FAQ with published version and no draft changes', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                draftVersionId: 100,
                publishedVersionId: 100,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.queryByText('Draft')).not.toBeInTheDocument()
        expect(screen.getByText('Public')).toBeInTheDocument()
    })

    it('renders Draft tag for published FAQ with null draftVersionId', () => {
        // When draftVersionId is null but publishedVersionId exists,
        // isDraft returns true because draftVersionId !== publishedVersionId
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                publishedVersionId: 1,
                draftVersionId: null,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Draft tag for FAQ with unpublished draft', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                publishedVersionId: 1,
                draftVersionId: 2,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Draft tag for FAQ without published version', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                draftVersionId: 100,
                publishedVersionId: null,
            },
        } as any

        render(<TitleCell row={faqRow} searchTerm="" availableActions={[]} />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('renders Draft tag for FAQ with only draft version (undefined published)', () => {
        const faqRow = {
            ...mockRow,
            original: {
                ...mockRow.original,
                type: KnowledgeType.FAQ,
                draftVersionId: 100,
                publishedVersionId: undefined,
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
                draftVersionId: 300,
                publishedVersionId: 400,
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
                draftVersionId: null,
                publishedVersionId: null,
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
