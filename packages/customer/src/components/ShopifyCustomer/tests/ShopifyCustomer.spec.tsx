import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListIntegrationsHandler } from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { ShopifyCustomer } from '../'
import { render, testAppQueryClient } from '../../../tests/render.utils'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
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

beforeEach(() => {
    server.use(mockListIntegrations.handler)
})

describe('ShopifyCustomer', () => {
    it('renders the store picker', async () => {
        render(<ShopifyCustomer />)

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })
    })
})
