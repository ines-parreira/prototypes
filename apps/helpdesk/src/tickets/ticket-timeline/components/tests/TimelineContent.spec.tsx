import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import type { IconName } from '@gorgias/axiom'
import type { CustomField, TicketCompact } from '@gorgias/helpdesk-types'
import { TicketStatus } from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useGetCustomer } from 'models/customer/queries'
import type { Customer } from 'models/customer/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'
import { useTicketList } from 'timeline/hooks/useTicketList'
import { TimelineItemKind } from 'timeline/types'
import type { FilterKey, InteractionFilterType } from 'timeline/types'

import { useOrderProducts } from '../../hooks/useOrderProducts'
import { useTimelineData } from '../../hooks/useTimelineData'
import type { ChannelToIconFn, SortOption } from '../../hooks/useTimelineData'
import { TimelineContent } from '../TimelineContent'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2MS2Flag: jest.fn(),
    useFlag: jest.fn(() => false),
    FeatureFlagKey: {
        TicketThreadRevamp: 'ticket_thread_revamp',
    },
}))

jest.mock('timeline/hooks/useTicketList', () => ({
    useTicketList: jest.fn(),
}))

jest.mock('tickets/ticket-detail/hooks/useTicket')
jest.mock('timeline/ticket-modal/hooks/useTicketModalContext')

jest.mock('models/customer/queries', () => ({
    ...jest.requireActual('models/customer/queries'),
    useGetCustomer: jest.fn(),
}))

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions', () => ({
    useCustomFieldDefinitions: jest.fn(),
}))

jest.mock('../../hooks/useTimelineData', () => ({
    useTimelineData: jest.fn(),
}))

jest.mock('../../hooks/useOrderProducts', () => ({
    useOrderProducts: jest.fn(),
}))

const useHelpdeskV2MS2FlagMock = assumeMock(useHelpdeskV2MS2Flag)
const useTicketListMock = assumeMock(useTicketList)
const useGetCustomerMock = assumeMock(useGetCustomer)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)
const useTimelineDataMock = assumeMock(useTimelineData)
const useOrderProductsMock = assumeMock(useOrderProducts)

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

const createMockCustomer = (overrides: Partial<Customer> = {}): Customer =>
    ({
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
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
        integrations: {},
        ...overrides,
    }) as Customer

const mockChannelToIcon: ChannelToIconFn = () => 'email' as IconName

const defaultTimelineDataReturn = {
    timelineItems: [],
    enrichedTickets: [],
    totalNumber: 0,
    isLoading: false,
    rangeFilter: { start: null, end: null },
    setRangeFilter: jest.fn(),
    setInteractionTypeFilters: jest.fn(),
    selectedStatusKeys: [
        TicketStatus.Open,
        TicketStatus.Closed,
        'snooze',
    ] as FilterKey[],
    selectedTypeKeys: ['ticket'] as InteractionFilterType[],
    toggleSelectedStatus: jest.fn(),
    sortOption: 'updated-desc' as SortOption,
    setSortOption: jest.fn(),
}

