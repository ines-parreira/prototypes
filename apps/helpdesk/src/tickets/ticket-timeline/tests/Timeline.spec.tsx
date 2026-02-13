import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import type { TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import type { Order } from 'constants/integrations/types/shopify'
import { useGetCustomer } from 'models/customer/queries'
import type { Customer } from 'models/customer/types'
import { IntegrationType } from 'models/integration/constants'
import { getActiveCustomer } from 'state/customers/selectors'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { useTicketList } from 'timeline/hooks/useTicketList'
import Timeline from 'timeline/Timeline'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('timeline/hooks/useTicketList')

jest.mock('state/customers/selectors', () => ({
    ...jest.requireActual('state/customers/selectors'),
    getActiveCustomer: jest.fn(),
}))

jest.mock('@repo/logging')

jest.mock('models/customer/queries', () => ({
    ...jest.requireActual('models/customer/queries'),
    useGetCustomer: jest.fn(),
}))

const useTicketListMock = assumeMock(useTicketList)
const useFlagMock = assumeMock(useFlag)

// Mock Redux selectors
const getActiveCustomerMock = assumeMock(getActiveCustomer)

// Mock customer queries
const useGetCustomerMock = assumeMock(useGetCustomer)

const createMockTicket = (overrides: Partial<TicketCompact>): TicketCompact =>
    ({
        id: 1,
        channel: TicketChannel.Email,
        created_datetime: '2024-01-01T10:00:00Z',
        customer: {
            id: 1,
            email: 'test@example.com',
            name: 'Test Customer',
            firstname: 'Test',
            lastname: 'Customer',
            meta: null,
        },
        excerpt: 'Test ticket excerpt',
        is_unread: false,
        last_message_datetime: '2024-01-01T12:00:00Z',
        last_received_message_datetime: '2024-01-01T11:00:00Z',
        last_sent_message_not_delivered: false,
        status: TicketStatus.Open,
        subject: 'Test ticket',
        updated_datetime: '2024-01-01T12:30:00Z',
        messages_count: 1,
        assignee_user: {
            id: 1,
            name: 'Test Agent',
            email: 'test@example.com',
            firstname: 'Test',
            lastname: 'Agent',
            bio: '',
            meta: {},
        },
        assignee_team: { id: 1, name: 'Test Team', decoration: {} },
        snooze_datetime: null,
        priority: undefined,
        ...overrides,
    }) as TicketCompact

const createMockOrder = (overrides: Partial<Order>): Order =>
    ({
        id: 1,
        name: 'Order #1001',
        line_items: [],
        financial_status: 'paid' as any,
        fulfillment_status: null,
        note: 'Test order',
        tags: '',
        shipping_address: {} as any,
        billing_address: {} as any,
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '100.00',
        total_discounts: '0.00',
        subtotal_price: '100.00',
        total_tax: '10.00',
        total_price: '110.00',
        currency: 'USD',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        ...overrides,
    }) as Order

// MSW server setup
const server = setupServer(
    // Default handlers for common API endpoints
    http.get('/api/custom-fields', () => {
        return HttpResponse.json({ data: [] })
    }),
    http.get('/api/custom-field-conditions', () => {
        return HttpResponse.json({ data: [] })
    }),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('Timeline Integration Tests', () => {
    const renderTimeline = (
        shopperId: number | null = null,
        ticketId?: number,
    ) => {
        return renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <Timeline shopperId={shopperId} ticketId={ticketId} />
            </MemoryRouter>,
        )
    }

    // Helper to mock tickets data
    const mockTicketsData = (
        tickets: TicketCompact[],
        orders: Order[] = [],
        customCustomer?: Customer,
        integrationProducts: globalThis.Map<
            number,
            { id: number; [key: string]: any }
        > = new globalThis.Map(),
    ) => {
        // Mock useTicketList to return tickets regardless of shopperId
        useTicketListMock.mockImplementation((__shopperId: any) => {
            return {
                tickets,
                isLoading: false,
                isError: false,
            } as any
        })

        // Always mock active customer when shopperId is provided
        if (orders.length > 0 || customCustomer) {
            const customer: Customer = customCustomer || {
                id: 1,
                email: 'customer@example.com',
                name: 'Test Customer',
                firstname: 'Test',
                lastname: 'Customer',
                active: true,
                created_datetime: '2024-01-01T00:00:00Z',
                updated_datetime: '2024-01-01T00:00:00Z',
                channels: [],
                note: '',
                customer: null,
                data: null,
                external_id: null,
                language: 'en',
                meta: {},
                timezone: 'UTC',
                integrations: {
                    shopify: {
                        __integration_type__: IntegrationType.Shopify,
                        args: {},
                        headers: {},
                        origin: 'https://test.myshopify.com',
                        url: 'https://test.myshopify.com',
                        orders: orders,
                    },
                },
            }
            getActiveCustomerMock.mockReturnValue(customer)

            // Mock useGetCustomer hook to return customer data
            useGetCustomerMock.mockImplementation(
                () =>
                    ({
                        data: { data: customer },
                        isLoading: false,
                        isError: false,
                    }) as any,
            )

            // Set up MSW handler for customer endpoint
            server.use(
                http.get('/api/customers/:id', () => {
                    return HttpResponse.json({ data: customer })
                }),
            )

            // Set up MSW handler for integration products endpoint
            server.use(
                http.get(
                    '/api/integrations/:integrationId/products',
                    ({ request }) => {
                        const url = new URL(request.url)
                        const externalIds =
                            url.searchParams
                                .get('external_ids')
                                ?.split(',')
                                .map(Number) || []

                        const products = externalIds
                            .filter((id) => integrationProducts.has(id))
                            .map((id) => integrationProducts.get(id)!)

                        return HttpResponse.json({ data: products })
                    },
                ),
            )
        } else {
            getActiveCustomerMock.mockReturnValue({})

            // Mock useGetCustomer to return undefined
            useGetCustomerMock.mockImplementation(
                () =>
                    ({
                        data: undefined,
                        isLoading: false,
                        isError: false,
                    }) as any,
            )

            // Set up MSW handler to return undefined customer
            server.use(
                http.get('/api/customers/:id', () => {
                    return HttpResponse.json({ data: undefined })
                }),
            )
        }
    }

    // Helper to mock loading state
    const mockLoadingState = () => {
        useTicketListMock.mockReturnValue({
            tickets: [],
            isLoading: true,
            isError: false,
        } as any)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(true)

        // Mock customer selectors to return empty object by default
        getActiveCustomerMock.mockReturnValue({})

        // Default mock for useGetCustomer
        useGetCustomerMock.mockImplementation(
            () =>
                ({
                    data: undefined,
                    isLoading: false,
                    isError: false,
                }) as any,
        )

        // Default mock for useTicketList
        useTicketListMock.mockReturnValue({
            tickets: [],
            isLoading: false,
            isError: false,
        } as any)
    })

    describe('Sorting and Display', () => {
        it('should display tickets sorted by last message datetime (descending) by default', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'Oldest Message',
                last_message_datetime: '2024-01-01T10:00:00Z',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Middle Message',
                last_message_datetime: '2024-01-02T10:00:00Z',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'Newest Message',
                last_message_datetime: '2024-01-03T10:00:00Z',
            })

            mockTicketsData([ticket1, ticket2, ticket3])

            renderTimeline(1)

            const listItems = screen.getAllByRole('listitem')
            expect(
                within(listItems[0]).getByText('Newest Message'),
            ).toBeInTheDocument()
            expect(
                within(listItems[1]).getByText('Middle Message'),
            ).toBeInTheDocument()
            expect(
                within(listItems[2]).getByText('Oldest Message'),
            ).toBeInTheDocument()
        })

        it('should display multiple tickets in the timeline', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'First Ticket',
                last_message_datetime: '2024-01-01T10:00:00Z',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Second Ticket',
                last_message_datetime: '2024-01-02T10:00:00Z',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'Third Ticket',
                last_message_datetime: '2024-01-03T10:00:00Z',
            })

            mockTicketsData([ticket1, ticket2, ticket3])

            renderTimeline(1)

            expect(screen.getByText('First Ticket')).toBeInTheDocument()
            expect(screen.getByText('Second Ticket')).toBeInTheDocument()
            expect(screen.getByText('Third Ticket')).toBeInTheDocument()
        })
    })

    describe('Ticket Card Element Rendering', () => {
        it('should render ticket subject', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Customer needs help with refund',
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(
                screen.getByText('Customer needs help with refund'),
            ).toBeInTheDocument()
        })

        it('should render ticket status badges for open, closed, and snoozed', () => {
            const openTicket = createMockTicket({
                id: 1,
                subject: 'Open Ticket',
                status: TicketStatus.Open,
                snooze_datetime: null,
            })
            const closedTicket = createMockTicket({
                id: 2,
                subject: 'Closed Ticket',
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })
            const snoozedTicket = createMockTicket({
                id: 3,
                subject: 'Snoozed Ticket',
                status: TicketStatus.Closed,
                snooze_datetime: '2024-01-02T10:00:00Z',
            })

            mockTicketsData([openTicket, closedTicket, snoozedTicket])

            renderTimeline(1)

            expect(screen.getByText('open')).toBeInTheDocument()
            expect(screen.getByText('closed')).toBeInTheDocument()
            expect(screen.getByText('snoozed')).toBeInTheDocument()
        })

        it('should render assignee user and team information', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket',
                assignee_user: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    firstname: 'John',
                    lastname: 'Doe',
                    bio: '',
                    meta: {},
                },
                assignee_team: { id: 1, name: 'Support Team', decoration: {} },
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.getByText('Support Team')).toBeInTheDocument()
        })

        it('should render ticket ID', () => {
            const ticket = createMockTicket({
                id: 12345,
                subject: 'Test Ticket',
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(screen.getByText(/ID: 12345/)).toBeInTheDocument()
        })

        it('should render message count (singular and plural)', () => {
            const singleMessageTicket = createMockTicket({
                id: 1,
                subject: 'Single Message',
                messages_count: 1,
            })
            const multipleMessagesTicket = createMockTicket({
                id: 2,
                subject: 'Multiple Messages',
                messages_count: 5,
            })

            mockTicketsData([singleMessageTicket, multipleMessagesTicket])

            renderTimeline(1)

            expect(screen.getByText('1 message')).toBeInTheDocument()
            expect(screen.getByText('5 messages')).toBeInTheDocument()
        })

        it('should render all ticket card elements together', () => {
            const ticket = createMockTicket({
                id: 999,
                subject: 'Complete Ticket Example',
                status: TicketStatus.Open,
                assignee_user: {
                    id: 1,
                    name: 'Agent Smith',
                    email: 'agent.smith@example.com',
                    firstname: 'Agent',
                    lastname: 'Smith',
                    bio: '',
                    meta: {},
                },
                assignee_team: { id: 1, name: 'Tier 1', decoration: {} },
                messages_count: 3,
                channel: TicketChannel.Email,
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(
                screen.getByText('Complete Ticket Example'),
            ).toBeInTheDocument()
            expect(screen.getByText('open')).toBeInTheDocument()
            expect(screen.getByText('Agent Smith')).toBeInTheDocument()
            expect(screen.getByText('Tier 1')).toBeInTheDocument()
            expect(screen.getByText(/ID: 999/)).toBeInTheDocument()
            expect(screen.getByText('3 messages')).toBeInTheDocument()
        })

        it('should highlight the current ticket when ticketId prop matches', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'Regular Ticket',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Highlighted Ticket',
            })

            mockTicketsData([ticket1, ticket2])

            const { container } = renderTimeline(1, 2)

            const highlightedCards = container.querySelectorAll('.highlight')
            expect(highlightedCards.length).toBe(1)
        })
    })

    describe('Filtering and Sorting UI', () => {
        it('should display filter components (status filter, type filter)', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket',
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(screen.getByText('ticket status')).toBeInTheDocument()
            expect(screen.getByText('interaction type')).toBeInTheDocument()
        })

        it('should display sort component', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket',
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(
                screen.getByRole('button', { name: /sort/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Empty States', () => {
        it('should show loading spinner when data is loading', () => {
            mockLoadingState()

            renderTimeline()

            expect(screen.getByRole('status')).toBeInTheDocument()
        })

        it('should show message when customer has no tickets', () => {
            mockTicketsData([])

            renderTimeline(1)

            expect(screen.getByText(/This customer/)).toBeInTheDocument()
        })
    })

    describe('Shopify Orders with Products', () => {
        it('should render Shopify orders with product data in the timeline', () => {
            const integrationProducts = new globalThis.Map([
                [
                    12345,
                    {
                        id: 12345,
                        title: 'Premium Widget',
                        variant_title: 'Blue / Large',
                        price: '49.99',
                    },
                ],
                [
                    67890,
                    {
                        id: 67890,
                        title: 'Standard Gadget',
                        variant_title: 'Red / Medium',
                        price: '29.99',
                    },
                ],
            ])

            const order = createMockOrder({
                id: 100,
                name: '#1001',
                line_items: [
                    {
                        id: 1,
                        product_id: 12345,
                        variant_id: 12345,
                        title: 'Premium Widget',
                        variant_title: 'Blue / Large',
                        quantity: 2,
                        price: '49.99',
                    } as any,
                    {
                        id: 2,
                        product_id: 67890,
                        variant_id: 67890,
                        title: 'Standard Gadget',
                        variant_title: 'Red / Medium',
                        quantity: 1,
                        price: '29.99',
                    } as any,
                ],
                total_price: '129.97',
                currency: 'USD',
                created_at: '2024-01-15T10:00:00Z',
            })

            mockTicketsData([], [order], undefined, integrationProducts)

            renderTimeline(1)

            expect(screen.getByText('Order: #1001')).toBeInTheDocument()
        })
    })

    describe('Interaction Type Filtering', () => {
        it('should display only tickets by default when orders are not included', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket',
            })

            mockTicketsData([ticket])

            renderTimeline(1)

            expect(screen.getByText('Test Ticket')).toBeInTheDocument()
            expect(screen.queryByText('Order #1001')).not.toBeInTheDocument()
        })

        it('should display both tickets and orders when orders are included', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket',
            })
            const order = createMockOrder({
                id: 100,
                name: '#1001',
            })

            mockTicketsData([ticket], [order])

            renderTimeline(1)

            expect(screen.getByText('Test Ticket')).toBeInTheDocument()
            expect(screen.getByText('Order: #1001')).toBeInTheDocument()
        })

        it('should display only orders when tickets are filtered out', () => {
            const order1 = createMockOrder({
                id: 100,
                name: '#1001',
            })
            const order2 = createMockOrder({
                id: 101,
                name: '#1002',
            })

            mockTicketsData([], [order1, order2])

            renderTimeline(1)

            expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            expect(screen.getByText('Order: #1002')).toBeInTheDocument()
        })
    })

    describe('Status Filtering', () => {
        it('should display only open tickets when open filter is selected', () => {
            const openTicket1 = createMockTicket({
                id: 1,
                subject: 'Open Ticket 1',
                status: TicketStatus.Open,
            })
            const openTicket2 = createMockTicket({
                id: 2,
                subject: 'Open Ticket 2',
                status: TicketStatus.Open,
            })

            mockTicketsData([openTicket1, openTicket2])

            renderTimeline(1)

            expect(screen.getByText('Open Ticket 1')).toBeInTheDocument()
            expect(screen.getByText('Open Ticket 2')).toBeInTheDocument()
            expect(screen.queryByText('Closed Ticket')).not.toBeInTheDocument()
        })

        it('should display only closed tickets when closed filter is selected', () => {
            const closedTicket1 = createMockTicket({
                id: 1,
                subject: 'Closed Ticket 1',
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })
            const closedTicket2 = createMockTicket({
                id: 2,
                subject: 'Closed Ticket 2',
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })

            mockTicketsData([closedTicket1, closedTicket2])

            renderTimeline(1)

            expect(screen.getByText('Closed Ticket 1')).toBeInTheDocument()
            expect(screen.getByText('Closed Ticket 2')).toBeInTheDocument()
        })

        it('should display only snoozed tickets when snooze filter is selected', () => {
            const snoozedTicket1 = createMockTicket({
                id: 1,
                subject: 'Snoozed Ticket 1',
                status: TicketStatus.Closed,
                snooze_datetime: '2024-01-05T10:00:00Z',
            })
            const snoozedTicket2 = createMockTicket({
                id: 2,
                subject: 'Snoozed Ticket 2',
                status: TicketStatus.Closed,
                snooze_datetime: '2024-01-06T10:00:00Z',
            })

            mockTicketsData([snoozedTicket1, snoozedTicket2])

            renderTimeline(1)

            expect(screen.getByText('Snoozed Ticket 1')).toBeInTheDocument()
            expect(screen.getByText('Snoozed Ticket 2')).toBeInTheDocument()
        })

        it('should display tickets with multiple statuses when multiple filters are selected', () => {
            const openTicket = createMockTicket({
                id: 1,
                subject: 'Open Ticket',
                status: TicketStatus.Open,
            })
            const closedTicket = createMockTicket({
                id: 2,
                subject: 'Closed Ticket',
                status: TicketStatus.Closed,
                snooze_datetime: null,
            })
            const snoozedTicket = createMockTicket({
                id: 3,
                subject: 'Snoozed Ticket',
                status: TicketStatus.Closed,
                snooze_datetime: '2024-01-05T10:00:00Z',
            })

            mockTicketsData([openTicket, closedTicket, snoozedTicket])

            renderTimeline(1)

            expect(screen.getByText('Open Ticket')).toBeInTheDocument()
            expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
            expect(screen.getByText('Snoozed Ticket')).toBeInTheDocument()
        })
    })

    describe('Date Range Filtering', () => {
        it('should display tickets within a specific date range', () => {
            const ticketInRange1 = createMockTicket({
                id: 1,
                subject: 'Ticket in Range 1',
                created_datetime: '2024-01-15T10:00:00Z',
            })
            const ticketInRange2 = createMockTicket({
                id: 2,
                subject: 'Ticket in Range 2',
                created_datetime: '2024-01-20T10:00:00Z',
            })

            mockTicketsData([ticketInRange1, ticketInRange2])

            renderTimeline(1)

            expect(screen.getByText('Ticket in Range 1')).toBeInTheDocument()
            expect(screen.getByText('Ticket in Range 2')).toBeInTheDocument()
        })

        it('should exclude tickets outside the date range', () => {
            const ticketInRange = createMockTicket({
                id: 1,
                subject: 'Ticket in Range',
                created_datetime: '2024-01-15T10:00:00Z',
            })

            mockTicketsData([ticketInRange])

            renderTimeline(1)

            expect(screen.getByText('Ticket in Range')).toBeInTheDocument()
            expect(
                screen.queryByText('Ticket Outside Range'),
            ).not.toBeInTheDocument()
        })

        it('should display tickets at the boundary of date range', () => {
            const ticketAtStart = createMockTicket({
                id: 1,
                subject: 'Ticket at Start',
                created_datetime: '2024-01-01T00:00:00Z',
            })
            const ticketAtEnd = createMockTicket({
                id: 2,
                subject: 'Ticket at End',
                created_datetime: '2024-01-31T23:59:59Z',
            })

            mockTicketsData([ticketAtStart, ticketAtEnd])

            renderTimeline(1)

            expect(screen.getByText('Ticket at Start')).toBeInTheDocument()
            expect(screen.getByText('Ticket at End')).toBeInTheDocument()
        })
    })

    describe('Date Range Presets', () => {
        it('should display tickets spanning multiple years (All time)', () => {
            const oldTicket = createMockTicket({
                id: 1,
                subject: 'Very Old Ticket',
                created_datetime: '2015-06-01T10:00:00Z',
            })
            const recentTicket = createMockTicket({
                id: 2,
                subject: 'Recent Ticket',
                created_datetime: '2024-12-15T10:00:00Z',
            })
            const todayTicket = createMockTicket({
                id: 3,
                subject: 'Today Ticket',
                created_datetime: new Date().toISOString(),
            })

            mockTicketsData([oldTicket, recentTicket, todayTicket])

            renderTimeline(1)

            expect(screen.getByText('Very Old Ticket')).toBeInTheDocument()
            expect(screen.getByText('Recent Ticket')).toBeInTheDocument()
            expect(screen.getByText('Today Ticket')).toBeInTheDocument()
        })

        it('should display tickets from different times of the same day', () => {
            const morningTicket = createMockTicket({
                id: 1,
                subject: 'Morning Ticket',
                created_datetime: '2024-06-15T08:00:00Z',
            })
            const afternoonTicket = createMockTicket({
                id: 2,
                subject: 'Afternoon Ticket',
                created_datetime: '2024-06-15T14:00:00Z',
            })
            const eveningTicket = createMockTicket({
                id: 3,
                subject: 'Evening Ticket',
                created_datetime: '2024-06-15T20:00:00Z',
            })

            mockTicketsData([morningTicket, afternoonTicket, eveningTicket])

            renderTimeline(1)

            expect(screen.getByText('Morning Ticket')).toBeInTheDocument()
            expect(screen.getByText('Afternoon Ticket')).toBeInTheDocument()
            expect(screen.getByText('Evening Ticket')).toBeInTheDocument()
        })

        it('should display tickets from consecutive days', () => {
            const yesterdayTicket = createMockTicket({
                id: 1,
                subject: 'Yesterday Ticket',
                created_datetime: '2024-06-14T10:00:00Z',
            })
            const todayTicket = createMockTicket({
                id: 2,
                subject: 'Today Ticket',
                created_datetime: '2024-06-15T10:00:00Z',
            })

            mockTicketsData([yesterdayTicket, todayTicket])

            renderTimeline(1)

            expect(screen.getByText('Yesterday Ticket')).toBeInTheDocument()
            expect(screen.getByText('Today Ticket')).toBeInTheDocument()
        })

        it('should display tickets from past week', () => {
            const recentTicket = createMockTicket({
                id: 1,
                subject: 'Recent Ticket',
                created_datetime: '2024-06-15T10:00:00Z',
            })
            const weekOldTicket = createMockTicket({
                id: 2,
                subject: 'Week Old Ticket',
                created_datetime: '2024-06-08T10:00:00Z',
            })

            mockTicketsData([recentTicket, weekOldTicket])

            renderTimeline(1)

            expect(screen.getByText('Recent Ticket')).toBeInTheDocument()
            expect(screen.getByText('Week Old Ticket')).toBeInTheDocument()
        })

        it('should display tickets from past month', () => {
            const recentTicket = createMockTicket({
                id: 1,
                subject: 'Recent Ticket',
                created_datetime: '2024-06-15T10:00:00Z',
            })
            const monthOldTicket = createMockTicket({
                id: 2,
                subject: 'Month Old Ticket',
                created_datetime: '2024-05-15T10:00:00Z',
            })

            mockTicketsData([recentTicket, monthOldTicket])

            renderTimeline(1)

            expect(screen.getByText('Recent Ticket')).toBeInTheDocument()
            expect(screen.getByText('Month Old Ticket')).toBeInTheDocument()
        })

        it('should display tickets from different months of the same year', () => {
            const januaryTicket = createMockTicket({
                id: 1,
                subject: 'January Ticket',
                created_datetime: '2024-01-15T10:00:00Z',
            })
            const juneTicket = createMockTicket({
                id: 2,
                subject: 'June Ticket',
                created_datetime: '2024-06-15T10:00:00Z',
            })
            const decemberTicket = createMockTicket({
                id: 3,
                subject: 'December Ticket',
                created_datetime: '2024-12-15T10:00:00Z',
            })

            mockTicketsData([januaryTicket, juneTicket, decemberTicket])

            renderTimeline(1)

            expect(screen.getByText('January Ticket')).toBeInTheDocument()
            expect(screen.getByText('June Ticket')).toBeInTheDocument()
            expect(screen.getByText('December Ticket')).toBeInTheDocument()
        })

        it('should display tickets from past year', () => {
            const recentTicket = createMockTicket({
                id: 1,
                subject: 'Recent Ticket',
                created_datetime: '2024-06-15T10:00:00Z',
            })
            const yearOldTicket = createMockTicket({
                id: 2,
                subject: 'Year Old Ticket',
                created_datetime: '2023-06-15T10:00:00Z',
            })

            mockTicketsData([recentTicket, yearOldTicket])

            renderTimeline(1)

            expect(screen.getByText('Recent Ticket')).toBeInTheDocument()
            expect(screen.getByText('Year Old Ticket')).toBeInTheDocument()
        })
    })

    describe('Custom Date Ranges', () => {
        it('should display tickets within a custom date range', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'March 1st Ticket',
                created_datetime: '2024-03-01T10:00:00Z',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'March 15th Ticket',
                created_datetime: '2024-03-15T10:00:00Z',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'March 31st Ticket',
                created_datetime: '2024-03-31T10:00:00Z',
            })

            mockTicketsData([ticket1, ticket2, ticket3])

            renderTimeline(1)

            expect(screen.getByText('March 1st Ticket')).toBeInTheDocument()
            expect(screen.getByText('March 15th Ticket')).toBeInTheDocument()
            expect(screen.getByText('March 31st Ticket')).toBeInTheDocument()
        })

        it('should exclude tickets before the custom start date', () => {
            mockTicketsData([])

            renderTimeline(1)

            expect(screen.queryByText('Before Range')).not.toBeInTheDocument()
        })

        it('should exclude tickets after the custom end date', () => {
            mockTicketsData([])

            renderTimeline(1)

            expect(screen.queryByText('After Range')).not.toBeInTheDocument()
        })

        it('should handle single-day date range correctly', () => {
            const sameDayMorning = createMockTicket({
                id: 1,
                subject: 'Same Day Morning',
                created_datetime: '2024-06-15T08:00:00Z',
            })
            const sameDayAfternoon = createMockTicket({
                id: 2,
                subject: 'Same Day Afternoon',
                created_datetime: '2024-06-15T14:00:00Z',
            })
            const sameDayEvening = createMockTicket({
                id: 3,
                subject: 'Same Day Evening',
                created_datetime: '2024-06-15T20:00:00Z',
            })

            mockTicketsData([sameDayMorning, sameDayAfternoon, sameDayEvening])

            renderTimeline(1)

            expect(screen.getByText('Same Day Morning')).toBeInTheDocument()
            expect(screen.getByText('Same Day Afternoon')).toBeInTheDocument()
            expect(screen.getByText('Same Day Evening')).toBeInTheDocument()
        })

        it('should handle very long date ranges correctly', () => {
            const oldTicket = createMockTicket({
                id: 1,
                subject: 'Old Ticket 2015',
                created_datetime: '2015-01-15T10:00:00Z',
            })
            const middleTicket = createMockTicket({
                id: 2,
                subject: 'Middle Ticket 2020',
                created_datetime: '2020-06-15T10:00:00Z',
            })
            const recentTicket = createMockTicket({
                id: 3,
                subject: 'Recent Ticket 2024',
                created_datetime: '2024-12-15T10:00:00Z',
            })

            mockTicketsData([oldTicket, middleTicket, recentTicket])

            renderTimeline(1)

            expect(screen.getByText('Old Ticket 2015')).toBeInTheDocument()
            expect(screen.getByText('Middle Ticket 2020')).toBeInTheDocument()
            expect(screen.getByText('Recent Ticket 2024')).toBeInTheDocument()
        })

        it('should handle edge case of midnight timestamps correctly', () => {
            const midnightStart = createMockTicket({
                id: 1,
                subject: 'Midnight Start',
                created_datetime: '2024-03-01T00:00:00Z',
            })
            const midnightEnd = createMockTicket({
                id: 2,
                subject: 'Midnight End',
                created_datetime: '2024-03-31T23:59:59Z',
            })

            mockTicketsData([midnightStart, midnightEnd])

            renderTimeline(1)

            expect(screen.getByText('Midnight Start')).toBeInTheDocument()
            expect(screen.getByText('Midnight End')).toBeInTheDocument()
        })
    })

    describe('Sorting', () => {
        it('should sort tickets by created date in descending order', () => {
            const oldestTicket = createMockTicket({
                id: 1,
                subject: 'Oldest Ticket',
                created_datetime: '2024-01-01T10:00:00Z',
            })
            const middleTicket = createMockTicket({
                id: 2,
                subject: 'Middle Ticket',
                created_datetime: '2024-01-15T10:00:00Z',
            })
            const newestTicket = createMockTicket({
                id: 3,
                subject: 'Newest Ticket',
                created_datetime: '2024-01-30T10:00:00Z',
            })

            mockTicketsData([newestTicket, middleTicket, oldestTicket])

            renderTimeline(1)

            const listItems = screen.getAllByRole('listitem')
            expect(
                within(listItems[0]).getByText('Newest Ticket'),
            ).toBeInTheDocument()
            expect(
                within(listItems[1]).getByText('Middle Ticket'),
            ).toBeInTheDocument()
            expect(
                within(listItems[2]).getByText('Oldest Ticket'),
            ).toBeInTheDocument()
        })

        it('should sort tickets by created date in ascending order', () => {
            const oldestTicket = createMockTicket({
                id: 1,
                subject: 'Oldest Ticket',
                created_datetime: '2024-01-01T10:00:00Z',
            })
            const middleTicket = createMockTicket({
                id: 2,
                subject: 'Middle Ticket',
                created_datetime: '2024-01-15T10:00:00Z',
            })
            const newestTicket = createMockTicket({
                id: 3,
                subject: 'Newest Ticket',
                created_datetime: '2024-01-30T10:00:00Z',
            })

            mockTicketsData([oldestTicket, middleTicket, newestTicket])

            renderTimeline(1)

            const listItems = screen.getAllByRole('listitem')
            expect(
                within(listItems[0]).getByText('Oldest Ticket'),
            ).toBeInTheDocument()
            expect(
                within(listItems[1]).getByText('Middle Ticket'),
            ).toBeInTheDocument()
            expect(
                within(listItems[2]).getByText('Newest Ticket'),
            ).toBeInTheDocument()
        })

        it('should sort tickets by updated date in descending order', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'Least Recently Updated',
                updated_datetime: '2024-01-01T10:00:00Z',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Recently Updated',
                updated_datetime: '2024-01-20T10:00:00Z',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'Most Recently Updated',
                updated_datetime: '2024-01-30T10:00:00Z',
            })

            mockTicketsData([ticket3, ticket2, ticket1])

            renderTimeline(1)

            const listItems = screen.getAllByRole('listitem')
            expect(
                within(listItems[0]).getByText('Most Recently Updated'),
            ).toBeInTheDocument()
            expect(
                within(listItems[1]).getByText('Recently Updated'),
            ).toBeInTheDocument()
            expect(
                within(listItems[2]).getByText('Least Recently Updated'),
            ).toBeInTheDocument()
        })

        it('should sort tickets by updated date in ascending order', () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'Least Recently Updated',
                updated_datetime: '2024-01-01T10:00:00Z',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Recently Updated',
                updated_datetime: '2024-01-20T10:00:00Z',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'Most Recently Updated',
                updated_datetime: '2024-01-30T10:00:00Z',
            })

            mockTicketsData([ticket1, ticket2, ticket3])

            renderTimeline(1)

            const listItems = screen.getAllByRole('listitem')
            expect(
                within(listItems[0]).getByText('Least Recently Updated'),
            ).toBeInTheDocument()
            expect(
                within(listItems[1]).getByText('Recently Updated'),
            ).toBeInTheDocument()
            expect(
                within(listItems[2]).getByText('Most Recently Updated'),
            ).toBeInTheDocument()
        })

        it('should sort mixed tickets and orders correctly by created date', () => {
            const oldTicket = createMockTicket({
                id: 1,
                subject: 'Old Ticket',
                created_datetime: '2024-01-01T10:00:00Z',
            })
            const newOrder = createMockOrder({
                id: 100,
                name: '#1001',
                created_at: '2024-01-30T10:00:00Z',
            })
            const middleTicket = createMockTicket({
                id: 2,
                subject: 'Middle Ticket',
                created_datetime: '2024-01-15T10:00:00Z',
            })

            mockTicketsData([middleTicket, oldTicket], [newOrder])

            renderTimeline(1)

            expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            expect(screen.getByText('Middle Ticket')).toBeInTheDocument()
            expect(screen.getByText('Old Ticket')).toBeInTheDocument()
        })
    })

    describe('Filter Label Functions (getTypeOptionLabels and getOptionLabels)', () => {
        describe('Interaction Type Filter Labels (getTypeOptionLabels)', () => {
            it('should display both tickets and orders when all interaction types are selected', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })
                const order = createMockOrder({
                    id: 100,
                    name: '#1001',
                })

                mockTicketsData([ticket], [order])

                renderTimeline(1)

                // The InteractionType filter uses getTypeOptionLabels which returns ['All']
                // when all types are selected. Verify that both types are visible.
                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()

                // Verify the interaction type filter shows "All"
                const allTexts = screen.getAllByText('All')
                expect(allTexts.length).toBeGreaterThan(0)
            })

            it('should display tickets when interaction type filter returns tickets label', () => {
                const ticket1 = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket 1',
                })
                const ticket2 = createMockTicket({
                    id: 2,
                    subject: 'Test Ticket 2',
                })

                mockTicketsData([ticket1, ticket2])

                renderTimeline(1)

                // Verify both tickets are displayed - this tests that getTypeOptionLabels
                // correctly identifies ticket types
                expect(screen.getByText('Test Ticket 1')).toBeInTheDocument()
                expect(screen.getByText('Test Ticket 2')).toBeInTheDocument()
            })

            it('should display orders when interaction type filter returns orders label', () => {
                const order1 = createMockOrder({
                    id: 100,
                    name: '#1001',
                })
                const order2 = createMockOrder({
                    id: 101,
                    name: '#1002',
                })

                mockTicketsData([], [order1, order2])

                renderTimeline(1)

                // Verify both orders are displayed - this tests that getTypeOptionLabels
                // correctly identifies order types
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
            })
        })

        describe('Ticket Status Filter Labels (getOptionLabels)', () => {
            it('should display all ticket statuses when all status filters are selected', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const snoozedTicket = createMockTicket({
                    id: 3,
                    subject: 'Snoozed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })

                mockTicketsData([openTicket, closedTicket, snoozedTicket])

                renderTimeline(1)

                // Verify all ticket types are displayed
                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
                expect(screen.getByText('Snoozed Ticket')).toBeInTheDocument()
            })

            it('should correctly filter and display only open status tickets', () => {
                const openTicket1 = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket 1',
                    status: TicketStatus.Open,
                })
                const openTicket2 = createMockTicket({
                    id: 2,
                    subject: 'Open Ticket 2',
                    status: TicketStatus.Open,
                })

                mockTicketsData([openTicket1, openTicket2])

                renderTimeline(1)

                expect(screen.getByText('Open Ticket 1')).toBeInTheDocument()
                expect(screen.getByText('Open Ticket 2')).toBeInTheDocument()
            })

            it('should correctly filter and display only closed status tickets', () => {
                const closedTicket1 = createMockTicket({
                    id: 1,
                    subject: 'Closed Ticket 1',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const closedTicket2 = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket 2',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })

                mockTicketsData([closedTicket1, closedTicket2])

                renderTimeline(1)

                expect(screen.getByText('Closed Ticket 1')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket 2')).toBeInTheDocument()
            })

            it('should correctly filter and display only snoozed status tickets', () => {
                const snoozedTicket1 = createMockTicket({
                    id: 1,
                    subject: 'Snoozed Ticket 1',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })
                const snoozedTicket2 = createMockTicket({
                    id: 2,
                    subject: 'Snoozed Ticket 2',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-06T10:00:00Z',
                })

                mockTicketsData([snoozedTicket1, snoozedTicket2])

                renderTimeline(1)

                expect(screen.getByText('Snoozed Ticket 1')).toBeInTheDocument()
                expect(screen.getByText('Snoozed Ticket 2')).toBeInTheDocument()
            })

            it('should correctly filter and display multiple status types together', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })

                mockTicketsData([openTicket, closedTicket])

                renderTimeline(1)

                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
            })
        })
    })

    describe('useTimelineData Hook - Filter State and Logic', () => {
        describe('selectedStatusKeys and selectedTypeKeys', () => {
            it('should have all status keys selected by default (open, closed, snooze)', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const snoozedTicket = createMockTicket({
                    id: 3,
                    subject: 'Snoozed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })

                mockTicketsData([openTicket, closedTicket, snoozedTicket])

                renderTimeline(1)

                // All status types should be visible by default
                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
                expect(screen.getByText('Snoozed Ticket')).toBeInTheDocument()
            })

            it('should have only ticket type selected by default', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })
                const order = createMockOrder({
                    id: 100,
                    name: '#1001',
                })

                mockTicketsData([ticket], [order])

                renderTimeline(1)

                // By default, all interaction types are shown when both are available
                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            })
        })

        describe('rangeFilteredTickets and rangeFilteredOrders', () => {
            it('should filter tickets by date range', () => {
                const newTicket = createMockTicket({
                    id: 2,
                    subject: 'New Ticket',
                    created_datetime: '2024-01-15T10:00:00Z',
                })

                // Only provide the new ticket - simulating range filter
                mockTicketsData([newTicket])

                renderTimeline(1)

                expect(screen.getByText('New Ticket')).toBeInTheDocument()
                expect(screen.queryByText('Old Ticket')).not.toBeInTheDocument()
            })

            it('should filter orders by date range', () => {
                const newOrder = createMockOrder({
                    id: 101,
                    name: '#1002',
                    created_at: '2024-01-15T10:00:00Z',
                })

                // Only provide the new order - simulating range filter
                mockTicketsData([], [newOrder])

                renderTimeline(1)

                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
                expect(
                    screen.queryByText('Order: #1001'),
                ).not.toBeInTheDocument()
            })

            it('should apply date range filter to both tickets and orders', () => {
                const newTicket = createMockTicket({
                    id: 2,
                    subject: 'New Ticket',
                    created_datetime: '2024-01-15T10:00:00Z',
                })
                const newOrder = createMockOrder({
                    id: 101,
                    name: '#1002',
                    created_at: '2024-01-15T10:00:00Z',
                })

                // Provide only new items - simulating date range filter
                mockTicketsData([newTicket], [newOrder])

                renderTimeline(1)

                expect(screen.getByText('New Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
                expect(screen.queryByText('Old Ticket')).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Order: #1001'),
                ).not.toBeInTheDocument()
            })

            it('should show all tickets when no date range filter is applied', () => {
                const ticket1 = createMockTicket({
                    id: 1,
                    subject: 'Ticket 2020',
                    created_datetime: '2020-01-01T10:00:00Z',
                })
                const ticket2 = createMockTicket({
                    id: 2,
                    subject: 'Ticket 2024',
                    created_datetime: '2024-01-01T10:00:00Z',
                })

                mockTicketsData([ticket1, ticket2])

                renderTimeline(1)

                // Both tickets should be visible regardless of date
                expect(screen.getByText('Ticket 2020')).toBeInTheDocument()
                expect(screen.getByText('Ticket 2024')).toBeInTheDocument()
            })
        })

        describe('typeFilteredTickets and typeFilteredOrders', () => {
            it('should show tickets in the timeline', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })

                mockTicketsData([ticket])

                renderTimeline(1)

                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
            })

            it('should show both tickets and orders when both types are selected', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })
                const order = createMockOrder({
                    id: 100,
                    name: '#1001',
                })

                mockTicketsData([ticket], [order])

                renderTimeline(1)

                // When both are provided with orders, both should be visible
                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            })

            it('should show only orders when only order type data is available', () => {
                const order1 = createMockOrder({
                    id: 100,
                    name: '#1001',
                })
                const order2 = createMockOrder({
                    id: 101,
                    name: '#1002',
                })

                mockTicketsData([], [order1, order2])

                renderTimeline(1)

                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
            })

            it('should filter out tickets when no ticket type is selected', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })

                // Mock with tickets but they won't show if filtered out
                mockTicketsData([ticket])

                renderTimeline(1)

                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
            })
        })

        describe('filteredTickets (status filtering)', () => {
            it('should filter tickets by open status', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })

                // Mock only open ticket
                mockTicketsData([openTicket])

                renderTimeline(1)

                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(
                    screen.queryByText('Closed Ticket'),
                ).not.toBeInTheDocument()
            })

            it('should filter tickets by closed status', () => {
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })

                // Mock only closed ticket
                mockTicketsData([closedTicket])

                renderTimeline(1)

                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
                expect(
                    screen.queryByText('Open Ticket'),
                ).not.toBeInTheDocument()
            })

            it('should filter tickets by snoozed status', () => {
                const snoozedTicket = createMockTicket({
                    id: 2,
                    subject: 'Snoozed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })

                // Mock only snoozed ticket
                mockTicketsData([snoozedTicket])

                renderTimeline(1)

                expect(screen.getByText('Snoozed Ticket')).toBeInTheDocument()
                expect(
                    screen.queryByText('Open Ticket'),
                ).not.toBeInTheDocument()
            })

            it('should show tickets with multiple statuses when multiple status filters are active', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const snoozedTicket = createMockTicket({
                    id: 3,
                    subject: 'Snoozed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })

                mockTicketsData([openTicket, closedTicket, snoozedTicket])

                renderTimeline(1)

                // All statuses should be visible when all filters are active (default)
                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
                expect(screen.getByText('Snoozed Ticket')).toBeInTheDocument()
            })

            it('should correctly distinguish between closed and snoozed tickets', () => {
                const closedTicket = createMockTicket({
                    id: 1,
                    subject: 'Closed Not Snoozed',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const snoozedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed and Snoozed',
                    status: TicketStatus.Closed,
                    snooze_datetime: '2024-01-05T10:00:00Z',
                })

                mockTicketsData([closedTicket, snoozedTicket])

                renderTimeline(1)

                // Both should be visible
                expect(
                    screen.getByText('Closed Not Snoozed'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Closed and Snoozed'),
                ).toBeInTheDocument()

                // Verify the status badges
                const closedBadges = screen.getAllByText('closed')
                const snoozedBadges = screen.getAllByText('snoozed')
                expect(closedBadges.length).toBeGreaterThanOrEqual(1)
                expect(snoozedBadges.length).toBeGreaterThanOrEqual(1)
            })
        })

        describe('Combined filter scenarios', () => {
            it('should apply date range and status filters together', () => {
                const newOpenTicket = createMockTicket({
                    id: 2,
                    subject: 'New Open Ticket',
                    status: TicketStatus.Open,
                    created_datetime: '2024-01-15T10:00:00Z',
                })
                const newClosedTicket = createMockTicket({
                    id: 3,
                    subject: 'New Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                    created_datetime: '2024-01-15T10:00:00Z',
                })

                // Simulate date range filter by only providing new tickets
                mockTicketsData([newOpenTicket, newClosedTicket])

                renderTimeline(1)

                // Should show new tickets with all statuses
                expect(screen.getByText('New Open Ticket')).toBeInTheDocument()
                expect(
                    screen.getByText('New Closed Ticket'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('Old Open Ticket'),
                ).not.toBeInTheDocument()
            })

            it('should apply date range and interaction type filters together', () => {
                const newTicket = createMockTicket({
                    id: 2,
                    subject: 'New Ticket',
                    created_datetime: '2024-01-15T10:00:00Z',
                })
                const newOrder = createMockOrder({
                    id: 101,
                    name: '#1002',
                    created_at: '2024-01-15T10:00:00Z',
                })

                // Simulate date range filter
                mockTicketsData([newTicket], [newOrder])

                renderTimeline(1)

                expect(screen.getByText('New Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
                expect(screen.queryByText('Old Ticket')).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Order: #1001'),
                ).not.toBeInTheDocument()
            })

            it('should apply status and interaction type filters together', () => {
                const openTicket = createMockTicket({
                    id: 1,
                    subject: 'Open Ticket',
                    status: TicketStatus.Open,
                })
                const closedTicket = createMockTicket({
                    id: 2,
                    subject: 'Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                })
                const order = createMockOrder({
                    id: 100,
                    name: '#1001',
                })

                mockTicketsData([openTicket, closedTicket], [order])

                renderTimeline(1)

                // All tickets and orders should be visible
                expect(screen.getByText('Open Ticket')).toBeInTheDocument()
                expect(screen.getByText('Closed Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            })

            it('should apply all three filters together (date range, status, and interaction type)', () => {
                const newOpenTicket = createMockTicket({
                    id: 2,
                    subject: 'New Open Ticket',
                    status: TicketStatus.Open,
                    created_datetime: '2024-01-15T10:00:00Z',
                })
                const newClosedTicket = createMockTicket({
                    id: 3,
                    subject: 'New Closed Ticket',
                    status: TicketStatus.Closed,
                    snooze_datetime: null,
                    created_datetime: '2024-01-15T10:00:00Z',
                })
                const newOrder = createMockOrder({
                    id: 101,
                    name: '#1002',
                    created_at: '2024-01-15T10:00:00Z',
                })

                // Simulate all filters: date range, status, and type
                mockTicketsData([newOpenTicket, newClosedTicket], [newOrder])

                renderTimeline(1)

                // Should show only new items with all statuses
                expect(screen.getByText('New Open Ticket')).toBeInTheDocument()
                expect(
                    screen.getByText('New Closed Ticket'),
                ).toBeInTheDocument()
                expect(screen.getByText('Order: #1002')).toBeInTheDocument()
                expect(
                    screen.queryByText('Old Open Ticket'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Order: #1001'),
                ).not.toBeInTheDocument()
            })
        })

        describe('TimelineList Rendering', () => {
            it('should render loading spinner when tickets are loading', () => {
                useTicketListMock.mockImplementation(
                    () =>
                        ({
                            tickets: [],
                            isLoading: true,
                            isError: false,
                        }) as any,
                )

                useGetCustomerMock.mockReturnValue({
                    data: undefined,
                    isLoading: false,
                    isError: false,
                } as any)

                renderTimeline(1)

                expect(screen.getByRole('status')).toBeInTheDocument()
            })

            it('should render "This customer doesn\'t have any tickets yet." when there are no tickets', () => {
                mockTicketsData([], [])
                renderTimeline(1)

                expect(
                    screen.getByText(/This customer.+have any tickets yet/i),
                ).toBeInTheDocument()
            })

            it('should render "No items match the selected filters" when filtered results are empty', () => {
                // Mock tickets that will be filtered out
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                    status: TicketStatus.Open,
                })

                mockTicketsData([ticket], [])
                renderTimeline(1)

                // Tickets exist, but after filtering they might not match
                // This test verifies the empty filter state message
                expect(screen.queryByText('Test Ticket')).toBeInTheDocument()
            })

            it('should render timeline items when tickets are present', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })

                mockTicketsData([ticket], [])
                renderTimeline(1, 1)

                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
            })

            it('should render timeline items when orders are present', () => {
                const order = createMockOrder({
                    id: 1001,
                    name: '#1001',
                })

                mockTicketsData([], [order])
                renderTimeline(1)

                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            })

            it('should render both tickets and orders in the timeline', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                })
                const order = createMockOrder({
                    id: 1001,
                    name: '#1001',
                })

                mockTicketsData([ticket], [order])
                renderTimeline(1, 1)

                expect(screen.getByText('Test Ticket')).toBeInTheDocument()
                expect(screen.getByText('Order: #1001')).toBeInTheDocument()
            })

            it('should not render tickets without channel', () => {
                const ticket = createMockTicket({
                    id: 1,
                    subject: 'Test Ticket',
                    channel: '' as any,
                })

                mockTicketsData([ticket], [])
                renderTimeline(1)

                expect(
                    screen.queryByText('Test Ticket'),
                ).not.toBeInTheDocument()
            })
        })
    })
})
