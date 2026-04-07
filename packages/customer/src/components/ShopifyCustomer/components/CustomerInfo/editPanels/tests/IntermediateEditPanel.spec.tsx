import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, waitFor, within } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockListWidgetsHandler } from '@gorgias/helpdesk-mocks'
import type { Widget } from '@gorgias/helpdesk-types'

import {
    NotificationStatus,
    ShopifyCustomerContext,
} from '../../../../ShopifyCustomerContext'
import { FIELD_DEFINITIONS } from '../../fieldDefinitions/fields'
import type {
    FieldConfig,
    FieldRenderContext,
    OrderFieldPreferences,
    OrderFieldRenderContext,
    ShopifyFieldPreferences,
} from '../../types'
import { IntermediateEditPanel } from '../IntermediateEditPanel'

vi.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
    useDrop: () => [{ isOver: false }, vi.fn()],
}))

vi.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: {},
}))

const defaultListWidgetsMock = mockListWidgetsHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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
        await user.click(screen.getByRole('button', { name: /edit metrics/i }))

        return await screen.findByRole('dialog', {
            name: /shopify metrics/i,
        })
    }

    async function openOrderDetailsPanel(
        user: ReturnType<typeof render>['user'],
    ) {
        await user.click(
            screen.getByRole('button', { name: /edit order details/i }),
        )

        return await screen.findByRole('dialog', {
            name: /order details/i,
        })
    }

    async function confirmShopifyMetricsChanges(
        user: ReturnType<typeof render>['user'],
    ) {
        const dialog = await openShopifyMetricsPanel(user)
        const switches = within(dialog).getAllByRole('switch')
        const confirmButton = within(dialog).getByRole('button', {
            name: /confirm/i,
        })

        await user.click(switches[0])

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
        const switches = within(dialog).getAllByRole('switch')
        const confirmButton = within(dialog).getByRole('button', {
            name: /confirm/i,
        })

        await user.click(switches[0])

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
        const toggles = within(dialog).getAllByRole('switch')
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

    it('renders Add menu button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
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

        await user.click(screen.getByRole('button', { name: /add/i }))

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
        const mockDispatchNotification = vi.fn()

        const { user } = render(
            <ShopifyCustomerContext.Provider
                value={{
                    dispatchNotification: mockDispatchNotification,
                }}
            >
                <IntermediateEditPanel
                    {...defaultProps}
                    onSavePreferences={onSavePreferences}
                />
            </ShopifyCustomerContext.Provider>,
        )

        await confirmShopifyMetricsChanges(user)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(mockDispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Failed to save field preferences',
            })
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
})
