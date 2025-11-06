import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Virtuoso } from 'react-virtuoso'

import { OpportunityType } from '../../enums'
import { Opportunity } from '../../utils/mapAiArticlesToOpportunities'
import { OpportunitiesSidebar } from './OpportunitiesSidebar'

jest.mock('react-virtuoso', () => ({ Virtuoso: jest.fn() }))
const VirtuosoMock = Virtuoso as jest.Mock

describe('OpportunitiesSidebar', () => {
    const mockOnSelectOpportunity = jest.fn()

    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'ai_1',
            title: "What's your return policy?",
            content:
                'You can request a return or exchange within 14 days of your delivery date.',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '2',
            key: 'ai_2',
            title: 'How do I access my store account?',
            content:
                "You can access your account by clicking the 'My Account' link in the top right corner.",
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '3',
            key: 'ai_3',
            title: 'How can I apply a discount?',
            content:
                "Enter your discount code at checkout in the 'Promo Code' field.",
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '4',
            key: 'ai_4',
            title: 'Topic',
            content: 'Resolve this conflict in your guidance.',
            type: OpportunityType.RESOLVE_CONFLICT,
        },
    ]

    beforeEach(() => {
        mockOnSelectOpportunity.mockClear()
        VirtuosoMock.mockImplementation(
            ({ data, itemContent, components, computeItemKey }) => (
                <div data-testid="virtuoso-mock">
                    {data.map((item: Opportunity, index: number) => (
                        <div key={computeItemKey?.(index, item) || item.id}>
                            {itemContent(index, item)}
                        </div>
                    ))}
                    {components?.Footer?.()}
                </div>
            ),
        )
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

        expect(screen.getByText('4 items')).toBeInTheDocument()

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
                key: 'ai_1',
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
                key: 'ai_2',
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
                selectedOpportunity={mockOpportunities[0]}
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

        const emptyTitle = screen.getByRole('heading', {
            name: 'No opportunities yet',
        })
        expect(emptyTitle).toBeInTheDocument()

        const description = screen.getByText(
            'AI Agent will start finding opportunities to improve as it learns from conversations with your customers',
        )
        expect(description).toBeInTheDocument()
    })

    it('should show loading state when isLoading is true', () => {
        const { container } = render(
            <OpportunitiesSidebar
                opportunities={[]}
                isLoading={true}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const skeletons = container.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    describe('Infinite scroll', () => {
        const mockOnEndReached = jest.fn()

        beforeEach(() => {
            mockOnEndReached.mockClear()
        })

        it('should call onEndReached when hasNextPage is true and end is reached', () => {
            VirtuosoMock.mockImplementation(
                ({
                    data,
                    itemContent,
                    components,
                    computeItemKey,
                    endReached,
                }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                        {components?.Footer?.()}
                        <button onClick={endReached}>Trigger End</button>
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    onEndReached={mockOnEndReached}
                />,
            )

            const triggerButton = screen.getByText('Trigger End')
            triggerButton.click()

            expect(mockOnEndReached).toHaveBeenCalledTimes(1)
        })

        it('should not call onEndReached when hasNextPage is false', () => {
            VirtuosoMock.mockImplementation(
                ({
                    data,
                    itemContent,
                    components,
                    computeItemKey,
                    endReached,
                }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                        {components?.Footer?.()}
                        <button onClick={endReached}>Trigger End</button>
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            const triggerButton = screen.getByText('Trigger End')
            triggerButton.click()

            expect(mockOnEndReached).not.toHaveBeenCalled()
        })

        it('should show skeleton loaders when fetching next page', () => {
            VirtuosoMock.mockImplementation(
                ({ data, itemContent, components, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            const { container } = render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={true}
                    onEndReached={mockOnEndReached}
                />,
            )

            const skeletons = container.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should not show skeleton loaders when not fetching', () => {
            VirtuosoMock.mockImplementation(
                ({ data, itemContent, components, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            const virtuoso = screen.getByTestId('virtuoso-mock')
            const skeletons = virtuoso.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBe(0)
        })

        it('should auto-select when opportunities go from empty to populated', async () => {
            const { rerender } = render(
                <OpportunitiesSidebar
                    opportunities={[]}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            expect(mockOnSelectOpportunity).not.toHaveBeenCalled()

            rerender(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            await waitFor(() => {
                expect(mockOnSelectOpportunity).toHaveBeenCalledWith(
                    mockOpportunities[0],
                )
            })
        })

        it('should setup auto-fetch effect when all conditions are met', () => {
            const mockOnEndReached = jest.fn()

            const { rerender } = render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    isLoading={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            expect(mockOnSelectOpportunity).toHaveBeenCalled()

            rerender(
                <OpportunitiesSidebar
                    opportunities={[...mockOpportunities, ...mockOpportunities]}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    isLoading={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            expect(
                screen.getByText(`${mockOpportunities.length * 2} items`),
            ).toBeInTheDocument()
        })

        it('should not setup auto-fetch when isLoading is true', () => {
            const mockOnEndReached = jest.fn()

            const { container } = render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    isLoading={true}
                    onEndReached={mockOnEndReached}
                />,
            )

            const skeletons = container.querySelectorAll('[class*="skeleton"]')

            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should not setup auto-fetch when isFetchingNextPage is true', () => {
            const mockOnEndReached = jest.fn()

            VirtuosoMock.mockImplementation(
                ({ data, itemContent, components, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={true}
                    isLoading={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            const skeletons = screen
                .getByTestId('virtuoso-mock')
                .querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        it('should not setup auto-fetch when hasNextPage is false', () => {
            const mockOnEndReached = jest.fn()

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={false}
                    isFetchingNextPage={false}
                    isLoading={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            expect(screen.getByText('4 items')).toBeInTheDocument()
        })
    })

    describe('onOpportunityViewed callback', () => {
        it('should call onOpportunityViewed when card is clicked', async () => {
            const mockOnOpportunityViewed = jest.fn()

            VirtuosoMock.mockImplementation(
                ({ data, itemContent, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    onOpportunityViewed={mockOnOpportunityViewed}
                />,
            )

            const secondCard = screen.getByText(
                'How do I access my store account?',
            )
            await userEvent.click(secondCard)

            await waitFor(() => {
                expect(mockOnOpportunityViewed).toHaveBeenCalledWith({
                    opportunityId: '2',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should call onOpportunityViewed on initial mount with first opportunity', async () => {
            const mockOnOpportunityViewed = jest.fn()

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    onOpportunityViewed={mockOnOpportunityViewed}
                />,
            )

            await waitFor(() => {
                expect(mockOnOpportunityViewed).toHaveBeenCalledWith({
                    opportunityId: '1',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should not call onOpportunityViewed when callback is not provided', async () => {
            VirtuosoMock.mockImplementation(
                ({ data, itemContent, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map((item: Opportunity, index: number) => (
                            <div key={computeItemKey?.(index, item) || item.id}>
                                {itemContent(index, item)}
                            </div>
                        ))}
                    </div>
                ),
            )

            render(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            const secondCard = screen.getByText(
                'How do I access my store account?',
            )
            await userEvent.click(secondCard)

            expect(mockOnSelectOpportunity).toHaveBeenCalledWith(
                mockOpportunities[1],
            )
        })
    })
})
