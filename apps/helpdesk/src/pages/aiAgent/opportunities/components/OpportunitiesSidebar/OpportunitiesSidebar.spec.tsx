import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesSidebar } from './OpportunitiesSidebar'

describe('OpportunitiesSidebar', () => {
    const mockOnSelectOpportunity = jest.fn()

    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            title: "What's your return policy?",
            content:
                'You can request a return or exchange within 14 days of your delivery date.',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '2',
            title: 'How do I access my store account?',
            content:
                "You can access your account by clicking the 'My Account' link in the top right corner.",
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '3',
            title: 'How can I apply a discount?',
            content:
                "Enter your discount code at checkout in the 'Promo Code' field.",
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '4',
            title: 'Topic',
            content: 'Resolve this conflict in your guidance.',
            type: OpportunityType.RESOLVE_CONFLICT,
        },
    ]

    beforeEach(() => {
        mockOnSelectOpportunity.mockClear()
    })

    it('should render sidebar header with title', () => {
        render(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const title = screen.getByRole('heading', {
            name: 'Opportunities',
        })
        expect(title).toBeInTheDocument()
        expect(title).toHaveClass('title')
    })

    it('should render opportunity cards with mock data', () => {
        render(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
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
                opportunities={mockOpportunities}
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
                opportunities={mockOpportunities}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        await waitFor(() => {
            expect(mockOnSelectOpportunity).toHaveBeenCalledWith({
                id: '1',
                title: "What's your return policy?",
                content:
                    'You can request a return or exchange within 14 days of your delivery date.',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            })
        })
    })

    it('should call onSelectOpportunity when a card is clicked', async () => {
        const user = userEvent.setup()
        render(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
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
                content:
                    "You can access your account by clicking the 'My Account' link in the top right corner.",
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            })
        })
    })

    it('should show first card as selected by default', () => {
        render(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const firstCard = screen
            .getByText("What's your return policy?")
            .closest('div[class*="card"]')
        expect(firstCard).toHaveClass('cardSelected')
    })

    it('should show empty state when no opportunities', () => {
        render(
            <OpportunitiesSidebar
                opportunities={[]}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        expect(screen.getByText('0 items')).toBeInTheDocument()
    })

    it('should show loading state when isLoading is true', () => {
        const { container } = render(
            <OpportunitiesSidebar
                opportunities={[]}
                isLoading={true}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const skeletons = container.querySelectorAll('.card')
        expect(skeletons.length).toBe(3)
    })
})
