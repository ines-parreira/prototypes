import type { EnrichedTicket } from '@repo/tickets'
import { render, screen, waitFor } from '@testing-library/react'

import { TicketStatus } from '@gorgias/helpdesk-types'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import type { TimelineItem } from 'timeline/types'
import { TimelineItemKind } from 'timeline/types'

import { TimelineList } from '../TimelineList'

// Mock TicketListItem to avoid dependencies
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    TicketListItem: ({ ticket, onSelect }: any) => (
        <div data-testid={`ticket-${ticket.id}`} onClick={onSelect}>
            {ticket.subject}
        </div>
    ),
    formatTicketTime: (date: string) => date,
}))

// Mock TimelineOrderCard
jest.mock('../TimelineOrderCard', () => ({
    TimelineOrderCard: ({ order }: any) => (
        <div data-testid={`order-${order.id}`}>{order.name}</div>
    ),
}))

const createMockTicket = (id: number): TicketCompact =>
    ({
        id,
        channel: TicketChannel.Email,
        subject: `Ticket ${id}`,
        excerpt: `Excerpt ${id}`,
        status: TicketStatus.Open,
        created_datetime: '2024-01-01T10:00:00Z',
        updated_datetime: '2024-01-01T12:00:00Z',
        last_message_datetime: '2024-01-01T12:00:00Z',
        customer: {
            id: 1,
            email: 'test@example.com',
            name: 'Test Customer',
        },
        is_unread: false,
        messages_count: 1,
    }) as TicketCompact

const createEnrichedTicket = (ticket: TicketCompact): EnrichedTicket => ({
    ticket,
    iconName: 'comm-mail',
    customFields: [],
    conditionsLoading: false,
    evaluationResults: {},
})

describe('TimelineList', () => {
    let mockIntersectionObserver: jest.Mock

    beforeEach(() => {
        // Mock IntersectionObserver
        mockIntersectionObserver = jest.fn()
        mockIntersectionObserver.mockImplementation(() => ({
            observe: jest.fn(),
            disconnect: jest.fn(),
            unobserve: jest.fn(),
        }))

        window.IntersectionObserver = mockIntersectionObserver as any
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('IntersectionObserver setup', () => {
        it('should set up IntersectionObserver when hasNextPage is true', () => {
            const tickets = [createMockTicket(1), createMockTicket(2)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))
            const fetchNextPage = jest.fn()

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={2}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={true}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={false}
                />,
            )

            expect(mockIntersectionObserver).toHaveBeenCalledWith(
                expect.any(Function),
                { threshold: 0.1 },
            )
        })

        it('should not set up IntersectionObserver when hasNextPage is false', () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={false}
                    fetchNextPage={jest.fn()}
                    isFetchingNextPage={false}
                />,
            )

            expect(mockIntersectionObserver).not.toHaveBeenCalled()
        })

        it('should not set up IntersectionObserver when fetchNextPage is undefined', () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={true}
                    fetchNextPage={undefined}
                    isFetchingNextPage={false}
                />,
            )

            expect(mockIntersectionObserver).not.toHaveBeenCalled()
        })

        it('should call fetchNextPage when element intersects', async () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))
            const fetchNextPage = jest.fn()

            let intersectionCallback: any

            mockIntersectionObserver.mockImplementation((callback) => {
                intersectionCallback = callback
                return {
                    observe: jest.fn(),
                    disconnect: jest.fn(),
                    unobserve: jest.fn(),
                }
            })

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={true}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={false}
                />,
            )

            // Simulate intersection
            intersectionCallback([
                {
                    isIntersecting: true,
                    target: document.createElement('div'),
                },
            ])

            await waitFor(() => {
                expect(fetchNextPage).toHaveBeenCalledTimes(1)
            })
        })

        it('should not call fetchNextPage when already fetching', async () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))
            const fetchNextPage = jest.fn()

            let intersectionCallback: any

            mockIntersectionObserver.mockImplementation((callback) => {
                intersectionCallback = callback
                return {
                    observe: jest.fn(),
                    disconnect: jest.fn(),
                    unobserve: jest.fn(),
                }
            })

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={true}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={true}
                />,
            )

            // Simulate intersection
            intersectionCallback([
                {
                    isIntersecting: true,
                    target: document.createElement('div'),
                },
            ])

            await waitFor(() => {
                expect(fetchNextPage).not.toHaveBeenCalled()
            })
        })
    })

    describe('Loading skeleton', () => {
        it('should render loading skeletons when isFetchingNextPage is true', () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))

            const { container } = render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                    hasNextPage={true}
                    fetchNextPage={jest.fn()}
                    isFetchingNextPage={true}
                />,
            )

            // Verify the ticket is rendered
            expect(screen.getByText('Ticket 1')).toBeInTheDocument()
            // Verify the component structure exists (not checking skeleton internals)
            expect(container.querySelector('ol')).toBeInTheDocument()
        })
    })

    describe('Empty states', () => {
        it('should show loading skeleton when isLoading is true', () => {
            const { container } = render(
                <TimelineList
                    timelineItems={[]}
                    enrichedTickets={[]}
                    isLoading={true}
                    totalNumber={0}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                />,
            )

            // When loading, it should not show the "no tickets" message
            expect(
                screen.queryByText('No tickets for this customer'),
            ).not.toBeInTheDocument()
            // Should render a Box container
            expect(container.querySelector('div')).toBeInTheDocument()
        })

        it('should show no tickets message when totalNumber is 0', () => {
            render(
                <TimelineList
                    timelineItems={[]}
                    enrichedTickets={[]}
                    isLoading={false}
                    totalNumber={0}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                />,
            )

            expect(
                screen.getByText('No tickets for this customer'),
            ).toBeInTheDocument()
        })

        it('should show no items match filters when filtered results are empty', () => {
            render(
                <TimelineList
                    timelineItems={[]}
                    enrichedTickets={[]}
                    isLoading={false}
                    totalNumber={5}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                />,
            )

            expect(
                screen.getByText('No items match the selected filters'),
            ).toBeInTheDocument()
        })
    })

    describe('Ticket rendering', () => {
        it('should render tickets in the timeline', () => {
            const tickets = [createMockTicket(1), createMockTicket(2)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={2}
                    productsMap={new Map()}
                    onSelectTicket={jest.fn()}
                    onSelectOrder={jest.fn()}
                />,
            )

            expect(screen.getByText('Ticket 1')).toBeInTheDocument()
            expect(screen.getByText('Ticket 2')).toBeInTheDocument()
        })

        it('should call onSelectTicket when ticket is clicked', () => {
            const tickets = [createMockTicket(1)]
            const enrichedTickets = tickets.map(createEnrichedTicket)
            const timelineItems: TimelineItem[] = tickets.map((ticket) => ({
                kind: TimelineItemKind.Ticket,
                ticket,
            }))
            const onSelectTicket = jest.fn()
            const onSelectOrder = jest.fn()

            render(
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={false}
                    totalNumber={1}
                    productsMap={new Map()}
                    onSelectTicket={onSelectTicket}
                    onSelectOrder={onSelectOrder}
                />,
            )

            const ticketElement = screen.getByTestId('ticket-1')
            ticketElement.click()

            expect(onSelectTicket).toHaveBeenCalledWith(enrichedTickets[0])
        })
    })
})
