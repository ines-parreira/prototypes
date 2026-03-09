import type { ReactNode } from 'react'

import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockIntegration,
    mockListIntegrationsHandler,
    mockListIntegrationsResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import type { TicketThreadActionExecutedEventItem } from '../../../../../hooks/events/types'
import { TicketThreadItemTag } from '../../../../../hooks/types'
import { render } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemComponent } from '../TicketThreadActionExecutedEventItem'

vi.mock('@gorgias/axiom', async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>

    return {
        ...actual,
        Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
        TooltipTrigger: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
        TooltipContent: ({ children }: { children: ReactNode }) => (
            <>{children}</>
        ),
    }
})

function getIntegrationsHandler(integrations: unknown[]) {
    return mockListIntegrationsHandler(async () =>
        HttpResponse.json(
            mockListIntegrationsResponse({
                data: integrations as any[],
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
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
                    ...(dataOverrides?.payload ?? {}),
                },
            },
        },
    }
}

function getIconUseElement(container: HTMLElement, iconName: string) {
    return container.querySelector(
        `use[href="#${iconName}"], use[*|href="#${iconName}"]`,
    )
}

describe('TicketThreadActionExecutedEventItem', () => {
    it('renders shopify row with logo, label, order link, store, author, and date', async () => {
        server.use(
            getIntegrationsHandler([
                mockIntegration({
                    id: 33858,
                    type: 'shopify',
                    name: 'Main Shop',
                    meta: {
                        shop_name: 'main-shop',
                    },
                }),
            ]).handler,
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

        expect(screen.getByText('Refund order')).toBeInTheDocument()
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
        expect(screen.getByText('2024-03-21')).toBeInTheDocument()
        expect(
            getIconUseElement(container, 'vendor-shopify-colored'),
        ).toBeTruthy()
    })

    it('renders tooltip details with payload and error information', async () => {
        server.use(
            getIntegrationsHandler([
                mockIntegration({
                    id: 33858,
                    type: 'shopify',
                    name: 'Main Shop',
                    meta: {
                        shop_name: 'main-shop',
                    },
                }),
            ]).handler,
            getUsersHandler([
                mockUser({
                    id: 42,
                    name: 'Alex Agent',
                }),
            ]).handler,
        )

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

        expect(screen.getByText('Action request failed')).toBeInTheDocument()
        expect(screen.getByText('Order Id:')).toBeInTheDocument()
        expect(screen.getByText('360037000')).toBeInTheDocument()
        expect(screen.getByText('Tags List:')).toBeInTheDocument()
        expect(screen.getByText('vip,refund')).toBeInTheDocument()
        expect(screen.getByText('Metadata:')).toBeInTheDocument()
        expect(screen.getByText('{"channel":"api"}')).toBeInTheDocument()
        expect(getIconUseElement(container, 'info')).toBeTruthy()
    })

    it('falls back when integration cannot be resolved', async () => {
        server.use(
            getIntegrationsHandler([
                mockIntegration({
                    id: 1,
                    type: 'shopify',
                    name: 'Other Shop',
                    meta: {
                        shop_name: 'other-shop',
                    },
                }),
            ]).handler,
        )

        const { container } = render(
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

        expect(screen.getByText('Cancel subscription')).toBeInTheDocument()
        expect(screen.getByText('#987654')).toBeInTheDocument()
        expect(
            screen.queryByRole('link', {
                name: '#987654',
            }),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Other Shop')).not.toBeInTheDocument()
        expect(getIconUseElement(container, 'shopping-bag')).toBeTruthy()
    })
})
