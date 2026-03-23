import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import {
    render,
    testAppQueryClient,
} from '../../../../../../tests/render.utils'
import { ShopifyTags } from '../ShopifyTags'

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

const mockShopTagsResponse = {
    data: {
        shop: {
            customerTags: {
                edges: [
                    { node: 'VIP' },
                    { node: 'Wholesale' },
                    { node: 'Returning' },
                ],
            },
        },
    },
}

const shopTagsHandler = http.get(
    '/integrations/shopify/shop-tags/customers/list/',
    () => {
        return HttpResponse.json(mockShopTagsResponse)
    },
)

const mockExecuteAction = mockExecuteActionHandler()

describe('ShopifyTags', () => {
    beforeEach(() => {
        server.use(shopTagsHandler, mockExecuteAction.handler)
    })

    it('renders nothing when integrationId is undefined', () => {
        const { container } = render(
            <ShopifyTags
                tags="VIP, Wholesale"
                integrationId={undefined}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when externalId is undefined', () => {
        const { container } = render(
            <ShopifyTags
                tags="VIP, Wholesale"
                integrationId={1}
                externalId={undefined}
                customerId={789}
                ticketId="456"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when customerId is undefined', () => {
        const { container } = render(
            <ShopifyTags
                tags="VIP, Wholesale"
                integrationId={1}
                externalId="123"
                customerId={undefined}
                ticketId="456"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders tags from comma-separated string', async () => {
        render(
            <ShopifyTags
                tags="VIP, Wholesale"
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Wholesale')).toBeInTheDocument()
        })
    })

    it('renders Add tags button when no tags exist', async () => {
        render(
            <ShopifyTags
                tags=""
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /add tags/i }),
            ).toBeInTheDocument()
        })
    })

    it('renders plus icon button when tags exist', async () => {
        render(
            <ShopifyTags
                tags="VIP"
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
        })

        const plusButton = screen.getByRole('button', { name: /add-plus/ })
        expect(plusButton).toBeInTheDocument()
    })

    it('removes tag when close button is clicked', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForExecuteActionRequest =
            executeActionMock.waitForRequest(server)

        const { user } = render(
            <ShopifyTags
                tags="VIP, Wholesale"
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
        })

        const removeButtons = screen.getAllByRole('button', {
            name: /remove tag/i,
        })
        await user.click(removeButtons[0])

        await waitForExecuteActionRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('shopifyUpdateCustomerTags')
            expect(body.payload.tags_list).toBe('Wholesale')
            expect(body.user_id).toBe('789')
            expect(body.integration_id).toBe('1')
            expect(body.ticket_id).toBe('456')
        })
    })

    it('handles tags with extra whitespace', async () => {
        render(
            <ShopifyTags
                tags="  VIP  ,  Wholesale  "
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Wholesale')).toBeInTheDocument()
        })
    })

    it('handles empty tags gracefully', async () => {
        render(
            <ShopifyTags
                tags="VIP,,Wholesale,,"
                integrationId={1}
                externalId="123"
                customerId={789}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Wholesale')).toBeInTheDocument()
        })

        const tags = screen.getAllByText(/^(VIP|Wholesale)$/)
        expect(tags).toHaveLength(2)
    })
})
