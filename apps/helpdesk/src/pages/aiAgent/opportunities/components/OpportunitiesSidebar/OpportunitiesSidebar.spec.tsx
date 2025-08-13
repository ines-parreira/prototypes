import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunitiesSidebar } from './OpportunitiesSidebar'

describe('OpportunitiesSidebar', () => {
    const mockOnSelectOpportunity = jest.fn()

    beforeEach(() => {
        mockOnSelectOpportunity.mockClear()
    })

    it('should render sidebar header with title', () => {
        render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const title = screen.getByRole('heading', {
            name: 'Available opportunities',
        })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render opportunity cards with mock data', () => {
        render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        // Should show item count
        expect(screen.getByText('4 items')).toBeInTheDocument()

        // Should render the opportunity cards
        expect(
            screen.getByText("What's your return policy?"),
        ).toBeInTheDocument()
        expect(
            screen.getByText('How do I access my store account?'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('How can I apply a discount?'),
        ).toBeInTheDocument()
        expect(screen.getByText('Topic')).toBeInTheDocument()
    })

    it('should have proper structure with header and content sections', () => {
        const { container } = render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const sidebar = container.querySelector('.sidebar')
        expect(sidebar).toBeInTheDocument()

        const header = container.querySelector('.header')
        expect(header).toBeInTheDocument()

        const containerContent = container.querySelector('.containerContent')
        expect(containerContent).toBeInTheDocument()
    })

    it('should call onSelectOpportunity with first opportunity on mount', async () => {
        render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        await waitFor(() => {
            expect(mockOnSelectOpportunity).toHaveBeenCalledWith({
                id: '1',
                title: "What's your return policy?",
                type: 'FILL_KNOWLEDGE_GAP',
            })
        })
    })

    it('should call onSelectOpportunity when a card is clicked', async () => {
        const user = userEvent.setup()
        render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const secondCard = screen
            .getByText('How do I access my store account?')
            .closest('div[class*="card"]')

        if (secondCard) {
            await user.click(secondCard)
        }

        await waitFor(() => {
            expect(mockOnSelectOpportunity).toHaveBeenCalledWith({
                id: '2',
                title: 'How do I access my store account?',
                type: 'FILL_KNOWLEDGE_GAP',
            })
        })
    })

    it('should show first card as selected by default', () => {
        render(
            <OpportunitiesSidebar
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const firstCard = screen
            .getByText("What's your return policy?")
            .closest('div[class*="card"]')
        expect(firstCard).toHaveClass('cardSelected')
    })
})
