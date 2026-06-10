vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn().mockReturnValue(false),
}))

import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { vi } from 'vitest'

import {
    mockCustomer,
    mockGetCurrentUserHandler,
    mockGetCustomerHandler,
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

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { render } from '../../../tests/render.utils'
import { server } from '../../../tests/server'
import { InfobarTicketDetails } from '../InfobarTicketDetails'

const mockUseFlag = vi.mocked(useFlag)

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

const mockGetCustomer = mockGetCustomerHandler(async () =>
    HttpResponse.json(
        mockCustomer({
            id: customerId,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [],
        }),
    ),
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
        mockGetCustomer.handler,
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

describe('when NewOrdersSidebar FF is enabled', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.NewOrdersSidebar,
        )
    })

    afterEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('renders a collapse toggle for the ticket details section', () => {
        render(
            <InfobarTicketDetails {...baseProps} ticketSummaryIcon={null} />,
            {
                initialEntries: [`/tickets/${ticketId}`],
                path: '/tickets/:ticketId',
            },
        )
        expect(
            screen.getByRole('button', { name: 'Collapse Ticket details' }),
        ).toBeInTheDocument()
    })

    it('collapses and re-expands the section on toggle click', async () => {
        const { user } = render(
            <InfobarTicketDetails {...baseProps} ticketSummaryIcon={null} />,
            {
                initialEntries: [`/tickets/${ticketId}`],
                path: '/tickets/:ticketId',
            },
        )
        const collapseButton = screen.getByRole('button', {
            name: 'Collapse Ticket details',
        })
        expect(collapseButton).toHaveAttribute('aria-expanded', 'true')

        await user.click(collapseButton)

        const expandButton = screen.getByRole('button', {
            name: 'Expand Ticket details',
        })
        expect(expandButton).toHaveAttribute('aria-expanded', 'false')

        await user.click(expandButton)

        expect(
            screen.getByRole('button', { name: 'Collapse Ticket details' }),
        ).toHaveAttribute('aria-expanded', 'true')
    })
})
