import { act, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomer,
    mockGetCurrentUserHandler,
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
import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
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

const server = setupServer(
    mockGetTicket.handler,
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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    testAppQueryClient.clear()
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
    it('should render InfobarTicketCustomerHeader with customer data', async () => {
        render(<InfobarTicketCustomerDetails {...defaultProps} />, {
            path: '/ticket/:ticketId',
            initialEntries: [`/ticket/${ticketId}`],
        })

        await waitUntilLoaded()
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

        await act(() => user.click(viewCustomerButton))

        await waitFor(() => {
            expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        })
    })

    it('should open SearchAndPreviewCustomersPanel when clicking merge button', async () => {
        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await act(() => user.click(screen.getByLabelText('Customer menu')))
        await act(() =>
            user.click(screen.getByText('Merge or switch customer')),
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

        await act(() => user.click(screen.getByLabelText('Customer menu')))
        await act(() =>
            user.click(screen.getByText('Merge or switch customer')),
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

        await act(() => user.click(switchCustomerButton))

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

        await act(() => user.click(screen.getByLabelText('Customer menu')))
        await act(() =>
            user.click(screen.getByText('Merge or switch customer')),
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

        await act(() => user.click(switchCustomerButton))

        await waitFor(() => {
            expect(
                screen.getByText('Change ticket customer?'),
            ).toBeInTheDocument()
        })

        const cancelButton = await screen.findByRole('button', {
            name: 'Cancel',
        })

        await act(() => user.click(cancelButton))

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

        const { user } = render(
            <InfobarTicketCustomerDetails {...defaultProps} />,
            {
                path: '/ticket/:ticketId',
                initialEntries: [`/ticket/${ticketId}`],
            },
        )

        await waitUntilLoaded()

        await act(() => user.click(screen.getByLabelText('Customer menu')))
        await act(() =>
            user.click(screen.getByText('Merge or switch customer')),
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await act(() => user.type(searchInput, 'Antonio'))

        await waitFor(() => {
            expect(screen.getByText(/Antonio Lopez/)).toBeInTheDocument()
        })

        const switchCustomerButton = screen.getByRole('button', {
            name: 'Switch customer',
        })

        await act(() => user.click(switchCustomerButton))

        await waitFor(() => {
            expect(
                screen.getByText('Change ticket customer?'),
            ).toBeInTheDocument()
        })

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })

        const waitForUpdateRequest = mockUpdateTicket.waitForRequest(server)

        await act(() => user.click(confirmButton))

        await waitForUpdateRequest(async (request) => {
            const body = await request.json()
            expect(body.customer).toBeDefined()
            expect(body.customer.id).toBe(999)
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Change ticket customer?'),
            ).not.toBeInTheDocument()
        })
    })
})