describe('TimelineContent', () => {
    const defaultProps = {
        shopperId: 1,
        activeTicketId: '123',
        channelToCommunicationIcon: mockChannelToIcon,
    }

    const renderComponent = (props = defaultProps) => {
        return renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineContent {...props} />
            </MemoryRouter>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()

        useHelpdeskV2MS2FlagMock.mockReturnValue(true)

        useTicketListMock.mockReturnValue({
            tickets: [],
            isLoading: false,
            isError: false,
        })

        useGetCustomerMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useGetCustomer>)

        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {
                data: [] as CustomField[],
                meta: {},
                object: 'Ticket',
                uri: '/api/custom-fields',
            },
            isLoading: false,
            isError: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        useTimelineDataMock.mockReturnValue(
            defaultTimelineDataReturn as unknown as ReturnType<
                typeof useTimelineData
            >,
        )

        useOrderProductsMock.mockReturnValue({
            products: new Map(),
            isLoading: false,
            isError: false,
            hasShopifyIntegration: false,
        })

        const { useTicket } = require('tickets/ticket-detail/hooks/useTicket')
        const {
            useTicketModalContext,
        } = require('timeline/ticket-modal/hooks/useTicketModalContext')

        useTicket.mockImplementation((ticketId: number) => {
            const subjectMap: Record<number, string> = {
                1: 'First Ticket',
                2: 'Second Ticket',
                3: 'Third Ticket',
                123: 'Active Ticket',
                456: 'Test Ticket For Expand',
            }
            return {
                body: [],
                isLoading: false,
                ticket: {
                    ...createMockTicket({
                        id: ticketId,
                        subject:
                            subjectMap[ticketId] || `Test Ticket ${ticketId}`,
                    }),
                    messages: [],
                    summary: {
                        content: 'Test summary',
                        created_datetime: '2024-01-01T10:00:00Z',
                        triggered_by: null,
                        updated_datetime: '2024-01-01T10:00:00Z',
                    },
                },
            }
        })

        useTicketModalContext.mockReturnValue({
            isInsideSidePanel: true,
        })
    })

    describe('Loading state', () => {
        it('should not show empty state when loading', () => {
            useTicketListMock.mockReturnValue({
                tickets: [],
                isLoading: true,
                isError: false,
            })

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                isLoading: true,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(
                screen.queryByText('No tickets for this customer'),
            ).not.toBeInTheDocument()
        })

        it('should not show filter empty state when loading', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                isLoading: true,
                totalNumber: 5,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(
                screen.queryByText('No items match the selected filters'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Customer header rendering', () => {
        it('should render customer name in header when customer data is available', () => {
            const customer = createMockCustomer({
                firstname: 'Jane',
                lastname: 'Smith',
            })

            useGetCustomerMock.mockReturnValue({
                data: { data: customer },
                isLoading: false,
                isError: false,
            } as ReturnType<typeof useGetCustomer>)

            renderComponent()

            expect(screen.getByText('Jane Smith Timeline')).toBeInTheDocument()
        })

        it('should render header without name when customer data is not available', () => {
            useGetCustomerMock.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: false,
            } as ReturnType<typeof useGetCustomer>)

            renderComponent()

            expect(screen.getByText('Customer timeline')).toBeInTheDocument()
        })
    })

    describe('Timeline filters rendering', () => {
        it('should render interaction type filter tag by default', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                selectedTypeKeys: [
                    'ticket',
                    'order',
                ] as InteractionFilterType[],
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(screen.getByText('All interactions')).toBeInTheDocument()
        })

        it('should render sort button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /arrow-down-up/i }),
            ).toBeInTheDocument()
        })

        it('should render filter button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /slider-filter/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Timeline list rendering', () => {
        it('should render timeline items when available', () => {
            const ticket = createMockTicket({
                id: 1,
                subject: 'Test Ticket Subject',
            })

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [{ kind: TimelineItemKind.Ticket, ticket }],
                enrichedTickets: [
                    {
                        ticket,
                        evaluationResults: {},
                        conditionsLoading: false,
                        customFields: [],
                        iconName: 'email' as IconName,
                    },
                ],
                totalNumber: 1,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(screen.getByText('Test Ticket Subject')).toBeInTheDocument()
        })

        it('should render empty state when no tickets exist', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [],
                enrichedTickets: [],
                totalNumber: 0,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(
                screen.getByText('No tickets for this customer'),
            ).toBeInTheDocument()
        })

        it('should render filter empty state when filters exclude all items', () => {
            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [],
                enrichedTickets: [],
                totalNumber: 5,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            expect(
                screen.getByText('No items match the selected filters'),
            ).toBeInTheDocument()
        })
    })

    describe('Ticket selection and side panel', () => {
        const setupWithTickets = () => {
            const ticket1 = createMockTicket({
                id: 1,
                subject: 'First Ticket',
            })
            const ticket2 = createMockTicket({
                id: 2,
                subject: 'Second Ticket',
            })
            const ticket3 = createMockTicket({
                id: 3,
                subject: 'Third Ticket',
            })

            const enrichedTickets = [
                {
                    ticket: ticket1,
                    evaluationResults: {},
                    conditionsLoading: false,
                    isFieldRequired: jest.fn(),
                    isFieldVisible: jest.fn(),
                    customFields: [],
                    iconName: 'email' as IconName,
                },
                {
                    ticket: ticket2,
                    evaluationResults: {},
                    conditionsLoading: false,
                    isFieldRequired: jest.fn(),
                    isFieldVisible: jest.fn(),
                    customFields: [],
                    iconName: 'email' as IconName,
                },
                {
                    ticket: ticket3,
                    evaluationResults: {},
                    conditionsLoading: false,
                    isFieldRequired: jest.fn(),
                    isFieldVisible: jest.fn(),
                    customFields: [],
                    iconName: 'email' as IconName,
                },
            ]

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [
                    { kind: TimelineItemKind.Ticket, ticket: ticket1 },
                    { kind: TimelineItemKind.Ticket, ticket: ticket2 },
                    { kind: TimelineItemKind.Ticket, ticket: ticket3 },
                ],
                enrichedTickets,
                totalNumber: 3,
            } as unknown as ReturnType<typeof useTimelineData>)

            return { ticket1, ticket2, ticket3, enrichedTickets }
        }

        it('should open side panel when a ticket is selected', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('First Ticket'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /first ticket/i }),
                ).toBeInTheDocument()
            })
        })

        it('should show navigation buttons in side panel', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('Second Ticket'))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /previous ticket/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /next ticket/i }),
                ).toBeInTheDocument()
            })
        })

        it('should navigate to next ticket when Next is clicked', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('First Ticket'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /first ticket/i }),
                ).toBeInTheDocument()
            })

            const nextButton = screen.getByRole('button', {
                name: /next ticket/i,
            })
            await user.click(nextButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /second ticket/i }),
                ).toBeInTheDocument()
            })
        })

        it('should navigate to previous ticket when Previous is clicked', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('Second Ticket'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /second ticket/i }),
                ).toBeInTheDocument()
            })

            const prevButton = screen.getByRole('button', {
                name: /previous ticket/i,
            })
            await user.click(prevButton)

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /first ticket/i }),
                ).toBeInTheDocument()
            })
        })

        it('should disable Previous button when first ticket is selected', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('First Ticket'))

            await waitFor(() => {
                const prevButton = screen.getByRole('button', {
                    name: /previous ticket/i,
                })
                expect(prevButton).toBeDisabled()
            })
        })

        it('should disable Next button when last ticket is selected', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('Third Ticket'))

            await waitFor(() => {
                const nextButton = screen.getByRole('button', {
                    name: /next ticket/i,
                })
                expect(nextButton).toBeDisabled()
            })
        })

        it('should close side panel when close button is clicked', async () => {
            const user = userEvent.setup()
            setupWithTickets()

            renderComponent()

            await user.click(screen.getByText('First Ticket'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /first ticket/i }),
                ).toBeInTheDocument()
            })

            const closeButton = screen.getByRole('button', {
                name: /close preview/i,
            })
            await user.click(closeButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: /first ticket/i }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Single ticket edge case', () => {
        it('should disable both navigation buttons when only one ticket exists', async () => {
            const user = userEvent.setup()
            const ticket = createMockTicket({
                id: 1,
                subject: 'Only Ticket',
            })

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [{ kind: TimelineItemKind.Ticket, ticket }],
                enrichedTickets: [
                    {
                        ticket,
                        evaluationResults: {},
                        conditionsLoading: false,
                        customFields: [],
                        iconName: 'email' as IconName,
                    },
                ],
                totalNumber: 1,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            await user.click(screen.getByText('Only Ticket'))

            await waitFor(() => {
                const prevButton = screen.getByRole('button', {
                    name: /previous ticket/i,
                })
                const nextButton = screen.getByRole('button', {
                    name: /next ticket/i,
                })
                expect(prevButton).toBeDisabled()
                expect(nextButton).toBeDisabled()
            })
        })
    })

    describe('Active ticket highlighting', () => {
        it('should pass activeTicketId to TimelineList', () => {
            const ticket = createMockTicket({
                id: 123,
                subject: 'Active Ticket',
            })

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [{ kind: TimelineItemKind.Ticket, ticket }],
                enrichedTickets: [
                    {
                        ticket,
                        evaluationResults: {},
                        conditionsLoading: false,
                        customFields: [],
                        iconName: 'email' as IconName,
                    },
                ],
                totalNumber: 1,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent({ ...defaultProps, activeTicketId: '123' })

            expect(screen.getByText('Active Ticket')).toBeInTheDocument()
        })
    })

    describe('Orders integration', () => {
        it('should extract orders from customer data', () => {
            const customer = createMockCustomer({
                integrations: {
                    shopify: {
                        __integration_type__: 'shopify' as any,
                        args: {},
                        headers: {},
                        origin: 'https://test.myshopify.com',
                        url: 'https://test.myshopify.com',
                        orders: [
                            {
                                id: 100,
                                name: '#1001',
                                line_items: [],
                                financial_status: 'paid',
                                fulfillment_status: null,
                                created_at: '2024-01-01T00:00:00Z',
                                updated_at: '2024-01-01T00:00:00Z',
                            },
                        ],
                    },
                } as any,
            })

            useGetCustomerMock.mockReturnValue({
                data: { data: customer },
                isLoading: false,
                isError: false,
            } as ReturnType<typeof useGetCustomer>)

            renderComponent()

            expect(useTimelineDataMock).toHaveBeenCalled()
        })
    })

    describe('Custom fields integration', () => {
        it('should fetch custom field definitions', () => {
            renderComponent()

            expect(useCustomFieldDefinitionsMock).toHaveBeenCalledWith({
                object_type: 'Ticket',
                archived: false,
                limit: 100,
            })
        })
    })

    describe('Expand ticket button', () => {
        it('should render expand ticket button in side panel', async () => {
            const user = userEvent.setup()
            const ticket = createMockTicket({
                id: 456,
                subject: 'Test Ticket For Expand',
            })

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [{ kind: TimelineItemKind.Ticket, ticket }],
                enrichedTickets: [
                    {
                        ticket,
                        evaluationResults: {},
                        conditionsLoading: false,
                        customFields: [],
                        iconName: 'email' as IconName,
                    },
                ],
                totalNumber: 1,
            } as unknown as ReturnType<typeof useTimelineData>)

            renderComponent()

            await user.click(screen.getByText('Test Ticket For Expand'))

            await waitFor(() => {
                const expandButton = screen.getByRole('button', {
                    name: /expand ticket/i,
                })
                expect(expandButton).toBeInTheDocument()
            })
        })
    })

    describe('Data flow', () => {
        it('should pass tickets from useTicketList to useTimelineData', () => {
            const tickets = [
                createMockTicket({ id: 1, subject: 'Ticket 1' }),
                createMockTicket({ id: 2, subject: 'Ticket 2' }),
            ]

            useTicketListMock.mockReturnValue({
                tickets,
                isLoading: false,
                isError: false,
            })

            renderComponent()

            expect(useTimelineDataMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    tickets,
                }),
            )
        })

        it('should pass channelToIcon function to useTimelineData', () => {
            renderComponent()

            expect(useTimelineDataMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelToIcon: mockChannelToIcon,
                }),
            )
        })
    })

    describe('Order selection and side panel', () => {
        const setupWithOrders = () => {
            const order1 = {
                id: 101,
                name: '#3519',
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                currency: 'USD',
                total_price: '150.00',
                financial_status: 'paid' as const,
                fulfillment_status: 'fulfilled' as const,
                line_items: [],
                note: '',
                tags: '',
                shipping_address: {} as any,
                billing_address: {} as any,
                discount_codes: [],
                shipping_lines: [],
                total_line_items_price: '150.00',
                total_discounts: '0.00',
                subtotal_price: '150.00',
                total_tax: '0.00',
                taxes_included: false,
                discount_applications: [],
                refunds: [],
            }

            const order2 = {
                id: 102,
                name: '#3520',
                created_at: '2024-01-02T10:00:00Z',
                updated_at: '2024-01-02T10:00:00Z',
                currency: 'USD',
                total_price: '200.00',
                financial_status: 'pending' as const,
                fulfillment_status: null,
                line_items: [],
                note: '',
                tags: '',
                shipping_address: {} as any,
                billing_address: {} as any,
                discount_codes: [],
                shipping_lines: [],
                total_line_items_price: '200.00',
                total_discounts: '0.00',
                subtotal_price: '200.00',
                total_tax: '0.00',
                taxes_included: false,
                discount_applications: [],
                refunds: [],
            }

            useTimelineDataMock.mockReturnValue({
                ...defaultTimelineDataReturn,
                timelineItems: [
                    { kind: TimelineItemKind.Order, order: order1 },
                    { kind: TimelineItemKind.Order, order: order2 },
                ],
                enrichedTickets: [],
                totalNumber: 2,
            } as unknown as ReturnType<typeof useTimelineData>)

            return { order1, order2 }
        }

        it('should open order side panel when order card is clicked', async () => {
            const user = userEvent.setup()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /order #3519/i }),
                ).toBeInTheDocument()
            })
        })

        it('should display order status tags in side panel', async () => {
            const user = userEvent.setup()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                const paidTags = screen.getAllByText('Paid')
                const fulfilledTags = screen.getAllByText('Fulfilled')
                expect(paidTags.length).toBeGreaterThan(0)
                expect(fulfilledTags.length).toBeGreaterThan(0)
            })
        })

        it('should display pending and unfulfilled status for pending order', async () => {
            const user = userEvent.setup()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3520'))

            await waitFor(() => {
                const pendingTags = screen.getAllByText('Pending')
                const unfulfilledTags = screen.getAllByText('Unfulfilled')
                expect(pendingTags.length).toBeGreaterThan(0)
                expect(unfulfilledTags.length).toBeGreaterThan(0)
            })
        })

        it('should display action buttons in order side panel', async () => {
            const user = userEvent.setup()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /duplicate/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /refund/i }),
                ).toBeInTheDocument()
                expect(
                    screen.getByRole('button', { name: /cancel/i }),
                ).toBeInTheDocument()
            })
        })

        it('should close order side panel when close button is clicked', async () => {
            const user = userEvent.setup()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('heading', { name: /order #3519/i }),
                ).toBeInTheDocument()
            })

            const closeButton = screen.getByRole('button', {
                name: /close preview/i,
            })
            await user.click(closeButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: /order #3519/i }),
                ).not.toBeInTheDocument()
            })
        })

        it('should log to console when duplicate button is clicked', async () => {
            const user = userEvent.setup()
            const consoleWarnSpy = jest
                .spyOn(console, 'warn')
                .mockImplementation()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /duplicate/i }),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /duplicate/i }))

            const calls = consoleWarnSpy.mock.calls
            const duplicateCall = calls.find(
                (call) => call[0] === 'Duplicate order:' && call[1] === '#3519',
            )
            expect(duplicateCall).toBeDefined()

            consoleWarnSpy.mockRestore()
        })

        it('should log to console when refund button is clicked', async () => {
            const user = userEvent.setup()
            const consoleWarnSpy = jest
                .spyOn(console, 'warn')
                .mockImplementation()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /refund/i }),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /refund/i }))

            const calls = consoleWarnSpy.mock.calls
            const refundCall = calls.find(
                (call) => call[0] === 'Refund order:' && call[1] === '#3519',
            )
            expect(refundCall).toBeDefined()

            consoleWarnSpy.mockRestore()
        })

        it('should log to console when cancel button is clicked', async () => {
            const user = userEvent.setup()
            const consoleWarnSpy = jest
                .spyOn(console, 'warn')
                .mockImplementation()
            setupWithOrders()

            renderComponent()

            await user.click(screen.getByText('#3519'))

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /cancel/i }),
                ).toBeInTheDocument()
            })

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            const calls = consoleWarnSpy.mock.calls
            const cancelCall = calls.find(
                (call) => call[0] === 'Cancel order:' && call[1] === '#3519',
            )
            expect(cancelCall).toBeDefined()

            consoleWarnSpy.mockRestore()
        })
    })
})
