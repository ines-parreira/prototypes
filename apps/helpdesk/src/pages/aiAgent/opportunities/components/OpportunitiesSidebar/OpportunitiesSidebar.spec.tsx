import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Virtuoso } from 'react-virtuoso'

import OpportunitiesSidebarContext from '../../context/OpportunitiesSidebarContext'
import { OpportunityType } from '../../enums'
import {
    type OpportunityPageState,
    State,
} from '../../hooks/useOpportunityPageState'
import type {
    Opportunity,
    OpportunityListItem,
    SidebarOpportunityItem,
} from '../../types'
import { OpportunitiesSidebar } from './OpportunitiesSidebar'

jest.mock('react-virtuoso', () => ({ Virtuoso: jest.fn() }))
const VirtuosoMock = Virtuoso as jest.Mock

const mockOpportunityPageState: OpportunityPageState = {
    state: State.HAS_OPPORTUNITIES,
    isLoading: false,
    title: 'Opportunities',
    description: '',
    media: null,
    primaryCta: null,
    showEmptyState: false,
}

const mockLoadingPageState: OpportunityPageState = {
    state: State.LOADING,
    isLoading: true,
    title: '',
    description: '',
    media: null,
    primaryCta: null,
    showEmptyState: false,
}

const mockEmptyPageState: OpportunityPageState = {
    state: State.ENABLED_NO_OPPORTUNITIES,
    isLoading: false,
    title: 'AI Agent is learning from your conversations',
    description:
        "As AI Agent handles more conversations, we'll surface opportunities to improve its accuracy and coverage. Check back soon!",
    media: '/assets/images/ai-agent/opportunities/learning.svg',
    primaryCta: null,
    showEmptyState: true,
}

