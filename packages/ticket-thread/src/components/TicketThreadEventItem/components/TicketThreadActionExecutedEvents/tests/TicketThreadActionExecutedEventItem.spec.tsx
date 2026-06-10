import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'

import {
    mockGetIntegrationHandler,
    mockGetIntegrationResponse,
    mockIntegration,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadActionExecutedEventItem } from '../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../hooks/types'
import { getCurrentUserHandler } from '../../../../../tests/getCurrentUser.mock'
import { render } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemComponent } from '../TicketThreadActionExecutedEventItem'

function getIntegrationHandler(
    integration: ReturnType<typeof mockIntegration>,
) {
    return mockGetIntegrationHandler(async () =>
        HttpResponse.json(
            mockGetIntegrationResponse({
                ...integration,
            }),
        ),
    )
}

function getUsersHandler(users: unknown[]) {
    return mockListUsersHandler(async () =>
        HttpResponse.json(
            mockListUsersResponse({
                data: users as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }),
        ),
    )
}

function buildItem({
    eventOverrides,
    dataOverrides,
}: {
    eventOverrides?: Partial<TicketThreadActionExecutedEventItem['data']>
    dataOverrides?: Partial<TicketThreadActionExecutedEventItem['data']['data']>
} = {}): TicketThreadActionExecutedEventItem {
    const baseData: TicketThreadActionExecutedEventItem['data']['data'] = {
        action_id: 'shopifyRefundOrder-1-33858-abc',
        action_label: null,
        action_name: 'shopifyRefundOrder',
        app_id: null,
        integration_id: 33858,
        payload: {
            order_id: 360037000,
        },
        status: 'success',
    }

    return {
        _tag: TicketThreadItemTag.Events.ActionExecutedEvent,
        datetime: '2024-03-21T11:00:00Z',
        data: {
            object_type: 'Ticket',
            type: 'action-executed',
            created_datetime: '2024-03-21T11:00:00Z',
            user_id: 42,
            ...eventOverrides,
            data: {
                ...baseData,
                ...dataOverrides,
                payload: {
                    ...baseData.payload,
                    ...dataOverrides?.payload,
                },
            },
        },
    }
}

function getIconUseElement(container: HTMLElement, iconName: string) {
    return Array.from(container.querySelectorAll('use')).find(
        (element) =>
            element.getAttribute('href') === `#${iconName}` ||
            element.getAttribute('xlink:href') === `#${iconName}`,
    )
}

