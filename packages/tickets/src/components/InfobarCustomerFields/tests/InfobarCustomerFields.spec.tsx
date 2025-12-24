import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
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
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomer } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { InfobarCustomerFields } from '../InfobarCustomerFields'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
    vi.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('InfobarCustomerFields', () => {
    it('should return null when ticketId is not provided', () => {
        const { container } = render(<InfobarCustomerFields />, {
            initialEntries: ['/tickets'],
            path: '/tickets',
        })

        expect(container.firstChild).toBeNull()
    })

    it('should return null when customer is not available', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: null as unknown as TicketCustomer,
        })

        const mockGetTicket = mockGetTicketHandler(async () =>
            HttpResponse.json(ticket),
        )

        server.use(mockGetTicket.handler)

        const { container } = render(<InfobarCustomerFields />, {
            initialEntries: ['/tickets/123'],
            path: '/tickets/:ticketId',
        })

        await waitFor(() => {
            expect(container.firstChild).toBeNull()
        })
    })

    it('should render OverflowList when ticketId and customer are available', async () => {
        const ticket = mockTicket({
            id: 123,
            customer: mockTicketCustomer({
                id: 1,
                name: 'Test Customer',
                email: 'test@example.com',
            }),
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

        const mockListCustomerFieldsValues =
            mockListCustomerCustomFieldsValuesHandler(async () =>
                HttpResponse.json(
                    mockListCustomerCustomFieldsValuesResponse({ data: [] }),
                ),
            )

        server.use(
            mockGetTicket.handler,
            mockGetCurrentUser.handler,
            mockListCustomFields.handler,
            mockListCustomerFieldsValues.handler,
            mockListIntegrationsHandler().handler,
            mockListPhoneNumbersHandler().handler,
        )

        const { container } = render(<InfobarCustomerFields />, {
            initialEntries: ['/tickets/123'],
            path: '/tickets/:ticketId',
        })

        await waitFor(() => {
            const overflowList = container.querySelector(
                '[data-name="overflow-list"]',
            )
            expect(overflowList).toBeInTheDocument()
        })
    })
})