describe('OpportunitiesSidebar', () => {
    const mockOnSelectOpportunity = jest.fn()

    const renderWithProvider = (ui: ReactElement) => {
        const Wrapper = ({ children }: { children: ReactNode }) => {
            const [isSidebarVisible, setIsSidebarVisible] = useState(true)
            return (
                <OpportunitiesSidebarContext.Provider
                    value={{ isSidebarVisible, setIsSidebarVisible }}
                >
                    {children}
                </OpportunitiesSidebarContext.Provider>
            )
        }
        return render(ui, { wrapper: Wrapper })
    }

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
                    {data.map((item: SidebarOpportunityItem, index: number) => (
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
        renderWithProvider(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                opportunitiesPageState={mockOpportunityPageState}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const title = screen.getByRole('heading', {
            name: 'Opportunities',
        })
        expect(title).toBeInTheDocument()
    })

    it('should render opportunity cards with mock data', () => {
        renderWithProvider(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                opportunitiesPageState={mockOpportunityPageState}
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
        const { container } = renderWithProvider(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                opportunitiesPageState={mockOpportunityPageState}
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

    it('should call onSelectOpportunity when a card is clicked', async () => {
        const user = userEvent.setup()
        renderWithProvider(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                opportunitiesPageState={mockOpportunityPageState}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const secondCard = screen
            .getByText('How do I access my store account?')
            .closest('div[class*="card"]')

        if (secondCard) {
            await act(() => user.click(secondCard))
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
        renderWithProvider(
            <OpportunitiesSidebar
                opportunities={mockOpportunities}
                opportunitiesPageState={mockOpportunityPageState}
                onSelectOpportunity={mockOnSelectOpportunity}
                selectedOpportunity={mockOpportunities[0]}
            />,
        )

        const firstCard = screen
            .getByText("What's your return policy?")
            .closest('div[class*="card"]')
        expect(firstCard).toHaveClass('cardSelected')
    })

    it('should show empty state when showEmptyState is true', () => {
        renderWithProvider(
            <OpportunitiesSidebar
                opportunities={[]}
                opportunitiesPageState={mockEmptyPageState}
                onSelectOpportunity={mockOnSelectOpportunity}
            />,
        )

        const emptyTitle = screen.getByRole('heading', {
            name: 'Opportunities',
        })
        expect(emptyTitle).toBeInTheDocument()

        const emptyText = screen.getByText('No opportunities')
        expect(emptyText).toBeInTheDocument()
    })

    it('should show loading state when isLoading is true', () => {
        const { container } = renderWithProvider(
            <OpportunitiesSidebar
                opportunities={[]}
                opportunitiesPageState={mockOpportunityPageState}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                        {components?.Footer?.()}
                        <button onClick={endReached}>Trigger End</button>
                    </div>
                ),
            )

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                        {components?.Footer?.()}
                        <button onClick={endReached}>Trigger End</button>
                    </div>
                ),
            )

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
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

        it('should setup auto-fetch effect when all conditions are met', () => {
            const mockOnEndReached = jest.fn()

            const { rerender } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            const additionalOpportunities: Opportunity[] = [
                {
                    id: '5',
                    key: 'ai_5',
                    title: 'Additional opportunity 1',
                    content: 'Content for additional opportunity 1',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                },
                {
                    id: '6',
                    key: 'ai_6',
                    title: 'Additional opportunity 2',
                    content: 'Content for additional opportunity 2',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                },
                {
                    id: '7',
                    key: 'ai_7',
                    title: 'Additional opportunity 3',
                    content: 'Content for additional opportunity 3',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                },
                {
                    id: '8',
                    key: 'ai_8',
                    title: 'Additional opportunity 4',
                    content: 'Content for additional opportunity 4',
                    type: OpportunityType.RESOLVE_CONFLICT,
                },
            ]

            rerender(
                <OpportunitiesSidebar
                    opportunities={[
                        ...mockOpportunities,
                        ...additionalOpportunities,
                    ]}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            expect(
                screen.getByText(`${mockOpportunities.length * 2} items`),
            ).toBeInTheDocument()
        })

        it('should not setup auto-fetch when isLoading is true', () => {
            const mockOnEndReached = jest.fn()

            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockLoadingPageState}
                    isLoading={true}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={false}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                        {components?.Footer && <components.Footer />}
                    </div>
                ),
            )

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={true}
                    isFetchingNextPage={true}
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

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    hasNextPage={false}
                    isFetchingNextPage={false}
                    onEndReached={mockOnEndReached}
                />,
            )

            expect(screen.getByText('4 items')).toBeInTheDocument()
        })
    })

    describe('insight display', () => {
        it('should display insight for OpportunityListItem (KS flow)', () => {
            const opportunityListItems: OpportunityListItem[] = [
                {
                    id: '1',
                    key: 'ks_1',
                    insight: 'Customer frequently asks about return policy',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                },
            ]

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={opportunityListItems}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            expect(
                screen.getByText(
                    'Customer frequently asks about return policy',
                ),
            ).toBeInTheDocument()
        })

        it('should display title for Opportunity (legacy flow)', () => {
            const opportunities: Opportunity[] = [
                {
                    id: '1',
                    key: 'ai_1',
                    title: 'Fallback Title',
                    content: 'Some content',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                },
            ]

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={opportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            expect(screen.getByText('Fallback Title')).toBeInTheDocument()
        })
    })

    describe('onOpportunityViewed callback', () => {
        it('should call onOpportunityViewed when selectedOpportunity changes after click', async () => {
            const mockOnOpportunityViewed = jest.fn()

            VirtuosoMock.mockImplementation(
                ({ data, itemContent, computeItemKey }) => (
                    <div data-testid="virtuoso-mock">
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                    </div>
                ),
            )

            const { rerender } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    onOpportunityViewed={mockOnOpportunityViewed}
                    selectedOpportunity={mockOpportunities[0]}
                />,
            )

            mockOnOpportunityViewed.mockClear()

            const secondCard = screen.getByText(
                'How do I access my store account?',
            )
            await act(() => userEvent.click(secondCard))

            expect(mockOnSelectOpportunity).toHaveBeenCalledWith(
                mockOpportunities[1],
            )

            rerender(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    onOpportunityViewed={mockOnOpportunityViewed}
                    selectedOpportunity={mockOpportunities[1]}
                />,
            )

            await waitFor(() => {
                expect(mockOnOpportunityViewed).toHaveBeenCalledWith({
                    opportunityId: '2',
                    opportunityType: OpportunityType.FILL_KNOWLEDGE_GAP,
                })
            })
        })

        it('should call onOpportunityViewed when selectedOpportunity is provided', async () => {
            const mockOnOpportunityViewed = jest.fn()

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    onOpportunityViewed={mockOnOpportunityViewed}
                    selectedOpportunity={mockOpportunities[0]}
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
                        {data.map(
                            (item: SidebarOpportunityItem, index: number) => (
                                <div
                                    key={
                                        computeItemKey?.(index, item) || item.id
                                    }
                                >
                                    {itemContent(index, item)}
                                </div>
                            ),
                        )}
                    </div>
                ),
            )

            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                />,
            )

            const secondCard = screen.getByText(
                'How do I access my store account?',
            )
            await act(() => userEvent.click(secondCard))

            expect(mockOnSelectOpportunity).toHaveBeenCalledWith(
                mockOpportunities[1],
            )
        })
    })

    describe('restricted opportunities', () => {
        it('should render all opportunities as accessible when allowedOpportunityIds is undefined', () => {
            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={undefined}
                />,
            )

            const restrictedCards = container.querySelectorAll(
                '[class*="cardRestricted"]',
            )
            expect(restrictedCards.length).toBe(0)
        })

        it('should render restricted opportunities with restricted styling', () => {
            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={[1, 2]}
                />,
            )

            const restrictedCards = container.querySelectorAll(
                '[class*="cardRestricted"]',
            )
            expect(restrictedCards.length).toBe(2)
        })

        it('should mark opportunities not in allowedOpportunityIds as restricted', () => {
            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={[1]}
                />,
            )

            const restrictedCards = container.querySelectorAll(
                '[aria-disabled="true"]',
            )
            expect(restrictedCards.length).toBe(3)
        })

        it('should allow all opportunities when allowedOpportunityIds contains all ids', () => {
            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={[1, 2, 3, 4]}
                />,
            )

            const restrictedCards = container.querySelectorAll(
                '[class*="cardRestricted"]',
            )
            expect(restrictedCards.length).toBe(0)
        })

        it('should mark all opportunities as restricted when allowedOpportunityIds is empty array', () => {
            const { container } = renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={[]}
                />,
            )

            const restrictedCards = container.querySelectorAll(
                '[class*="cardRestricted"]',
            )
            expect(restrictedCards.length).toBe(4)
        })

        it('should not call onSelectOpportunity when clicking a restricted opportunity', async () => {
            const user = userEvent.setup()
            renderWithProvider(
                <OpportunitiesSidebar
                    opportunities={mockOpportunities}
                    opportunitiesPageState={mockOpportunityPageState}
                    onSelectOpportunity={mockOnSelectOpportunity}
                    allowedOpportunityIds={[1]}
                />,
            )

            const secondCard = screen
                .getByText('How do I access my store account?')
                .closest('div[class*="card"]')

            if (secondCard) {
                await act(() => user.click(secondCard))
            }

            expect(mockOnSelectOpportunity).not.toHaveBeenCalled()
        })
    })
})