describe('TicketThreadActionExecutedEventItem', () => {
    beforeEach(() => {
        server.use(getCurrentUserHandler().handler)
    })

    it('renders shopify row with logo, label, order link, store, author, and date', async () => {
        server.use(
            getIntegrationHandler(
                mockIntegration({
                    id: 33858,
                    type: 'shopify',
                    name: 'Main Shop',
                    meta: {
                        shop_name: 'main-shop',
                    },
                }),
            ).handler,
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

        const { container } = render(
            <TicketThreadActionExecutedEventItemComponent item={buildItem()} />,
        )

        expect(await screen.findByText('Refund order')).toBeInTheDocument()
        expect(await screen.findByText(/Main Shop/)).toBeInTheDocument()
        expect(
            await screen.findByRole('link', {
                name: '#360037000',
            }),
        ).toHaveAttribute(
            'href',
            'https://main-shop.myshopify.com/admin/orders/360037000',
        )
        expect(await screen.findByText('Alex Agent')).toBeInTheDocument()
        expect(screen.getByText('03/21/2024')).toBeInTheDocument()
        expect(getIconUseElement(container, 'app-shopify')).toBeTruthy()
    })

    it('renders tooltip details with payload and error information', async () => {
        server.use(
            getIntegrationHandler(
                mockIntegration({
                    id: 33858,
                    type: 'shopify',
                    name: 'Main Shop',
                    meta: {
                        shop_name: 'main-shop',
                    },
                }),
            ).handler,
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

        const user = userEvent.setup()

        const { container } = render(
            <TicketThreadActionExecutedEventItemComponent
                item={buildItem({
                    dataOverrides: {
                        status: 'error',
                        msg: 'Action request failed',
                        payload: {
                            order_id: 360037000,
                            tags_list: 'vip,refund',
                            metadata: {
                                channel: 'api',
                            },
                        },
                    },
                })}
            />,
        )

        await user.click(
            await screen.findByRole('button', {
                name: 'Show action details',
            }),
        )

        expect(screen.getByText('Action request failed')).toBeInTheDocument()
        expect(screen.getByText('Order Id:')).toBeInTheDocument()
        expect(screen.getByText('360037000')).toBeInTheDocument()
        expect(screen.getByText('Tags List:')).toBeInTheDocument()
        expect(screen.getByText('vip,refund')).toBeInTheDocument()
        expect(screen.getByText('Metadata:')).toBeInTheDocument()
        expect(screen.getByText('{"channel":"api"}')).toBeInTheDocument()
        expect(getIconUseElement(container, 'info')).toBeTruthy()
    })

    it('renders custom HTTP action modal with structured request sections', async () => {
        server.use(
            getIntegrationHandler(
                mockIntegration({
                    id: 33858,
                    type: 'http',
                    name: 'Custom HTTP',
                }),
            ).handler,
            getUsersHandler([mockUser({ id: 42, name: 'Alex Agent' })]).handler,
        )

        const user = userEvent.setup()

        render(
            <TicketThreadActionExecutedEventItemComponent
                item={buildItem({
                    dataOverrides: {
                        action_name: 'customHttpAction',
                        status: 'success',
                        payload: {
                            url: 'https://api.example.com/orders',
                            headers: { Authorization: 'Bearer token123' },
                            params: { limit: '10' },
                            json: { order_id: 42 },
                            content_type: 'application/json',
                            response: {
                                status_code: 200,
                                body: '{"status":"ok"}',
                            },
                        },
                    },
                })}
            />,
        )

        await user.click(
            await screen.findByRole('button', {
                name: 'Show action details',
            }),
        )

        expect(screen.getByText('Request')).toBeInTheDocument()
        expect(screen.getByText('Url:')).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/orders'),
        ).toBeInTheDocument()
        expect(screen.getByText('Headers')).toBeInTheDocument()
        expect(screen.getByText('Authorization:')).toBeInTheDocument()
        expect(screen.getByText('Bearer token123')).toBeInTheDocument()
        expect(screen.getByText('URL Parameters')).toBeInTheDocument()
        expect(screen.getByText('limit:')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('JSON Data')).toBeInTheDocument()
        expect(screen.getByText('Response')).toBeInTheDocument()
        expect(screen.getByText('Status code:')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
        expect(screen.getByText('Body:')).toBeInTheDocument()
        expect(screen.getByText('{"status":"ok"}')).toBeInTheDocument()
    })

    it('renders action details when integration cannot be resolved', async () => {
        server.use(
            mockGetIntegrationHandler(async () => HttpResponse.json(null))
                .handler,
        )

        render(
            <TicketThreadActionExecutedEventItemComponent
                item={buildItem({
                    eventOverrides: {
                        user_id: undefined,
                    },
                    dataOverrides: {
                        action_name: 'rechargeCancelSubscription',
                        integration_id: 999999,
                        payload: {
                            subscription_id: 987654,
                        },
                    },
                })}
            />,
        )

        expect(
            await screen.findByText('Cancel subscription'),
        ).toBeInTheDocument()
        expect(screen.getByText('#987654')).toBeInTheDocument()
        expect(
            screen.queryByRole('link', {
                name: '#987654',
            }),
        ).not.toBeInTheDocument()
    })

    it('renders custom HTTP actions without an integration id', async () => {
        server.use(
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

        const user = userEvent.setup()

        render(
            <TicketThreadActionExecutedEventItemComponent
                item={buildItem({
                    dataOverrides: {
                        action_name: 'customHttpAction',
                        action_label: 'Handed over',
                        integration_id: null,
                        payload: {
                            url: 'https://api.example.com/handover',
                            response: {
                                status_code: 200,
                                body: '{"status":"ok"}',
                            },
                        },
                    },
                })}
            />,
        )

        expect(await screen.findByText('Handed over')).toBeInTheDocument()
        expect(screen.queryByText(/ on /)).not.toBeInTheDocument()

        await user.click(
            screen.getByRole('button', {
                name: 'Show action details',
            }),
        )

        expect(screen.getByText('Request')).toBeInTheDocument()
        expect(screen.getByText('Url:')).toBeInTheDocument()
        expect(
            screen.getByText('https://api.example.com/handover'),
        ).toBeInTheDocument()
    })
})
