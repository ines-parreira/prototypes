import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockExecuteActionHandler } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { OrderTags } from '../OrderTags'

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

const mockShopOrderTagsResponse = {
    data: {
        shop: {
            orderTags: {
                edges: [
                    { node: 'VIP' },
                    { node: 'Summer' },
                    { node: 'Priority' },
                ],
            },
        },
    },
}

const shopOrderTagsHandler = http.get(
    '/integrations/shopify/shop-tags/orders/list/',
    () => HttpResponse.json(mockShopOrderTagsResponse),
)

const mockExecuteAction = mockExecuteActionHandler()

describe('OrderTags', () => {
    beforeEach(() => {
        server.use(shopOrderTagsHandler, mockExecuteAction.handler)
    })

    it('renders nothing when integrationId is undefined', () => {
        const { container } = render(
            <OrderTags
                tags="VIP, Summer"
                integrationId={undefined}
                orderId={123}
                ticketId="456"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders nothing when orderId is undefined', () => {
        const { container } = render(
            <OrderTags
                tags="VIP, Summer"
                integrationId={1}
                orderId={undefined}
                ticketId="456"
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('renders tag chips from comma-separated string', async () => {
        render(
            <OrderTags
                tags="VIP, Summer"
                integrationId={1}
                orderId={123}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Summer')).toBeInTheDocument()
        })
    })

    it('renders Add tags button when no tags exist', async () => {
        render(
            <OrderTags
                tags=""
                integrationId={1}
                orderId={123}
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
            <OrderTags
                tags="VIP"
                integrationId={1}
                orderId={123}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
        })

        const buttons = screen.getAllByRole('button')
        const plusButton = buttons.find(
            (button) => button.getAttribute('slot') === 'button',
        )
        expect(plusButton).toBeInTheDocument()
    })

    it('sends correct action payload when tag is removed', async () => {
        const executeActionMock = mockExecuteActionHandler()
        server.use(executeActionMock.handler)

        const waitForExecuteActionRequest =
            executeActionMock.waitForRequest(server)

        const { user } = render(
            <OrderTags
                tags="VIP, Summer"
                integrationId={1}
                orderId={123}
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
            expect(body.action_name).toBe('shopifyUpdateOrderTags')
            expect(body.payload.tags_list).toBe('Summer')
            expect(body.payload.order_id).toBe(123)
            expect(body.integration_id).toBe(1)
            expect(body.ticket_id).toBe(456)
        })
    })

    it('handles tags with extra whitespace', async () => {
        render(
            <OrderTags
                tags="  VIP  ,  Summer  "
                integrationId={1}
                orderId={123}
                ticketId="456"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Summer')).toBeInTheDocument()
        })
    })
})
