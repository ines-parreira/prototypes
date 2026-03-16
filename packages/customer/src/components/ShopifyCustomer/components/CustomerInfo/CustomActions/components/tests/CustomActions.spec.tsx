import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockExecuteActionHandler,
    mockListWidgetsHandler,
} from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import {
    render,
    testAppQueryClient,
} from '../../../../../../../tests/render.utils'
import { CustomActions } from '../CustomActions'
import { TemplateResolverProvider } from '../TemplateResolverContext'

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

const widgetListResponse = (data: Widget[]) => ({
    data,
    meta: { next_cursor: null, prev_cursor: null },
    object: null,
    uri: '/api/widgets',
})

const shopifyWidgetWithActions: Widget = {
    id: 1,
    type: 'shopify',
    context: 'ticket',
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: {
                    custom: {
                        links: [
                            {
                                label: 'View Profile',
                                url: 'https://example.com/profile',
                            },
                        ],
                        buttons: [
                            {
                                label: 'Sync Data',
                                action: {
                                    method: 'POST',
                                    url: 'https://api.example.com/sync',
                                    headers: [],
                                    params: [],
                                    body: {
                                        contentType: 'application/json',
                                        'application/json': {},
                                        'application/x-www-form-urlencoded': [],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
}

const shopifyWidgetWithEditableAction: Widget = {
    id: 1,
    type: 'shopify',
    context: 'ticket',
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: {
                    custom: {
                        links: [],
                        buttons: [
                            {
                                label: 'Run Query',
                                action: {
                                    method: 'POST',
                                    url: 'https://api.example.com/query',
                                    headers: [
                                        {
                                            id: '1',
                                            key: 'token',
                                            value: '',
                                            editable: true,
                                            label: 'API Token',
                                            mandatory: true,
                                        },
                                    ],
                                    params: [],
                                    body: {
                                        contentType: 'application/json',
                                        'application/json': {},
                                        'application/x-www-form-urlencoded': [],
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        ],
    },
}

const shopifyWidgetWithTemplateActions: Widget = {
    id: 1,
    type: 'shopify',
    context: 'ticket',
    template: {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: {
                    custom: {
                        links: [
                            {
                                label: 'Profile of {{customer.name}}',
                                url: 'https://example.com/customers/{{customer.id}}',
                            },
                        ],
                        buttons: [],
                    },
                },
            },
        ],
    },
}

function setupHandlers(
    widgetData: Widget[],
    executeActionMock?: ReturnType<typeof mockExecuteActionHandler>,
) {
    const listWidgetsMock = mockListWidgetsHandler(async () =>
        HttpResponse.json(widgetListResponse(widgetData)),
    )
    const execMock = executeActionMock ?? mockExecuteActionHandler()
    server.use(listWidgetsMock.handler, execMock.handler)
    return { listWidgetsMock, executeActionMock: execMock }
}

describe('CustomActions', () => {
    it('renders nothing when no custom actions exist', async () => {
        setupHandlers([])

        render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
            expect(screen.queryByRole('button')).not.toBeInTheDocument()
        })
    })

    it('renders link buttons with external link icons', async () => {
        setupHandlers([shopifyWidgetWithActions])

        render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('link', { name: /view profile/i }),
            ).toBeInTheDocument()
        })

        const link = screen.getByRole('link', { name: /view profile/i })
        expect(link).toHaveAttribute('href', 'https://example.com/profile')
        expect(link).toHaveAttribute('target', '_blank')
    })

    it('renders action buttons', async () => {
        setupHandlers([shopifyWidgetWithActions])

        render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync data/i }),
            ).toBeInTheDocument()
        })
    })

    it('executes action when button without editable params is clicked', async () => {
        const executeActionMock = mockExecuteActionHandler()
        setupHandlers([shopifyWidgetWithActions], executeActionMock)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const { user } = render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync data/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /sync data/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('customHttpAction')
            expect(body.action_label).toBe('Sync Data')
            expect(body.user_id).toBe(42)
            expect(body.integration_id).toBe(1)
            expect(body.payload.method).toBe('POST')
            expect(body.payload.url).toBe('https://api.example.com/sync')
        })
    })

    it('opens editor dialog when button with editable params is clicked', async () => {
        setupHandlers([shopifyWidgetWithEditableAction])

        const { user } = render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /run query/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /run query/i }))

        await vi.waitFor(() => {
            expect(
                screen.getByRole('textbox', { name: /api token/i }),
            ).toBeInTheDocument()
        })
    })

    it('resolves template variables in link URLs and labels', async () => {
        setupHandlers([shopifyWidgetWithTemplateActions])

        render(
            <TemplateResolverProvider customer={{ name: 'Alice', id: '999' }}>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('link', { name: /profile of alice/i }),
            ).toBeInTheDocument()
        })

        const link = screen.getByRole('link', { name: /profile of alice/i })
        expect(link).toHaveAttribute(
            'href',
            'https://example.com/customers/999',
        )
    })

    it('executes action through editor dialog with modified params', async () => {
        const executeActionMock = mockExecuteActionHandler()
        setupHandlers([shopifyWidgetWithEditableAction], executeActionMock)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const { user } = render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /run query/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /run query/i }))

        await vi.waitFor(() => {
            expect(
                screen.getByRole('textbox', { name: /api token/i }),
            ).toBeInTheDocument()
        })

        await user.type(
            screen.getByRole('textbox', { name: /api token/i }),
            'my-secret-token',
        )
        await user.click(screen.getByRole('button', { name: /execute/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.action_name).toBe('customHttpAction')
            expect(body.payload.headers).toEqual({ token: 'my-secret-token' })
        })
    })

    it('resolves enriched integration data in link URLs', async () => {
        const widgetWithIntegrationLink: Widget = {
            id: 1,
            type: 'shopify',
            context: 'ticket',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: 'customer',
                        type: 'customer',
                        meta: {
                            custom: {
                                links: [
                                    {
                                        label: 'Order {{customer.integrations.shopify.orders[0].name}}',
                                        url: 'https://shop.example.com/orders/{{customer.integrations.shopify.orders[0].id}}',
                                    },
                                ],
                                buttons: [],
                            },
                        },
                    },
                ],
            },
        }

        setupHandlers([widgetWithIntegrationLink])

        render(
            <TemplateResolverProvider
                customer={{
                    name: 'Alice',
                    id: '42',
                    integrations: {
                        shopify: {
                            orders: [{ id: '1001', name: '#1001' }],
                        },
                    },
                }}
            >
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('link', { name: /order #1001/i }),
            ).toBeInTheDocument()
        })

        const link = screen.getByRole('link', { name: /order #1001/i })
        expect(link).toHaveAttribute(
            'href',
            'https://shop.example.com/orders/1001',
        )
    })

    it('resolves $variable substitution in templates', async () => {
        const widgetWithVariable: Widget = {
            id: 1,
            type: 'shopify',
            context: 'ticket',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: 'customer',
                        type: 'customer',
                        meta: {
                            custom: {
                                links: [
                                    {
                                        label: 'Integration Link',
                                        url: 'https://example.com/integrations/$integrationId/customers/{{customer.id}}',
                                    },
                                ],
                                buttons: [],
                            },
                        },
                    },
                ],
            },
        }

        setupHandlers([widgetWithVariable])

        render(
            <TemplateResolverProvider
                customer={{ id: '42', name: 'Alice' }}
                variables={{ integrationId: '789' }}
            >
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('link', { name: /integration link/i }),
            ).toBeInTheDocument()
        })

        const link = screen.getByRole('link', { name: /integration link/i })
        expect(link).toHaveAttribute(
            'href',
            'https://example.com/integrations/789/customers/42',
        )
    })

    it('resolves $listIndex variable in link URLs and button action bodies', async () => {
        const widgetWithListIndex: Widget = {
            id: 1,
            type: 'shopify',
            context: 'ticket',
            template: {
                type: 'wrapper',
                widgets: [
                    {
                        path: 'customer',
                        type: 'customer',
                        meta: {
                            custom: {
                                links: [
                                    {
                                        label: 'View Order',
                                        url: 'https://shop.example.com/orders/{{customer.integrations.shopify.orders[$listIndex].id}}',
                                    },
                                ],
                                buttons: [
                                    {
                                        label: 'Refund Order',
                                        action: {
                                            method: 'POST',
                                            url: 'https://api.example.com/refund',
                                            headers: [],
                                            params: [],
                                            body: {
                                                contentType: 'application/json',
                                                'application/json': {
                                                    order_id:
                                                        '{{customer.integrations.shopify.orders[$listIndex].id}}',
                                                },
                                                'application/x-www-form-urlencoded':
                                                    [],
                                            },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                ],
            },
        }

        const executeActionMock = mockExecuteActionHandler()
        setupHandlers([widgetWithListIndex], executeActionMock)
        const waitForRequest = executeActionMock.waitForRequest(server)

        const { user } = render(
            <TemplateResolverProvider
                customer={{
                    integrations: {
                        shopify: {
                            orders: [
                                { id: '5001', name: '#5001' },
                                { id: '5002', name: '#5002' },
                            ],
                        },
                    },
                }}
                variables={{ listIndex: '1' }}
            >
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('link', { name: /view order/i }),
            ).toBeInTheDocument()
        })

        const link = screen.getByRole('link', { name: /view order/i })
        expect(link).toHaveAttribute(
            'href',
            'https://shop.example.com/orders/5002',
        )

        await user.click(screen.getByRole('button', { name: /refund order/i }))

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body.payload.json).toEqual({ order_id: '5002' })
        })
    })

    it('disables action button while mutation is loading', async () => {
        let resolveRequest: (() => void) | undefined
        const executeActionMock = mockExecuteActionHandler(
            () =>
                new Promise<HttpResponse<undefined>>((resolve) => {
                    resolveRequest = () =>
                        resolve(new HttpResponse(null, { status: 200 }))
                }),
        )
        setupHandlers([shopifyWidgetWithActions], executeActionMock)

        const { user } = render(
            <TemplateResolverProvider>
                <CustomActions
                    integrationId={1}
                    customerId={42}
                    ticketId="100"
                />
            </TemplateResolverProvider>,
        )

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync data/i }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /sync data/i }))

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync data/i }),
            ).toBeDisabled()
        })

        resolveRequest?.()

        await vi.waitFor(() => {
            expect(
                screen.getByRole('button', { name: /sync data/i }),
            ).toBeEnabled()
        })
    })
})
