import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockGetEcommerceDataByExternalIdHandler } from '@gorgias/ecommerce-storage-mocks'
import {
    mockGetTicketHandler,
    mockListIntegrationsHandler,
    mockTicket,
    mockTicketCustomer,
} from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { ShopifyCustomer } from '../'
import { render, testAppQueryClient } from '../../../tests/render.utils'

vi.mock('@repo/navigation', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useTicketInfobarNavigation: () => ({
        shopifyIntegrationId: undefined,
        activeTab: undefined,
        isExpanded: true,
        onChangeTab: vi.fn(),
        onToggle: vi.fn(),
    }),
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
})

const mockShopifyIntegration = {
    id: 1,
    name: 'Test Shopify Store',
    type: 'shopify',
    created_datetime: '2024-01-01T00:00:00Z',
    meta: {},
} as Integration

const ticketWithShopifyCustomer = mockTicket({
    id: 123,
    customer: mockTicketCustomer({
        integrations: {
            '1': {
                __integration_type__: 'shopify',
                customer: {
                    id: 456,
                },
            },
        },
    }),
})

const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: [mockShopifyIntegration],
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    }),
)

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(ticketWithShopifyCustomer),
)

const mockGetEcommerceData = mockGetEcommerceDataByExternalIdHandler()

beforeEach(() => {
    server.use(
        mockListIntegrations.handler,
        mockGetTicket.handler,
        mockGetEcommerceData.handler,
    )
})

describe('ShopifyCustomer', () => {
    it('renders the store picker with integrations from the ticket', async () => {
        render(<ShopifyCustomer />, {
            initialEntries: ['/app/views/1/123'],
            path: '/app/views/:viewId/:ticketId',
        })

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })
    })
})
