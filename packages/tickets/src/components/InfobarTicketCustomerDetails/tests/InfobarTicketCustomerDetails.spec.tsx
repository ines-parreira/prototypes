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
    mockTicket,
    mockTicketCustomer,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

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

const server = setupServer(
    mockGetTicket.handler,
    mockGetCurrentUser.handler,
    mockListCustomFields.handler,
    mockListCustomerFieldsValues.handler,
    mockListIntegrationsHandler().handler,
    mockListPhoneNumbersHandler().handler,
    mockUpdateTicket.handler,
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

        const mergeButton = screen.getByRole('button', {
            name: 'Merge or switch customer profiles',
        })

        await act(() => user.click(mergeButton))

        await waitFor(() => {
            expect(screen.getByText('Search customers')).toBeInTheDocument()
        })
    })
})
