import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { ResourceType } from '../../types'
import { DetectedOpportunitiesBanner } from './DetectedOpportunitiesBanner'

// Mock dependencies
const mockOnRedirectToOpportunityPage = jest.fn()

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(),
}))

jest.mock(
    'pages/aiAgent/opportunities/hooks/useFindTopOpportunitiyByTickteId',
    () => ({
        useFindTopOpportunityByTicketId: jest.fn(),
    }),
)

jest.mock('pages/aiAgent/opportunities/hooks/useOpportunitiesTracking', () => ({
    useOpportunitiesTracking: jest.fn(() => ({
        onRedirectToOpportunityPage: mockOnRedirectToOpportunityPage,
        onOpportunityPageVisited: jest.fn(),
        onOpportunityViewed: jest.fn(),
        onOpportunityAccepted: jest.fn(),
        onOpportunityDismissed: jest.fn(),
    })),
}))

jest.mock(
    'pages/aiAgent/opportunities/components/OpportunityTicketDrillDownModal',
    () => ({
        OpportunityTicketDrillDownModal: ({
            isOpen,
            onClose,
        }: {
            isOpen: boolean
            onClose: () => void
        }) =>
            isOpen ? (
                <div data-testid="ticket-drill-down-modal">
                    <button onClick={onClose}>Close Modal</button>
                </div>
            ) : null,
    }),
)

