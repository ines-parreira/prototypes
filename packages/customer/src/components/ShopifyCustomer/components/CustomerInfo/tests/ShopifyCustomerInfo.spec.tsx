import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListIntegrationsHandler } from '@gorgias/helpdesk-mocks'
import type { Integration } from '@gorgias/helpdesk-types'

import { CustomerInfo } from '../'
import { render, testAppQueryClient } from '../../../../../tests/render.utils'

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

describe('CustomerInfo', () => {
    it('renders the store picker with the selected integration', async () => {
        render(<CustomerInfo />)

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })
    })

    it('calls onStoreChange when an integration is loaded', async () => {
        const onStoreChange = vi.fn()
        render(<CustomerInfo onStoreChange={onStoreChange} />)

        await waitFor(() => {
            expect(onStoreChange).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
            )
        })
    })

    it('calls onStoreChange when user selects a different store', async () => {
        const secondIntegration = {
            id: 2,
            name: 'Second Shopify Store',
            type: 'shopify',
            created_datetime: '2024-01-02T00:00:00Z',
            meta: {},
        } as Integration

        const mockListIntegrations = mockListIntegrationsHandler(async () =>
            HttpResponse.json({
                data: [mockShopifyIntegration, secondIntegration],
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
                uri: '/api/integrations',
            }),
        )

        server.use(mockListIntegrations.handler)

        const onStoreChange = vi.fn()
        const { user } = render(<CustomerInfo onStoreChange={onStoreChange} />)

        await waitFor(() => {
            expect(onStoreChange).toHaveBeenCalledWith(
                mockShopifyIntegration.id,
            )
        })

        onStoreChange.mockClear()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /test shopify store/i }),
            )
        })

        const option = await screen.findByRole('option', {
            name: /second shopify store/i,
        })

        await act(async () => {
            await user.click(option)
        })

        expect(onStoreChange).toHaveBeenCalledWith(secondIntegration.id)
    })
})
