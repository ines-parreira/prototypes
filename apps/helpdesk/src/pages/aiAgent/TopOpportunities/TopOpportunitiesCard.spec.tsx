import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { OpportunityType } from '../opportunities/enums'
import type { OpportunityListItem } from '../opportunities/types'
import { TopOpportunityCard } from './TopOpportunitiesCard'

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
            opportunitiesWithId: (id: string) =>
                `/ai-agent/shopify/test-shop/opportunities?selected=${id}`,
        },
    })),
}))

jest.mock('pages/aiAgent/opportunities/hooks/useEnrichedOpportunity', () => ({
    useEnrichedOpportunity: jest.fn(() => ({
        data: {
            resources: [{ insight: 'Insight 1' }, { insight: 'Insight 2' }],
            detectionObjectIds: ['123', '456', '789'],
        },
        isLoading: false,
    })),
}))

jest.mock(
    'pages/aiAgent/opportunities/components/OpportunityTicketDrillDownModal',
    () => ({
        OpportunityTicketDrillDownModal: () => <div>Mock Ticket Modal</div>,
    }),
)

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

const mockKnowledgeGapOpportunity: OpportunityListItem = {
    id: '1',
    key: 'opp-1',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    insight: 'Add guidance for shipping policy',
    ticketCount: 5,
}

const mockConflictOpportunity: OpportunityListItem = {
    id: '2',
    key: 'opp-2',
    type: OpportunityType.RESOLVE_CONFLICT,
    insight: 'Resolve conflicting return policy information',
    ticketCount: 10,
}

describe('TopOpportunityCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Knowledge Gap Opportunity', () => {
        it('should render knowledge gap card with correct title', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText(/Review AI-generated guidance/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
        })

        it('should display ticket count correctly', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(screen.getByText(/5 tickets/i)).toBeInTheDocument()
            expect(
                screen.getByText(/AI Agent could not resolve/i),
            ).toBeInTheDocument()
        })

        it('should render review guidance button', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByRole('button', { name: /review guidance/i }),
            ).toBeInTheDocument()
        })

        it('should display inline insight for knowledge gap', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText(/Add guidance for shipping policy/),
            ).toBeInTheDocument()
        })
    })

    describe('Conflict Opportunity', () => {
        it('should render conflict card with correct title', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockConflictOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText(/Resolve conflicting knowledge/),
            ).toBeInTheDocument()
        })

        it('should display ticket count with correct plural form', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockConflictOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(screen.getByText(/10 tickets/i)).toBeInTheDocument()
            expect(
                screen.getByText(/This conflict is impacting/i),
            ).toBeInTheDocument()
        })

        it('should render resolve conflict button', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockConflictOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByRole('button', { name: /resolve conflict/i }),
            ).toBeInTheDocument()
        })

        it('should display conflict insight in title', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockConflictOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(
                screen.getByText(
                    /Resolve conflicting return policy information/,
                ),
            ).toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        it('should navigate to opportunity detail page when button is clicked', async () => {
            const user = userEvent.setup()

            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            const button = screen.getByRole('button', {
                name: /review guidance/i,
            })
            await user.click(button)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/ai-agent/shopify/test-shop/opportunities?selected=1',
                )
            })
        })

        it('should handle singular ticket count correctly', () => {
            const singleTicketOpp: OpportunityListItem = {
                ...mockKnowledgeGapOpportunity,
                ticketCount: 1,
            }

            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={singleTicketOpp}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(screen.getByText(/1 ticket/i)).toBeInTheDocument()
            expect(screen.queryByText(/1 tickets/i)).not.toBeInTheDocument()
        })

        it('should open ticket drill down modal when ticket count is clicked', async () => {
            const user = userEvent.setup()

            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            const ticketCountSpan = screen.getByText(/5 tickets/i)
            await user.click(ticketCountSpan)

            await waitFor(() => {
                expect(
                    screen.getByText('Mock Ticket Modal'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Restricted Opportunities', () => {
        it('should show "Upgrade plan" button when opportunity is restricted', () => {
            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={true}
                        totalRestrictedOpportunities={5}
                    />
                </TestWrapper>,
            )

            const button = screen.getByRole('button', {
                name: /upgrade plan/i,
            })
            expect(button).toBeInTheDocument()
            expect(button).not.toBeDisabled()
        })

        it('should show tooltip content with totalRestrictedOpportunities when restricted', async () => {
            const user = userEvent.setup()

            const { container } = render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={true}
                        totalRestrictedOpportunities={7}
                    />
                </TestWrapper>,
            )

            // Find the card div and hover over it
            const cardDiv = container.querySelector('.card')
            expect(cardDiv).toBeInTheDocument()

            // Simulate hover
            if (cardDiv) {
                await user.hover(cardDiv)
            }

            // The tooltip should show the number of restricted opportunities
            await waitFor(() => {
                expect(
                    screen.getByText(/Upgrade to access 7 more/),
                ).toBeInTheDocument()
            })
        })

        it('should not show tooltip when not restricted', async () => {
            const user = userEvent.setup()

            const { container } = render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            const cardDiv = container.querySelector('.card')
            if (cardDiv) {
                await user.hover(cardDiv)
            }

            // Should not show restricted tooltip
            expect(
                screen.queryByText(/Upgrade to access/),
            ).not.toBeInTheDocument()
        })

        it('should apply restricted CSS class when isRestricted is true', () => {
            const { container } = render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={true}
                        totalRestrictedOpportunities={5}
                    />
                </TestWrapper>,
            )

            const cardDiv = container.querySelector('.card.restricted')
            expect(cardDiv).toBeInTheDocument()
        })
    })

    describe('Hover State', () => {
        it('should manage hover state correctly', async () => {
            const user = userEvent.setup()

            const { container } = render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={true}
                        totalRestrictedOpportunities={5}
                    />
                </TestWrapper>,
            )

            const cardDiv = container.querySelector('.card')
            expect(cardDiv).toBeInTheDocument()

            if (cardDiv) {
                // Hover over the card
                await user.hover(cardDiv)

                // Tooltip should be visible
                await waitFor(() => {
                    expect(
                        screen.getByText(/Upgrade to access 5 more/),
                    ).toBeInTheDocument()
                })

                // Unhover
                await user.unhover(cardDiv)

                // Tooltip should disappear
                await waitFor(() => {
                    expect(
                        screen.queryByText(/Upgrade to access 5 more/),
                    ).not.toBeInTheDocument()
                })
            }
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing ticket count', () => {
            const noTicketCountOpp: OpportunityListItem = {
                ...mockKnowledgeGapOpportunity,
                ticketCount: undefined,
            }

            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={noTicketCountOpp}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={true}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(screen.getByText(/0 tickets/i)).toBeInTheDocument()
        })

        it('should not fetch enriched opportunity when feature is disabled', () => {
            const useEnrichedOpportunity =
                require('pages/aiAgent/opportunities/hooks/useEnrichedOpportunity').useEnrichedOpportunity

            render(
                <TestWrapper>
                    <TopOpportunityCard
                        opportunity={mockKnowledgeGapOpportunity}
                        shopName="test-shop"
                        shopIntegrationId={123}
                        isTopOpportunitiesEnabled={false}
                        isRestricted={false}
                        totalRestrictedOpportunities={undefined}
                    />
                </TestWrapper>,
            )

            expect(useEnrichedOpportunity).toHaveBeenCalledWith(
                123,
                1,
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                    }),
                }),
            )
        })
    })
})
