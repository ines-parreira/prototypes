vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn().mockReturnValue(false),
}))

import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'

import {
    mockCustomer,
    mockGetCurrentUserHandler,
    mockGetCustomerHandler,
    mockGetTicketHandler,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockListIntegrationsHandler,
    mockListPhoneNumbersHandler,
    mockSearchCustomersHandler,
    mockSearchCustomersResponse,
    mockTicket,
    mockTicketCustomer,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type {
    CustomerHighlightDataItem,
    TicketCustomerChannel,
} from '@gorgias/helpdesk-types'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { InfobarTicketCustomerDetails } from '../InfobarTicketCustomerDetails'

const ticketId = '123'
const customerId = 456

const mockTicketCustomerData = mockTicketCustomer({
    id: customerId,
    name: 'John Doe',
    email: 'john@example.com',
    channels: [],
})

const mockSimilarCustomerData = mockCustomer({
    id: 789,
    name: 'Jane Doe',
    email: 'jane@example.com',
    channels: [],
})

const ticket = mockTicket({
    id: Number(ticketId),
    customer: mockTicketCustomerData,
})

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(ticket),
)

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockUser()),
)

const mockGetCustomer = mockGetCustomerHandler(async () =>
    HttpResponse.json(
        mockCustomer({
            id: mockTicketCustomerData.id,
            name: mockTicketCustomerData.name,
            email: mockTicketCustomerData.email,
            channels: mockTicketCustomerData.channels,
        }),
    ),
)

const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json(mockListCustomFieldsResponse({ data: [] })),
)

const mockListCustomerFieldsValues = mockListCustomerCustomFieldsValuesHandler(
    async () =>
        HttpResponse.json(
            mockListCustomerCustomFieldsValuesResponse({ data: [] }),
        ),
)

const mockUpdateTicket = mockUpdateTicketHandler(async () =>
    HttpResponse.json(ticket),
)

const mockSearchCustomers = mockSearchCustomersHandler()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
        currentUser: {
            id: 123,
        },
    } as Window['GORGIAS_STATE']
    server.use(
        mockGetTicket.handler,
        mockGetCustomer.handler,
        mockGetCurrentUser.handler,
        mockListCustomFields.handler,
        mockListCustomerFieldsValues.handler,
        mockListIntegrationsHandler().handler,
        mockListPhoneNumbersHandler().handler,
        mockUpdateTicket.handler,
        mockSearchCustomers.handler,
        http.get(`/api/customers/${customerId}/similar/`, () => {
            return new HttpResponse(null, { status: 404 })
        }),
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    onEditCustomer: vi.fn(),
    onSyncToShopify: vi.fn(),
    hasShopifyIntegration: false,
    ticketId,
}

const waitUntilLoaded = async () => {
    await waitFor(() => {
        expect(
            screen.getByRole('link', { name: 'John Doe' }),
        ).toBeInTheDocument()
    })
}

