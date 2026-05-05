import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import {
    mockGetCurrentUserHandler,
    mockGetTicketHandler,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockListIntegrationsHandler,
    mockListPhoneNumbersHandler,
    mockListTagsHandler,
    mockListTicketCustomFieldsHandler,
    mockListTicketCustomFieldsResponse,
    mockSearchCustomersHandler,
    mockTicket,
    mockTicketCustomer,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { InfobarTicketDetails } from '../InfobarTicketDetails'

const ticketId = '12345'
const customerId = 6789

const ticket = mockTicket({
    id: Number(ticketId),
    customer: mockTicketCustomer({
        id: customerId,
        name: 'John Doe',
        email: 'john@example.com',
        channels: [],
    }),
    tags: [],
})

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(ticket),
)

const mockListTags = mockListTagsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [],
        meta: {
            total_resources: 0,
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json(mockListCustomFieldsResponse({ data: [] })),
)

const mockListTicketCustomFields = mockListTicketCustomFieldsHandler(async () =>
    HttpResponse.json(mockListTicketCustomFieldsResponse({ data: [] })),
)

const mockListCustomerCustomFieldsValues =
    mockListCustomerCustomFieldsValuesHandler(async () =>
        HttpResponse.json(
            mockListCustomerCustomFieldsValuesResponse({ data: [] }),
        ),
    )

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockUser()),
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockGetTicket.handler,
        mockListTags.handler,
        mockListCustomFields.handler,
        mockListCustomFieldConditionsHandler().handler,
        mockListTicketCustomFields.handler,
        mockListCustomerCustomFieldsValues.handler,
        mockGetCurrentUser.handler,
        mockListIntegrationsHandler().handler,
        mockListPhoneNumbersHandler().handler,
        mockSearchCustomersHandler().handler,
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

const baseProps = {
    onEditCustomer: vi.fn(),
    onSyncToShopify: vi.fn(),
    hasShopifyIntegration: false,
}

describe('InfobarTicketDetails', () => {
    it('should render the ticket details', async () => {
        render(
            <InfobarTicketDetails {...baseProps} ticketSummaryIcon={null} />,
            {
                initialEntries: [`/tickets/${ticketId}`],
                path: '/tickets/:ticketId',
            },
        )
        expect(screen.getByText('Ticket details')).toBeInTheDocument()
        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'John Doe' }),
            ).toBeInTheDocument()
        })
    })

    it('should render the given `ticketSummaryIcon`', async () => {
        render(
            <InfobarTicketDetails
                {...baseProps}
                ticketSummaryIcon={<p>TicketSummaryIcon</p>}
            />,
            {
                initialEntries: [`/tickets/${ticketId}`],
                path: '/tickets/:ticketId',
            },
        )
        expect(screen.getByText('TicketSummaryIcon')).toBeInTheDocument()
        await waitFor(() => {
            expect(
                screen.getByRole('link', { name: 'John Doe' }),
            ).toBeInTheDocument()
        })
    })
})
