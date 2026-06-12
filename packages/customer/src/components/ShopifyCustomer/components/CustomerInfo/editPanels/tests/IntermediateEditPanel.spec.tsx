import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockCreateWidgetHandler,
    mockListWidgetsHandler,
    mockUpdateWidgetHandler,
} from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import { server } from '../../../../../../tests/server'
import { FIELD_DEFINITIONS } from '../../fieldDefinitions/fields'
import type {
    FieldConfig,
    FieldRenderContext,
    OrderFieldPreferences,
    OrderFieldRenderContext,
    ShopifyFieldPreferences,
} from '../../types'
import { IntermediateEditPanel } from '../IntermediateEditPanel'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: { NewOrdersSidebar: 'linear-HELP-6616-new-orders-sidebar' },
    useFlag: vi.fn().mockReturnValue(false),
}))

vi.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
    useDrop: () => [{ isOver: false }, vi.fn()],
}))

vi.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: {},
}))

const defaultListWidgetsMock = mockListWidgetsHandler()

const mockContext: FieldRenderContext = {
    purchaseSummary: undefined,
    shopper: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
    timezone: undefined,
    integrationId: undefined,
    externalId: undefined,
    customerId: undefined,
    ticketId: undefined,
    emailMarketingConsent: undefined,
    smsMarketingConsent: undefined,
}

const defaultPreferences: ShopifyFieldPreferences = {
    fields: [
        { id: 'totalSpent', visible: true },
        { id: 'orders', visible: true },
        { id: 'note', visible: false },
    ],
}

const fields: FieldConfig[] = [
    FIELD_DEFINITIONS.totalSpent,
    FIELD_DEFINITIONS.orders,
    FIELD_DEFINITIONS.note,
]

const mockOrderPreferences: OrderFieldPreferences = {
    sections: {
        orderDetails: {
            fields: [
                { id: 'tags', visible: true },
                { id: 'store', visible: true },
            ],
        },
        lineItems: { fields: [], sectionVisible: true },
        shipping: {
            fields: [{ id: 'tracking_url', visible: true }],
        },
        shippingAddress: { fields: [] },
        billingAddress: { fields: [] },
    },
}

const mockOrderContext: OrderFieldRenderContext = {
    order: { id: '' },
    isDraftOrder: undefined,
    integrationId: undefined,
    ticketId: undefined,
    storeName: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
    timezone: undefined,
}