describe('InfobarTicketCustomerDetails', () => {
    it('renders header and fields skeletons while the ticket is loading', async () => {
        server.use(
            mockGetTicketHandler(async () => {
                await delay('infinite')
                return HttpResponse.json(ticket)
            }).handler,
        )

        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitFor(() => {
            expect(
                screen.getAllByLabelText('Loading').length,
            ).toBeGreaterThanOrEqual(2 + 5 * 2)
        })
        expect(
            screen.queryByRole('link', { name: 'John Doe' }),
        ).not.toBeInTheDocument()
    })

    it('hides skeletons once the ticket data resolves', async () => {
        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        expect(
            await screen.findByRole('link', { name: 'John Doe' }),
        ).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })
    })

    it('should render InfobarTicketCustomerHeader with customer data', async () => {
        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitUntilLoaded()
    })

    it('renders full customer data for base customer fields', async () => {
        server.use(
            mockGetCustomerHandler(async () =>
                HttpResponse.json(
                    mockCustomer({
                        id: mockTicketCustomerData.id,
                        email: mockTicketCustomerData.email,
                        channels: [
                            {
                                id: 1,
                                address: 'updated@example.com',
                                type: 'email',
                                preferred: true,
                            } as TicketCustomerChannel,
                        ],
                        name: 'Updated Customer Name',
                    }),
                ),
            ).handler,
        )

        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        expect(
            await screen.findByRole('link', {
                name: 'Updated Customer Name',
            }),
        ).toBeInTheDocument()
        expect(
            await screen.findByText('updated@example.com'),
        ).toBeInTheDocument()
    })

    it('should render InfobarCustomerFields', async () => {
        const { container } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitFor(() => {
            const overflowList = container.querySelector(
                '[data-name="overflow-list"]',
            )
            expect(overflowList).toBeInTheDocument()
        })
    })

    it('should render DuplicateCustomer when similar customer exists and is not loading', async () => {
        server.use(
            http.get(`/api/customers/${customerId}/similar/`, () => {
                return HttpResponse.json(mockSimilarCustomerData)
            }),
        )

        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitUntilLoaded()

        await waitFor(() => {
            expect(
                screen.getByText('Potential duplicate customer found'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByRole('button', { name: 'View customer' }),
        ).toBeInTheDocument()
    })

    it('should not render DuplicateCustomer when similar customer does not exist', async () => {
        server.use(
            http.get(`/api/customers/${customerId}/similar/`, () => {
                return HttpResponse.json(null)
            }),
        )

        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitUntilLoaded()

        expect(
            screen.queryByText('Potential duplicate customer found'),
        ).not.toBeInTheDocument()
    })

    it('should open SidePanel when clicking "View customer" in DuplicateCustomer', async () => {
        server.use(
            http.get(`/api/customers/${customerId}/similar/`, () => {
                return HttpResponse.json(mockSimilarCustomerData)
            }),
        )

        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await waitFor(() => {
            expect(
                screen.getByText('Potential duplicate customer found'),
            ).toBeInTheDocument()
        })

        const viewCustomerButton = screen.getByRole('button', {
            name: 'View customer',
        })

        await user.click(viewCustomerButton)
        await screen.findByRole('button', {
            name: 'Back to previous screen',
        })

        expect(
            screen.getByRole('button', { name: 'Switch customer' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('heading', { name: 'Jane Doe' }),
        ).toBeInTheDocument()
    })

    it('should open SearchAndPreviewCustomersPanel when clicking merge menu item', async () => {
        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await user.click(
            screen.getByRole('button', {
                name: 'Search for customers to merge or switch',
            }),
        )

        await waitFor(() => {
            expect(screen.getByText('Search customers')).toBeInTheDocument()
        })
    })

    it('should open confirmation modal when clicking "Switch customer" button', async () => {
        const searchResult: CustomerHighlightDataItem = {
            entity: mockCustomer({
                id: 999,
                name: 'Antonio Lopez',
                email: 'antonio@example.com',
                channels: [],
            }) as any,
            highlights: {
                name: ['Antonio Lopez'],
            },
        }

        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [searchResult],
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await user.click(
            screen.getByRole('button', {
                name: 'Search for customers to merge or switch',
            }),
        )

        await screen.findByText('Search customers')

        const searchInput = await screen.findByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Antonio')

        await screen.findByText(/Antonio Lopez/)

        const switchCustomerButton = await screen.findByRole('button', {
            name: 'Switch customer',
        })

        await user.click(switchCustomerButton)

        await waitFor(() => {
            expect(
                screen.getByText('Change ticket customer?'),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                /Are you sure that you want to set Antonio Lopez as the customer for this ticket?/,
            ),
        ).toBeInTheDocument()
    })

    it('should close confirmation modal when clicking Cancel', async () => {
        const searchResult: CustomerHighlightDataItem = {
            entity: mockCustomer({
                id: 999,
                name: 'Antonio Lopez',
                email: 'antonio@example.com',
                channels: [],
            }) as any,
            highlights: {
                name: ['Antonio Lopez'],
            },
        }

        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [searchResult],
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await user.click(
            screen.getByRole('button', {
                name: 'Search for customers to merge or switch',
            }),
        )

        await screen.findByText('Search customers')

        const searchInput = await screen.findByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Antonio')

        await screen.findByText(/Antonio Lopez/)

        const switchCustomerButton = await screen.findByRole('button', {
            name: 'Switch customer',
        })

        await user.click(switchCustomerButton)

        await waitFor(() => {
            expect(
                screen.getByText('Change ticket customer?'),
            ).toBeInTheDocument()
        })

        const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
        })

        await user.click(cancelButton)

        await waitFor(() => {
            expect(
                screen.queryByText('Change ticket customer?'),
            ).not.toBeInTheDocument()
        })
    })

    it('should update customer when clicking Confirm in modal', async () => {
        const searchResult: CustomerHighlightDataItem = {
            entity: mockCustomer({
                id: 999,
                name: 'Antonio Lopez',
                email: 'antonio@example.com',
                channels: [],
            }) as any,
            highlights: {
                name: ['Antonio Lopez'],
            },
        }

        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [searchResult],
                    }),
                ),
            ).handler,
        )

        const onSwitchCustomer = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerDetails
                {...defaultProps}
                onSwitchCustomer={onSwitchCustomer}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await user.click(
            screen.getByRole('button', {
                name: 'Search for customers to merge or switch',
            }),
        )

        const searchInput = await screen.findByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Antonio')

        await waitFor(() => {
            expect(screen.getByText(/Antonio Lopez/)).toBeInTheDocument()
        })

        const switchCustomerButton = screen.getByRole('button', {
            name: 'Switch customer',
        })

        await user.click(switchCustomerButton)

        await waitFor(() => {
            expect(
                screen.getByText('Change ticket customer?'),
            ).toBeInTheDocument()
        })

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })

        const waitForUpdateRequest = mockUpdateTicket.waitForRequest(server)

        await user.click(confirmButton)

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            expect(body.customer).toBeDefined()
            expect(body.customer.id).toBe(999)
        })

        await waitFor(() => {
            expect(onSwitchCustomer).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 999,
                    name: 'Antonio Lopez',
                    email: 'antonio@example.com',
                }),
            )
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Change ticket customer?'),
            ).not.toBeInTheDocument()
        })
    })

    it('should keep the switch panel open and skip legacy sync when the update fails', async () => {
        const searchResult: CustomerHighlightDataItem = {
            entity: mockCustomer({
                id: 999,
                name: 'Antonio Lopez',
                email: 'antonio@example.com',
                channels: [],
            }) as any,
            highlights: {
                name: ['Antonio Lopez'],
            },
        }

        const mockUpdateTicketFailure = mockUpdateTicketHandler(async () =>
            HttpResponse.json(null, { status: 500 }),
        )

        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [searchResult],
                    }),
                ),
            ).handler,
            mockUpdateTicketFailure.handler,
            http.get(`/api/customers/999/similar/`, () => {
                return new HttpResponse(null, { status: 404 })
            }),
        )

        const onSwitchCustomer = vi.fn()
        const { user } = render(
            <InfobarTicketCustomerDetails
                {...defaultProps}
                onSwitchCustomer={onSwitchCustomer}
            />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await user.click(
            screen.getByRole('button', {
                name: 'Search for customers to merge or switch',
            }),
        )

        const searchInput = await screen.findByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Antonio')

        await screen.findByText(/Antonio Lopez/)

        await user.click(
            screen.getByRole('button', {
                name: 'Switch customer',
            }),
        )

        await screen.findByText('Change ticket customer?')

        const waitForUpdateRequest =
            mockUpdateTicketFailure.waitForRequest(server)

        await user.click(screen.getByRole('button', { name: 'Confirm' }))

        await waitForUpdateRequest()

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update ticket customer',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        expect(onSwitchCustomer).not.toHaveBeenCalled()
        expect(screen.getByText('Search customers')).toBeInTheDocument()
    })
})
