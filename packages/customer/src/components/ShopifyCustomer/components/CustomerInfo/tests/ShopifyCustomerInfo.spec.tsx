import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockIntegration,
    mockListIntegrationsHandler,
} from '@gorgias/helpdesk-mocks'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { CustomerInfo } from '../'
import { render, testAppQueryClient } from '../../../../../tests/render.utils'

const mockShopifyIntegration = mockIntegration({
    id: 1,
    name: 'Test Shopify Store',
    type: IntegrationType.Shopify,
    created_datetime: '2024-01-01T00:00:00Z',
    meta: {},
})

const mockSecondShopifyIntegration = mockIntegration({
    id: 2,
    name: 'Second Shopify Store',
    type: IntegrationType.Shopify,
    created_datetime: '2024-01-02T00:00:00Z',
    meta: {},
})
const mockListIntegrations = mockListIntegrationsHandler(async () =>
    HttpResponse.json({
        data: [mockShopifyIntegration, mockSecondShopifyIntegration],
        meta: {
            next_cursor: null,
            prev_cursor: null,
        },
        object: 'list',
        uri: '/api/integrations',
    }),
)

const server = setupServer(mockListIntegrations.handler)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListIntegrations.handler)
})

afterEach(() => {
    server.resetHandlers()
    testAppQueryClient.clear()
})

afterAll(() => {
    server.close()
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
        const onStoreChange = vi.fn()
        const { user } = render(<CustomerInfo onStoreChange={onStoreChange} />)

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toHaveValue(
                mockShopifyIntegration.name,
            )
        })

        expect(onStoreChange).toHaveBeenCalledWith(mockShopifyIntegration.id)

        onStoreChange.mockClear()

        await act(() =>
            user.click(
                screen.getByRole('button', { name: /test shopify store/i }),
            ),
        )

        await waitFor(() => {
            expect(
                screen.getByRole('option', { name: /second shopify store/i }),
            ).toBeInTheDocument()
        })

        await act(() =>
            user.click(
                screen.getByRole('option', { name: /second shopify store/i }),
            ),
        )

        expect(onStoreChange).toHaveBeenCalledWith(
            mockSecondShopifyIntegration.id,
        )
    })
})
