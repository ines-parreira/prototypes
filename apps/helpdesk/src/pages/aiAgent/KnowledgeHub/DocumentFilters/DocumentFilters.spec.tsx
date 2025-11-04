import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeType } from '../types'
import { DocumentFilters } from './DocumentFilters'

describe('DocumentFilters', () => {
    const mockOnFilterChange = jest.fn()

    const defaultProps = {
        selectedFilter: null,
        onFilterChange: mockOnFilterChange,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<DocumentFilters {...defaultProps} {...props} />)
    }

    describe('rendering', () => {
        it('renders all filter buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'All content' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Documents/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Help Center articles/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Guidance/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /URLs/ }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /Store website/ }),
            ).toBeInTheDocument()
        })
    })

    describe('selected state', () => {
        it('highlights "All content" button when selectedFilter is null', () => {
            renderComponent({ selectedFilter: null })

            const allContentButton = screen.getByRole('button', {
                name: 'All content',
            })
            expect(allContentButton).toBeInTheDocument()
        })

        it('highlights Document button when selectedFilter is Document', () => {
            renderComponent({ selectedFilter: KnowledgeType.Document })

            const documentButton = screen.getByRole('button', {
                name: /Documents/,
            })
            expect(documentButton).toBeInTheDocument()
        })

        it('highlights FAQ button when selectedFilter is FAQ', () => {
            renderComponent({ selectedFilter: KnowledgeType.FAQ })

            const faqButton = screen.getByRole('button', {
                name: /Help Center articles/,
            })
            expect(faqButton).toBeInTheDocument()
        })

        it('highlights Guide button when selectedFilter is Guidance', () => {
            renderComponent({ selectedFilter: KnowledgeType.Guidance })

            const guideButton = screen.getByRole('button', { name: /Guidance/ })
            expect(guideButton).toBeInTheDocument()
        })

        it('highlights URL button when selectedFilter is URL', () => {
            renderComponent({ selectedFilter: KnowledgeType.URL })

            const urlButton = screen.getByRole('button', { name: /URLs/ })
            expect(urlButton).toBeInTheDocument()
        })

        it('highlights Domain button when selectedFilter is Domain', () => {
            renderComponent({ selectedFilter: KnowledgeType.Domain })

            const domainButton = screen.getByRole('button', {
                name: /Store website/,
            })
            expect(domainButton).toBeInTheDocument()
        })
    })

    describe('filter interactions', () => {
        it('calls onFilterChange with null when All content button is clicked', async () => {
            renderComponent()

            const allContentButton = screen.getByRole('button', {
                name: 'All content',
            })
            await userEvent.click(allContentButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(null)
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('calls onFilterChange with Document type when Document button is clicked', async () => {
            renderComponent()

            const documentButton = screen.getByRole('button', {
                name: /Documents/,
            })
            await userEvent.click(documentButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(
                KnowledgeType.Document,
            )
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('calls onFilterChange with FAQ type when FAQ button is clicked', async () => {
            renderComponent()

            const faqButton = screen.getByRole('button', {
                name: /Help Center articles/,
            })
            await userEvent.click(faqButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(KnowledgeType.FAQ)
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('calls onFilterChange with Guidance type when Guide button is clicked', async () => {
            renderComponent()

            const guideButton = screen.getByRole('button', { name: /Guidance/ })
            await userEvent.click(guideButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(
                KnowledgeType.Guidance,
            )
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('calls onFilterChange with URL type when URL button is clicked', async () => {
            renderComponent()

            const urlButton = screen.getByRole('button', { name: /URL/ })
            await userEvent.click(urlButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(KnowledgeType.URL)
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('calls onFilterChange with Domain type when Domain button is clicked', async () => {
            renderComponent()

            const domainButton = screen.getByRole('button', {
                name: /Store website/,
            })
            await userEvent.click(domainButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(
                KnowledgeType.Domain,
            )
            expect(mockOnFilterChange).toHaveBeenCalledTimes(1)
        })

        it('allows switching between filters', async () => {
            renderComponent()

            const documentButton = screen.getByRole('button', {
                name: /Documents/,
            })
            await userEvent.click(documentButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(
                KnowledgeType.Document,
            )

            const faqButton = screen.getByRole('button', {
                name: /Help Center articles/,
            })
            await userEvent.click(faqButton)

            expect(mockOnFilterChange).toHaveBeenCalledWith(KnowledgeType.FAQ)
            expect(mockOnFilterChange).toHaveBeenCalledTimes(2)
        })
    })
})
