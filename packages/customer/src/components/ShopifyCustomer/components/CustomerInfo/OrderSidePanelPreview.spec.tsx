import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { vi } from 'vitest'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { OrderSidePanelPreview } from './OrderSidePanelPreview'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        EnableShopifyMetafieldsIngestionUI:
            'EnableShopifyMetafieldsIngestionUI',
    },
    useFlag: vi.fn().mockReturnValue(false),
}))

const mockGetCurrentUser = mockGetCurrentUserHandler()
const usersHandler = http.get('/api/users/:id', () => HttpResponse.json({}))

const server = setupServer(mockGetCurrentUser.handler, usersHandler)

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

const shopOrderTagsHandler = http.get(
    '/integrations/shopify/shop-tags/orders/list/',
    () => HttpResponse.json({ data: { shop: { orderTags: { edges: [] } } } }),
)

const metafieldsHandler = http.get(
    '/integrations/shopify/:integrationId/order/:orderId/metafields',
    () => HttpResponse.json({ data: [], meta: {} }),
)

const definitionsHandler = http.get(
    '/api/integrations/shopify/:integrationId/metafield-definitions',
    () => HttpResponse.json({ data: [], meta: {} }),
)

const mockOrder = {
    id: 3519,
    name: '#3519',
    financial_status: 'paid' as const,
    fulfillment_status: 'fulfilled' as const,
}

const mockPendingOrder = {
    id: 3520,
    name: '#3520',
    financial_status: 'pending' as const,
    fulfillment_status: null,
}

const mockOrderWithDetails = {
    id: 12345,
    name: '#12345',
    financial_status: 'paid' as const,
    fulfillment_status: 'fulfilled' as const,
    tags: 'VIP, Summer',
    note: 'Handle with care',
    created_at: '2024-01-15T10:30:00Z',
}

describe('OrderSidePanelPreview', () => {
    it('should not render when order is null', () => {
        const { container } = render(
            <OrderSidePanelPreview
                order={null}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render order details when open', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText(/Order #3519/i)).toBeInTheDocument()
        })
    })

    it('should display app-shopify icon', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            const icon = screen.getByRole('img', {
                name: 'app-shopify',
            })
            expect(icon).toBeInTheDocument()
        })
    })

    it('should display financial status tag', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Paid')).toBeInTheDocument()
        })
    })

    it('should display fulfillment status tag', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Fulfilled')).toBeInTheDocument()
        })
    })

    it('should display pending status for pending orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockPendingOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Pending')).toBeInTheDocument()
        })
    })

    it('should display unfulfilled status for unfulfilled orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockPendingOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Unfulfilled')).toBeInTheDocument()
        })
    })

    it('should render action buttons for non-draft orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onDuplicate={vi.fn()}
                onRefund={vi.fn()}
                onCancel={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /duplicate/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /refund/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /cancel/i }),
            ).toBeInTheDocument()
        })
    })

    it('should not render action buttons for draft orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                isDraftOrder={true}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText(/Order #3519/i)).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('button', { name: /duplicate/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /refund/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /cancel/i }),
        ).not.toBeInTheDocument()
    })

    it('should call onOpenChange when close button is clicked', async () => {
        const onOpenChange = vi.fn()

        const { user } = render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )

        const closeButton = await screen.findByRole('button', {
            name: /close preview/i,
        })
        await user.click(closeButton)

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should call onDuplicate when duplicate button is clicked', async () => {
        const onDuplicate = vi.fn()

        const { user } = render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onDuplicate={onDuplicate}
            />,
        )

        const duplicateButton = await screen.findByRole('button', {
            name: /duplicate/i,
        })
        await user.click(duplicateButton)

        expect(onDuplicate).toHaveBeenCalledWith(mockOrder)
    })

    it('should call onRefund when refund button is clicked', async () => {
        const onRefund = vi.fn()

        const { user } = render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onRefund={onRefund}
            />,
        )

        const refundButton = await screen.findByRole('button', {
            name: /refund/i,
        })
        await user.click(refundButton)

        expect(onRefund).toHaveBeenCalledWith(mockOrder)
    })

    it('should call onCancel when cancel button is clicked', async () => {
        const onCancel = vi.fn()

        const { user } = render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
                onCancel={onCancel}
            />,
        )

        const cancelButton = await screen.findByRole('button', {
            name: /cancel/i,
        })
        await user.click(cancelButton)

        expect(onCancel).toHaveBeenCalledWith(mockOrder)
    })
})