describe('DetectedOpportunitiesBanner', () => {
    const {
        useAiAgentNavigation,
    } = require('pages/aiAgent/hooks/useAiAgentNavigation')
    const {
        useFindTopOpportunityByTicketId,
    } = require('pages/aiAgent/opportunities/hooks/useFindTopOpportunitiyByTickteId')

    const mockWindowOpen = jest.fn()
    const mockRoutes = {
        opportunitiesWithId: jest.fn((id: string) => `/opportunities/${id}`),
    }

    // Mock window.open
    beforeAll(() => {
        window.open = mockWindowOpen
    })

    const defaultProps = {
        shopName: 'Test Shop',
        shopIntegrationId: 123,
        ticketId: 456,
        isTopOpportunitiesEnabled: true,
    }

    const mockKnowledgeGapOpportunity: Opportunity = {
        id: '789',
        key: 'ks_789',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
        detectionObjectIds: ['1', '2', '3', '4', '5'],
        insight: 'Test insight for knowledge gap',
        resources: [],
    }

    const mockConflictOpportunity: Opportunity = {
        id: '999',
        key: 'ks_999',
        type: OpportunityType.RESOLVE_CONFLICT,
        ticketCount: 3,
        detectionObjectIds: ['6', '7', '8'],
        insight: 'Test conflict insight',
        resources: [
            {
                title: 'Resource 1',
                content: '<p>Content 1</p>',
                type: ResourceType.ARTICLE,
                isVisible: true,
                insight: 'First insight',
            },
            {
                title: 'Resource 2',
                content: '<p>Content 2</p>',
                type: ResourceType.ARTICLE,
                isVisible: false,
                insight: 'Second insight',
            },
        ],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useAiAgentNavigation.mockReturnValue({ routes: mockRoutes })
    })

    describe('Hook invocation', () => {
        it('should call useFindTopOpportunityByTicketId with correct parameters', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
            })

            render(<DetectedOpportunitiesBanner {...defaultProps} />)

            expect(useFindTopOpportunityByTicketId).toHaveBeenCalledWith(
                123,
                '456',
                {
                    query: {
                        enabled: true,
                        refetchOnWindowFocus: false,
                    },
                },
            )
        })

        it('should disable query when shopIntegrationId is not provided', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
            })

            render(
                <DetectedOpportunitiesBanner
                    {...defaultProps}
                    shopIntegrationId={undefined}
                />,
            )

            expect(useFindTopOpportunityByTicketId).toHaveBeenCalledWith(
                0,
                '456',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                    }),
                }),
            )
        })

        it('should disable query when ticketId is not provided', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
            })

            render(
                <DetectedOpportunitiesBanner {...defaultProps} ticketId={0} />,
            )

            expect(useFindTopOpportunityByTicketId).toHaveBeenCalledWith(
                123,
                '',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                    }),
                }),
            )
        })

        it('should disable query when isTopOpportunitiesEnabled is false', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
            })

            render(
                <DetectedOpportunitiesBanner
                    {...defaultProps}
                    isTopOpportunitiesEnabled={false}
                />,
            )

            expect(useFindTopOpportunityByTicketId).toHaveBeenCalledWith(
                123,
                '456',
                expect.objectContaining({
                    query: expect.objectContaining({
                        enabled: false,
                    }),
                }),
            )
        })
    })

    describe('Knowledge Gap opportunity rendering', () => {
        beforeEach(() => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: mockKnowledgeGapOpportunity,
                isLoading: false,
            })
        })

        it('should render knowledge gap title with insight', () => {
            render(<DetectedOpportunitiesBanner {...defaultProps} />)

            expect(
                screen.getByText(
                    /Review AI-generated guidance:.*"Test insight for knowledge gap"/,
                ),
            ).toBeInTheDocument()
        })

        it('should render Review guidance button', () => {
            render(<DetectedOpportunitiesBanner {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: /review guidance/i }),
            ).toBeInTheDocument()
        })

        it('should render ticket count for knowledge gap', () => {
            const { container } = render(
                <DetectedOpportunitiesBanner {...defaultProps} />,
            )

            expect(screen.getByText(/based on/i)).toBeInTheDocument()
            const ticketSpan = container.querySelector('.handoverTickets')
            expect(ticketSpan).toHaveTextContent('5 tickets')
            expect(
                screen.getByText(/AI Agent could not resolve/i),
            ).toBeInTheDocument()
        })

        it('should render singular ticket for count of 1', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: {
                    ...mockKnowledgeGapOpportunity,
                    ticketCount: 1,
                },
                isLoading: false,
            })

            const { container } = render(
                <DetectedOpportunitiesBanner {...defaultProps} />,
            )

            const ticketSpan = container.querySelector('.handoverTickets')
            expect(ticketSpan).toHaveTextContent('1 ticket')
        })
    })

    describe('Conflict opportunity rendering', () => {
        beforeEach(() => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: mockConflictOpportunity,
                isLoading: false,
            })
        })

        it('should render conflict title with resource insights', () => {
            render(<DetectedOpportunitiesBanner {...defaultProps} />)

            expect(
                screen.getByText(
                    /Resolve conflicting knowledge:.*"First insight".*and.*"Second insight"/,
                ),
            ).toBeInTheDocument()
        })

        it('should render Resolve conflict button', () => {
            render(<DetectedOpportunitiesBanner {...defaultProps} />)

            expect(
                screen.getByRole('button', { name: /resolve conflict/i }),
            ).toBeInTheDocument()
        })

        it('should render ticket count for conflict', () => {
            const { container } = render(
                <DetectedOpportunitiesBanner {...defaultProps} />,
            )

            expect(
                screen.getByText(/This conflict is impacting/i),
            ).toBeInTheDocument()
            const ticketSpan = container.querySelector('.handoverTickets')
            expect(ticketSpan).toHaveTextContent('3 tickets')
        })
    })

    describe('User interactions', () => {
        describe('Card click', () => {
            it('should open opportunity details in new tab on card click', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                render(<DetectedOpportunitiesBanner {...defaultProps} />)

                const button = screen.getByRole('button', {
                    name: /review guidance/i,
                })
                await user.click(button)

                expect(mockRoutes.opportunitiesWithId).toHaveBeenCalledWith(
                    '789',
                )
                expect(mockWindowOpen).toHaveBeenCalledWith(
                    '/opportunities/789',
                    '_blank',
                    'noopener,noreferrer',
                )
            })

            it('should track redirect to opportunity page when button is clicked', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                render(<DetectedOpportunitiesBanner {...defaultProps} />)

                const button = screen.getByRole('button', {
                    name: /review guidance/i,
                })
                await user.click(button)

                expect(mockOnRedirectToOpportunityPage).toHaveBeenCalledWith({
                    referrer: 'in-ticket-feedback-tab',
                })
            })

            it('should open in new tab for conflict opportunity', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockConflictOpportunity,
                    isLoading: false,
                })

                render(<DetectedOpportunitiesBanner {...defaultProps} />)

                const button = screen.getByRole('button', {
                    name: /resolve conflict/i,
                })
                await user.click(button)

                expect(mockRoutes.opportunitiesWithId).toHaveBeenCalledWith(
                    '999',
                )
                expect(mockWindowOpen).toHaveBeenCalledWith(
                    '/opportunities/999',
                    '_blank',
                    'noopener,noreferrer',
                )
            })
        })

        describe('Ticket count click', () => {
            it('should open modal when ticket count is clicked with detectionObjectIds', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)

                expect(
                    screen.getByTestId('ticket-drill-down-modal'),
                ).toBeInTheDocument()
            })

            it('should not open modal when detectionObjectIds is empty', async () => {
                const user = userEvent.setup()
                const consoleWarnSpy = jest
                    .spyOn(console, 'warn')
                    .mockImplementation()

                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: {
                        ...mockKnowledgeGapOpportunity,
                        detectionObjectIds: [],
                    },
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)

                expect(
                    screen.queryByTestId('ticket-drill-down-modal'),
                ).not.toBeInTheDocument()
                expect(consoleWarnSpy).toHaveBeenCalledWith(
                    'No detectionObjectIds available for opportunity:',
                    expect.any(Object),
                )

                consoleWarnSpy.mockRestore()
            })

            it('should not open modal when detectionObjectIds is undefined', async () => {
                const user = userEvent.setup()
                const consoleWarnSpy = jest
                    .spyOn(console, 'warn')
                    .mockImplementation()

                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: {
                        ...mockKnowledgeGapOpportunity,
                        detectionObjectIds: undefined,
                    },
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)

                expect(
                    screen.queryByTestId('ticket-drill-down-modal'),
                ).not.toBeInTheDocument()
                expect(consoleWarnSpy).toHaveBeenCalled()

                consoleWarnSpy.mockRestore()
            })

            it('should stop propagation when ticket count is clicked', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)

                // Modal should be open, meaning event didn't propagate to card click
                expect(
                    screen.getByTestId('ticket-drill-down-modal'),
                ).toBeInTheDocument()

                // New tab should not have been opened
                expect(mockWindowOpen).not.toHaveBeenCalled()
            })
        })

        describe('Modal interactions', () => {
            it('should close modal when close handler is called', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                // Open modal
                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)
                expect(
                    screen.getByTestId('ticket-drill-down-modal'),
                ).toBeInTheDocument()

                // Close modal
                const closeButton = screen.getByRole('button', {
                    name: /close modal/i,
                })
                await user.click(closeButton)

                expect(
                    screen.queryByTestId('ticket-drill-down-modal'),
                ).not.toBeInTheDocument()
            })

            it('should pass correct ticketIds to modal', async () => {
                const user = userEvent.setup()
                useFindTopOpportunityByTicketId.mockReturnValue({
                    topOpportunity: mockKnowledgeGapOpportunity,
                    isLoading: false,
                })

                const { container } = render(
                    <DetectedOpportunitiesBanner {...defaultProps} />,
                )

                const ticketCountSpan = container.querySelector(
                    '.handoverTickets',
                ) as HTMLElement
                await user.click(ticketCountSpan)

                // Modal should be rendered (ticketIds are passed as props but not directly testable here)
                expect(
                    screen.getByTestId('ticket-drill-down-modal'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Edge cases', () => {
        it('should not render cards when topOpportunity is null', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: null,
                isLoading: false,
            })

            const { container } = render(
                <DetectedOpportunitiesBanner {...defaultProps} />,
            )

            expect(
                container.querySelector('[data-name="card"]'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(/Review AI-generated guidance/i),
            ).not.toBeInTheDocument()
        })
    })

    describe('CSS classes', () => {
        it('should apply knowledgeGap class for knowledge gap opportunities', () => {
            useFindTopOpportunityByTicketId.mockReturnValue({
                topOpportunity: mockKnowledgeGapOpportunity,
                isLoading: false,
            })

            const { container } = render(
                <DetectedOpportunitiesBanner {...defaultProps} />,
            )

            const card = container.querySelector('[class*="card"]')
            expect(card).toHaveClass('knowledgeGap')
        })
    })
})
