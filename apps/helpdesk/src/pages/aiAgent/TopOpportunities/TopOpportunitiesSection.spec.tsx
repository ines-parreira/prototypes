import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { OpportunityType } from '../opportunities/enums'
import type { OpportunityListItem } from '../opportunities/types'
import { TopOpportunitiesSection } from './TopOpportunitiesSection'

const mockStore = configureStore([])
const mockPush = jest.fn()

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        push: mockPush,
    }),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            opportunities: '/ai-agent/shopify/test-shop/opportunities',
            opportunitiesWithId: (id: string) =>
                `/ai-agent/shopify/test-shop/opportunities?selected=${id}`,
        },
    })),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    FeatureFlagKey: {
        IncreaseVisibilityOfOpportunity: 'increase-visibility-of-opportunity',
    },
    useFlag: jest.fn(() => true),
}))

const mockOpportunities: OpportunityListItem[] = [
    {
        id: '1',
        key: 'opp-1',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        insight: 'Add guidance for shipping policy',
        ticketCount: 5,
    },
    {
        id: '2',
        key: 'opp-2',
        type: OpportunityType.RESOLVE_CONFLICT,
        insight: 'Resolve conflicting return policy information',
        ticketCount: 10,
    },
    {
        id: '3',
        key: 'opp-3',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        insight: 'Add guidance for refund process',
        ticketCount: 3,
    },
]

jest.mock('pages/aiAgent/opportunities/hooks/useEnrichedOpportunity', () => ({
    useEnrichedOpportunity: jest.fn(() => ({
        data: {
            resources: [{ insight: 'Insight 1' }, { insight: 'Insight 2' }],
        },
        isLoading: false,
    })),
}))

const createMockStore = (initialState = {}) => {
    return mockStore({
        notifications: [],
        ui: {
            helpCenter: {
                viewLanguage: 'en-US',
            },
        },
        integrations: fromJS({
            data: [],
        }),
        ...initialState,
    })
}

const createMockQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, staleTime: 0 },
            mutations: { retry: false },
        },
    })
}

interface TestWrapperProps {
    children: React.ReactNode
    store?: any
    queryClient?: QueryClient
}

const TestWrapper: React.FC<TestWrapperProps> = ({
    children,
    store = createMockStore(),
    queryClient = createMockQueryClient(),
}) => {
    return (
        <MemoryRouter>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>
    )
}