describe('OrderSidePanelPreview — footer View Order link', () => {
    it('renders View Order link with correct href when order_status_url is provided', async () => {
        const orderStatusUrl = 'https://example.myshopify.com/orders/abc123'

        render(
            <OrderSidePanelPreview
                order={{ ...mockOrder, order_status_url: orderStatusUrl }}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        const link = await screen.findByRole('link', { name: /view order/i })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', orderStatusUrl)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not render View Order link when order_status_url is absent', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrder}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText(/Order #3519/i)).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('link', { name: /view order/i }),
        ).not.toBeInTheDocument()
    })
})

describe('OrderSidePanelPreview — Order Details section', () => {
    beforeEach(() => {
        server.use(shopOrderTagsHandler, metafieldsHandler, definitionsHandler)
    })

    it('renders "Order details" section header', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Order details')).toBeInTheDocument()
        })
    })

    it('renders Tags label when order has tags and integrationId is provided', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
                integrationId={1}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Tags')).toBeInTheDocument()
        })
    })

    it('renders tag chips when integrationId is provided', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
                integrationId={1}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('VIP')).toBeInTheDocument()
            expect(screen.getByText('Summer')).toBeInTheDocument()
        })
    })

    it('renders Add tags button when order has no tags', async () => {
        render(
            <OrderSidePanelPreview
                order={{ ...mockOrderWithDetails, tags: '' }}
                isOpen={true}
                onOpenChange={vi.fn()}
                integrationId={1}
            />,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /add tags/i }),
            ).toBeInTheDocument()
        })
    })

    it('renders store name when provided', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
                storeName="My Shopify Store"
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('My Shopify Store')).toBeInTheDocument()
        })
    })

    it('renders order ID', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('12345')).toBeInTheDocument()
        })
    })

    it('renders note when provided', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Handle with care')).toBeInTheDocument()
        })
    })

    it('renders checkout URL for draft orders with invoice_url', async () => {
        const invoiceUrl = 'https://checkout.example.com/order/123'

        render(
            <OrderSidePanelPreview
                order={{ ...mockOrderWithDetails, invoice_url: invoiceUrl }}
                isOpen={true}
                onOpenChange={vi.fn()}
                isDraftOrder={true}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Checkout URL')).toBeInTheDocument()
            expect(screen.getByText(invoiceUrl)).toBeInTheDocument()
        })
    })

    it('does not render checkout URL for non-draft orders', async () => {
        render(
            <OrderSidePanelPreview
                order={mockOrderWithDetails}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Order details')).toBeInTheDocument()
        })

        expect(screen.queryByText('Checkout URL')).not.toBeInTheDocument()
    })

    it('does not render note section when note is absent', async () => {
        const orderWithoutNote = { ...mockOrderWithDetails, note: undefined }

        render(
            <OrderSidePanelPreview
                order={orderWithoutNote}
                isOpen={true}
                onOpenChange={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(
                screen.queryByText('Handle with care'),
            ).not.toBeInTheDocument()
        })
    })
})

describe('OrderSidePanelPreview — metafields inside Order Details section', () => {
    beforeEach(() => {
        server.use(shopOrderTagsHandler, metafieldsHandler, definitionsHandler)
    })

    it('renders metafield value inside the Order details section', async () => {
        server.use(
            http.get(
                '/api/integrations/shopify/:integrationId/metafield-definitions',
                () =>
                    HttpResponse.json({
                        data: [{ key: 'note', name: 'Note' }],
                        meta: {},
                    }),
            ),
        )

        render(
            <OrderSidePanelPreview
                order={{
                    ...mockOrderWithDetails,
                    metafields: [
                        {
                            key: 'note',
                            type: 'single_line_text_field',
                            value: 'Rush order',
                        },
                    ],
                }}
                isOpen={true}
                onOpenChange={vi.fn()}
                integrationId={1}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Order details')).toBeInTheDocument()
            expect(screen.getByText('Rush order')).toBeInTheDocument()
        })
    })

    it('renders metafield label and value using definition name when available', async () => {
        server.use(
            http.get(
                '/api/integrations/shopify/:integrationId/metafield-definitions',
                () =>
                    HttpResponse.json({
                        data: [
                            {
                                namespace: 'custom',
                                key: 'gift_message',
                                name: 'Gift Message',
                            },
                        ],
                        meta: {},
                    }),
            ),
        )

        render(
            <OrderSidePanelPreview
                order={{
                    ...mockOrderWithDetails,
                    metafields: [
                        {
                            namespace: 'custom',
                            key: 'gift_message',
                            type: 'single_line_text_field',
                            value: 'Happy Birthday!',
                        },
                    ],
                }}
                isOpen={true}
                onOpenChange={vi.fn()}
                integrationId={1}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Gift Message')).toBeInTheDocument()
            expect(screen.getByText('Happy Birthday!')).toBeInTheDocument()
        })
    })
})