describe('IntermediateEditPanel', () => {
    const defaultProps = {
        customerFields: fields,
        context: mockContext,
        preferences: defaultPreferences,
        onSavePreferences: vi.fn().mockResolvedValue(undefined),
        orderPreferences: mockOrderPreferences,
        onSaveOrderPreferences: vi.fn().mockResolvedValue(undefined),
        orderContext: mockOrderContext,
        onClose: vi.fn(),
        sections: [],
    }

    async function openShopifyMetricsPanel(
        user: ReturnType<typeof render>['user'],
    ) {
        await user.click(
            await screen.findByRole('button', { name: /edit metrics/i }),
        )

        const dialog = await screen.findByRole('dialog', {
            name: /shopify metrics/i,
        })
        await within(dialog).findByText('Note')

        return dialog
    }

    async function openOrderDetailsPanel(
        user: ReturnType<typeof render>['user'],
    ) {
        await user.click(
            await screen.findByRole('button', {
                name: /edit order details/i,
            }),
        )

        const dialog = await screen.findByRole('dialog', {
            name: /order details/i,
        })
        await within(dialog).findByText('Tags')

        return dialog
    }

    async function getFieldToggle(dialog: HTMLElement, label: string) {
        const row = (await within(dialog).findByText(label)).closest('tr')

        expect(row).not.toBeNull()

        return within(row as HTMLElement).getByRole('switch')
    }

    async function confirmShopifyMetricsChanges(
        user: ReturnType<typeof render>['user'],
    ) {
        const dialog = await openShopifyMetricsPanel(user)
        const confirmButton = within(dialog).getByRole('button', {
            name: /confirm/i,
        })

        await user.click(await getFieldToggle(dialog, 'Note'))

        await waitFor(() => {
            expect(confirmButton).toBeEnabled()
        })

        await user.click(confirmButton)

        await waitFor(() => {
            expect(
                screen.queryByRole('dialog', {
                    name: /shopify metrics/i,
                }),
            ).not.toBeInTheDocument()
        })
    }

    async function confirmOrderDetailsChanges(
        user: ReturnType<typeof render>['user'],
    ) {
        const dialog = await openOrderDetailsPanel(user)
        const confirmButton = within(dialog).getByRole('button', {
            name: /confirm/i,
        })

        await user.click(await getFieldToggle(dialog, 'Tags'))

        await waitFor(() => {
            expect(confirmButton).toBeEnabled()
        })

        await user.click(confirmButton)

        await waitFor(() => {
            expect(
                screen.queryByRole('dialog', {
                    name: /order details/i,
                }),
            ).not.toBeInTheDocument()
        })
    }

    beforeEach(() => {
        vi.clearAllMocks()
        server.use(defaultListWidgetsMock.handler)
    })

    it('renders customer metrics section with field list', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getByText('Customer metrics')).toBeInTheDocument()
        expect(screen.getByText('Total spent')).toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
    })

    it('renders "Edit metrics" button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /edit metrics/i }),
        ).toBeInTheDocument()
    })

    it('renders orders section with "Edit order details" button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        const editOrderButton = screen.getByRole('button', {
            name: /edit order details/i,
        })
        expect(editOrderButton).toBeInTheDocument()
        expect(editOrderButton).toBeEnabled()
    })

    it('renders Cancel and Save buttons', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /save/i }),
        ).toBeInTheDocument()
    })

    it('has Save button disabled when no pending changes', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('calls onClose when Cancel is clicked', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('opens EditShopifyFieldsSidePanel when "Edit metrics" is clicked', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        expect(await openShopifyMetricsPanel(user)).toBeInTheDocument()
    })

    it('passes preferences to EditShopifyFieldsSidePanel', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        const dialog = await openShopifyMetricsPanel(user)
        const toggles = await within(dialog).findAllByRole('switch')
        expect(toggles.length).toBeGreaterThan(0)
    })

    it('renders integration name when provided', () => {
        render(
            <IntermediateEditPanel
                {...defaultProps}
                integrationName="My Shopify Store"
            />,
        )

        expect(screen.getByText('My Shopify Store')).toBeInTheDocument()
    })

    it('renders Add menu buttons for customer and order sections', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getAllByRole('button', { name: /add/i })).toHaveLength(2)
    })

    it('shows Add button and Add link menu items when Add is clicked', async () => {
        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: '/api/widgets',
            }),
        )
        server.use(listWidgetsMock.handler)

        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        const [customerAddButton] = screen.getAllByRole('button', {
            name: /add/i,
        })
        await user.click(customerAddButton)

        await waitFor(() => {
            expect(screen.getByText('Add button')).toBeInTheDocument()
            expect(screen.getByText('Add link')).toBeInTheDocument()
        })
    })

    it('opens EditOrderFieldsSidePanel when "Edit order details" is clicked', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        expect(await openOrderDetailsPanel(user)).toBeInTheDocument()
    })

    it('enables Save button after confirming order field changes', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()

        await confirmOrderDetailsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })
    })

    it('calls onSavePreferences and onClose when saving with shopify changes', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await confirmShopifyMetricsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSavePreferences).toHaveBeenCalledTimes(1)
            expect(defaultProps.onSaveOrderPreferences).not.toHaveBeenCalled()
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('calls onSaveOrderPreferences and onClose when saving with order changes', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await confirmOrderDetailsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSaveOrderPreferences).toHaveBeenCalledTimes(1)
            expect(defaultProps.onSavePreferences).not.toHaveBeenCalled()
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('calls both save callbacks when both shopify and order changes are pending', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await confirmShopifyMetricsChanges(user)
        await confirmOrderDetailsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSavePreferences).toHaveBeenCalledTimes(1)
            expect(defaultProps.onSaveOrderPreferences).toHaveBeenCalledTimes(1)
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('shows error notification when save fails', async () => {
        const onSavePreferences = vi
            .fn()
            .mockRejectedValue(new Error('Network error'))

        const { user } = render(
            <IntermediateEditPanel
                {...defaultProps}
                onSavePreferences={onSavePreferences}
            />,
        )

        await confirmShopifyMetricsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to save changes',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })

        expect(defaultProps.onClose).not.toHaveBeenCalled()
    })

    it('displays existing links and buttons from widget data', async () => {
        const shopifyWidget: Widget = {
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
                                        label: 'Support Portal',
                                        url: 'https://support.example.com',
                                    },
                                ],
                                buttons: [
                                    {
                                        label: 'Refresh Data',
                                        action: {
                                            method: 'GET',
                                            url: 'https://api.example.com/refresh',
                                            headers: [],
                                            params: [],
                                            body: {
                                                contentType: 'application/json',
                                                'application/json': {},
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

        const listWidgetsMock = mockListWidgetsHandler(async () =>
            HttpResponse.json({
                data: [shopifyWidget],
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: '/api/widgets',
            }),
        )
        server.use(listWidgetsMock.handler)

        render(<IntermediateEditPanel {...defaultProps} />)

        await waitFor(() => {
            expect(screen.getByText('Support Portal')).toBeInTheDocument()
            expect(screen.getByText('Refresh Data')).toBeInTheDocument()
        })
    })

    describe('Pending custom actions', () => {
        async function addCustomerLink(
            user: ReturnType<typeof render>['user'],
            { label, url }: { label: string; url: string },
        ) {
            const [customerAddButton] = screen.getAllByRole('button', {
                name: /add/i,
            })
            await user.click(customerAddButton)
            await user.click(
                await screen.findByRole('menuitem', { name: /add link/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /add link/i,
            })
            await user.type(within(dialog).getByLabelText(/title/i), label)
            await user.type(within(dialog).getByLabelText(/url/i), url)

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('dialog', { name: /add link/i }),
                ).not.toBeInTheDocument()
            })
        }

        async function addOrderLink(
            user: ReturnType<typeof render>['user'],
            { label, url }: { label: string; url: string },
        ) {
            const addButtons = screen.getAllByRole('button', { name: /add/i })
            const orderAddButton = addButtons[addButtons.length - 1]
            await user.click(orderAddButton)
            await user.click(
                await screen.findByRole('menuitem', { name: /add link/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /add link/i,
            })
            await user.type(within(dialog).getByLabelText(/title/i), label)
            await user.type(within(dialog).getByLabelText(/url/i), url)

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(
                    screen.queryByRole('dialog', { name: /add link/i }),
                ).not.toBeInTheDocument()
            })
        }

        it('shows added link in the section without firing a network request', async () => {
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: '/api/widgets',
                }),
            )
            let updateCallCount = 0
            let createCallCount = 0
            const updateWidgetMock = mockUpdateWidgetHandler(
                async ({ data }) => {
                    updateCallCount += 1
                    return HttpResponse.json(data)
                },
            )
            const createWidgetMock = mockCreateWidgetHandler(
                async ({ data }) => {
                    createCallCount += 1
                    return HttpResponse.json(data as unknown as Widget)
                },
            )
            server.use(
                listWidgetsMock.handler,
                updateWidgetMock.handler,
                createWidgetMock.handler,
            )

            const { user } = render(<IntermediateEditPanel {...defaultProps} />)

            await addCustomerLink(user, {
                label: 'Pending Link',
                url: 'https://pending.example.com',
            })

            expect(screen.getByText('Pending Link')).toBeInTheDocument()
            expect(updateCallCount).toBe(0)
            expect(createCallCount).toBe(0)
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        }, 10000)

        it('reverts pending custom actions when Cancel is clicked', async () => {
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: '/api/widgets',
                }),
            )
            server.use(listWidgetsMock.handler)

            const { user } = render(<IntermediateEditPanel {...defaultProps} />)

            await addCustomerLink(user, {
                label: 'Throwaway',
                url: 'https://throwaway.example.com',
            })

            expect(screen.getByText('Throwaway')).toBeInTheDocument()

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        }, 10000)

        it('saves customer and order pending custom actions in a single updateWidget call', async () => {
            const existingWidget: Widget = {
                id: 42,
                type: 'shopify',
                context: 'ticket',
                template: {
                    type: 'wrapper',
                    widgets: [
                        {
                            path: 'customer',
                            type: 'customer',
                            meta: { custom: { links: [], buttons: [] } },
                        },
                    ],
                },
            }
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json({
                    data: [existingWidget],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: '/api/widgets',
                }),
            )
            let updateCallCount = 0
            const updateWidgetMock = mockUpdateWidgetHandler(
                async ({ data }) => {
                    updateCallCount += 1
                    return HttpResponse.json(data)
                },
            )
            server.use(listWidgetsMock.handler, updateWidgetMock.handler)

            const waitForUpdateRequest = updateWidgetMock.waitForRequest(server)

            const { user } = render(<IntermediateEditPanel {...defaultProps} />)

            await addCustomerLink(user, {
                label: 'Customer Pending',
                url: 'https://customer.example.com',
            })
            await addOrderLink(user, {
                label: 'Order Pending',
                url: 'https://order.example.com',
            })

            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitForUpdateRequest(async (request) => {
                const body = await request.json()
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                const orderWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'order',
                )
                expect(customerWidget.meta.custom.links[0].label).toBe(
                    'Customer Pending',
                )
                expect(orderWidget.meta.custom.links[0].label).toBe(
                    'Order Pending',
                )
            })

            await waitFor(() => {
                expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
            })

            expect(updateCallCount).toBe(1)
        }, 15000)

        it('creates a single widget with customer and order entries when no widget exists yet', async () => {
            const listWidgetsMock = mockListWidgetsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: '/api/widgets',
                }),
            )
            let createCallCount = 0
            const createWidgetMock = mockCreateWidgetHandler(
                async ({ data }) => {
                    createCallCount += 1
                    return HttpResponse.json(data as unknown as Widget)
                },
            )
            server.use(listWidgetsMock.handler, createWidgetMock.handler)

            const waitForCreateRequest = createWidgetMock.waitForRequest(server)

            const { user } = render(<IntermediateEditPanel {...defaultProps} />)

            await addCustomerLink(user, {
                label: 'New Customer',
                url: 'https://customer.example.com',
            })
            await addOrderLink(user, {
                label: 'New Order',
                url: 'https://order.example.com',
            })

            await user.click(screen.getByRole('button', { name: /save/i }))

            await waitForCreateRequest(async (request) => {
                const body = await request.json()
                expect(body.type).toBe('shopify')
                expect(body.context).toBe('ticket')
                const customerWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'customer',
                )
                const orderWidget = body.template.widgets.find(
                    (w: { path: string }) => w.path === 'order',
                )
                expect(customerWidget.meta.custom.links[0].label).toBe(
                    'New Customer',
                )
                expect(orderWidget.meta.custom.links[0].label).toBe('New Order')
            })

            await waitFor(() => {
                expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
            })

            expect(createCallCount).toBe(1)
        }, 15000)
    })
})