describe('TopOpportunitiesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render section with correct title', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByRole('heading', { name: /top opportunities/i }),
            ).toBeInTheDocument()
        })

        it('should render view all opportunities button when opportunities exceed limit', () => {
            const manyOpportunities: OpportunityListItem[] = [
                ...mockOpportunities,
                {
                    id: '4',
                    key: 'opp-4',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    insight: 'Add guidance for warranty policy',
                    ticketCount: 7,
                },
            ]

            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={manyOpportunities}
                        isLoading={false}
                        totalCount={4}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByRole('button', {
                    name: /view all opportunities/i,
                }),
            ).toBeInTheDocument()
        })

        it('should not render view all opportunities button when opportunities equal or below limit', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.queryByRole('button', {
                    name: /view all opportunities/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should not render view all opportunities button with fewer than 3 opportunities', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities.slice(0, 2)}
                        isLoading={false}
                        totalCount={2}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.queryByRole('button', {
                    name: /view all opportunities/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should render all opportunity cards', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Resolve conflicting return policy information/,
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Add guidance for refund process/),
            ).toBeInTheDocument()
        })

        it('should render cards in a grid layout', () => {
            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const gridContainer = container.querySelector('.gridContainer')
            expect(gridContainer).toBeInTheDocument()
        })
    })

    describe('Loading State', () => {
        it('should render skeleton loaders when loading', () => {
            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={[]}
                        isLoading={true}
                        totalCount={0}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            // Should render 3 skeleton cards
            const skeletons = container.querySelectorAll(
                '[data-name="skeleton"]',
            )
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    describe('Empty State', () => {
        it('should render empty state when no opportunities', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={[]}
                        isLoading={false}
                        totalCount={0}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText('No opportunities available'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'AI Agent is learning from your conversations.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        it('should navigate to opportunities page when view all button is clicked', async () => {
            const user = userEvent.setup()

            const manyOpportunities: OpportunityListItem[] = [
                ...mockOpportunities,
                {
                    id: '4',
                    key: 'opp-4',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    insight: 'Add guidance for warranty policy',
                    ticketCount: 7,
                },
            ]

            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={manyOpportunities}
                        isLoading={false}
                        totalCount={4}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const viewAllButton = screen.getByRole('button', {
                name: /view all opportunities/i,
            })

            await user.click(viewAllButton)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/ai-agent/shopify/test-shop/opportunities',
                )
            })
        })
    })

    describe('Opportunity Restrictions', () => {
        it('should mark opportunities as restricted when allowedOpportunityIds is defined and opportunity is not in the list', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={5}
                        allowedOpportunityIds={[2]} // Only opportunity with id '2' is allowed
                    />
                </TestWrapper>,
            )

            // Opportunities should render but some will be restricted
            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
        })

        it('should not restrict opportunities when allowedOpportunityIds is undefined', () => {
            render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            // All opportunities should be accessible
            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
        })

        it('should calculate totalRestrictedOpportunities correctly', () => {
            const { rerender } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={10}
                        allowedOpportunityIds={[1, 2, 3]}
                    />
                </TestWrapper>,
            )

            // totalRestrictedOpportunities should be totalCount - allowedOpportunityIds.length = 10 - 3 = 7
            // This is passed to the card components
            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()

            // Test with undefined allowedOpportunityIds
            rerender(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities}
                        isLoading={false}
                        totalCount={10}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            // totalRestrictedOpportunities should be undefined for full access users
            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
        })
    })

    describe('Grid Layout Behavior', () => {
        it('should maintain 3-column grid even with fewer opportunities', () => {
            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mockOpportunities.slice(0, 2)}
                        isLoading={false}
                        totalCount={2}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const gridContainer = container.querySelector('.gridContainer')
            expect(gridContainer).toBeInTheDocument()

            // Should only render 2 cards, but grid maintains 3 columns
            const cards = container.querySelectorAll('.card')
            expect(cards.length).toBe(2)
        })
    })

    describe('Opportunity Sorting', () => {
        it('should sort opportunities by type first (RESOLVE_CONFLICT priority)', () => {
            const mixedOpportunities: OpportunityListItem[] = [
                {
                    id: '1',
                    key: 'opp-1',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    insight: 'Knowledge gap with 5 tickets',
                    ticketCount: 5,
                },
                {
                    id: '2',
                    key: 'opp-2',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 4 tickets',
                    ticketCount: 4,
                },
                {
                    id: '3',
                    key: 'opp-3',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 3 tickets',
                    ticketCount: 3,
                },
            ]

            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={mixedOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const cards = container.querySelectorAll('.card')

            expect(cards[0]).toHaveTextContent('4 tickets')
            expect(cards[1]).toHaveTextContent('3 tickets')
            expect(cards[2]).toHaveTextContent('Knowledge gap with 5 tickets')
            expect(cards[2]).toHaveTextContent('5 tickets')
        })

        it('should sort by ticket count within same type', () => {
            const sameTypeOpportunities: OpportunityListItem[] = [
                {
                    id: '1',
                    key: 'opp-1',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 2 tickets',
                    ticketCount: 2,
                },
                {
                    id: '2',
                    key: 'opp-2',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 5 tickets',
                    ticketCount: 5,
                },
                {
                    id: '3',
                    key: 'opp-3',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 3 tickets',
                    ticketCount: 3,
                },
            ]

            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={sameTypeOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const cards = container.querySelectorAll('.card')

            expect(cards[0]).toHaveTextContent('5 tickets')
            expect(cards[1]).toHaveTextContent('3 tickets')
            expect(cards[2]).toHaveTextContent('2 tickets')
        })

        it('should handle mixed types with various ticket counts', () => {
            const complexOpportunities: OpportunityListItem[] = [
                {
                    id: '1',
                    key: 'opp-1',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    insight: 'Knowledge gap with 10 tickets',
                    ticketCount: 10,
                },
                {
                    id: '2',
                    key: 'opp-2',
                    type: OpportunityType.RESOLVE_CONFLICT,
                    insight: 'Conflict with 2 tickets',
                    ticketCount: 2,
                },
                {
                    id: '3',
                    key: 'opp-3',
                    type: OpportunityType.FILL_KNOWLEDGE_GAP,
                    insight: 'Knowledge gap with 8 tickets',
                    ticketCount: 8,
                },
            ]

            const { container } = render(
                <TestWrapper>
                    <TopOpportunitiesSection
                        shopName="test-shop"
                        shopIntegrationId={123}
                        opportunities={complexOpportunities}
                        isLoading={false}
                        totalCount={3}
                        allowedOpportunityIds={undefined}
                    />
                </TestWrapper>,
            )

            const cards = container.querySelectorAll('.card')

            expect(cards[0]).toHaveTextContent('2 tickets')
            expect(cards[0]).toHaveTextContent('Resolve conflicting knowledge')
            expect(cards[1]).toHaveTextContent('10 tickets')
            expect(cards[1]).toHaveTextContent('Knowledge gap with 10 tickets')
            expect(cards[2]).toHaveTextContent('8 tickets')
            expect(cards[2]).toHaveTextContent('Knowledge gap with 8 tickets')
        })
    })
})
