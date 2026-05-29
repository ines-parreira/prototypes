import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DateFormatType, TimeFormatType } from '@repo/utils'

import { FinancialStatus, FulfillmentStatus } from '../../../types'
import type { OrderCardOrder, OrderCardProduct } from '../../../types'
import { OrderCard } from '../OrderCard'

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: DateFormatType.en_US,
        timeFormat: TimeFormatType.AmPm,
        timezone: 'UTC',
    }),
}))

const mockOrder: OrderCardOrder = {
    name: '#1234',
    currency: 'USD',
    total_price: '99.99',
    financial_status: FinancialStatus.Paid,
    fulfillment_status: null,
    // Fixed ISO date old enough (> 7 days) that formatOrderDate returns a
    // compact date string rather than a relative label.
    created_at: '2024-01-01T00:00:00Z',
    line_items: [
        {
            title: 'Product 1',
            product_id: 101,
            variant_id: 201,
        },
        {
            title: 'Product 2',
            product_id: 102,
            variant_id: 202,
        },
    ],
}

const mockOnClick = vi.fn()

describe('OrderCard', () => {
    it.each([
        ['order name', '#1234'],
        ['item count', '2 items'],
        ['total price with currency symbol', '$99.99'],
        ['displayed date', '01/01/2024'],
    ])('should render %s', (_, expectedText) => {
        render(<OrderCard order={mockOrder} onClick={mockOnClick} />)
        expect(screen.getByText(expectedText)).toBeInTheDocument()
    })

    it.each([
        ['financial status (Paid)', FinancialStatus.Paid, null, 'Paid'],
        [
            'fulfillment status (Unfulfilled)',
            FinancialStatus.Paid,
            null,
            'Unfulfilled',
        ],
        [
            'fulfillment status (Fulfilled)',
            FinancialStatus.Paid,
            FulfillmentStatus.Fulfilled,
            'Fulfilled',
        ],
    ])(
        'should render %s',
        (_, financialStatus, fulfillmentStatus, expectedLabel) => {
            const order = {
                ...mockOrder,
                financial_status: financialStatus,
                fulfillment_status: fulfillmentStatus,
            }
            render(<OrderCard order={order} onClick={mockOnClick} />)
            expect(screen.getByText(expectedLabel)).toBeInTheDocument()
        },
    )

    it('should render product images with alt text', () => {
        render(<OrderCard order={mockOrder} onClick={mockOnClick} />)
        expect(screen.getByAltText('Product 1')).toBeInTheDocument()
        expect(screen.getByAltText('Product 2')).toBeInTheDocument()
    })

    it('should show +N indicator when more than 3 items', () => {
        const orderWithManyItems: OrderCardOrder = {
            ...mockOrder,
            line_items: [
                ...mockOrder.line_items,
                { title: 'Product 3', product_id: 103, variant_id: 203 },
                { title: 'Product 4', product_id: 104, variant_id: 204 },
                { title: 'Product 5', product_id: 105, variant_id: 205 },
            ],
        }
        render(<OrderCard order={orderWithManyItems} onClick={mockOnClick} />)
        expect(screen.getByText(/\+2/)).toBeInTheDocument()
    })

    it('should use product images from productsMap when provided', () => {
        const productsMap = new Map<number, OrderCardProduct>([
            [
                101,
                {
                    image: {
                        src: 'https://example.com/product1.jpg',
                        variant_ids: [],
                    },
                    images: [],
                },
            ],
        ])
        render(
            <OrderCard
                order={mockOrder}
                productsMap={productsMap}
                onClick={mockOnClick}
            />,
        )
        const img = screen.getByAltText('Product 1') as HTMLImageElement
        expect(img.src).toContain('example.com/product1')
    })

    it('should use product image for 4th item from productsMap when more than 3 items', () => {
        const orderWithManyItems: OrderCardOrder = {
            ...mockOrder,
            line_items: [
                { title: 'Product 1', product_id: 101, variant_id: 201 },
                { title: 'Product 2', product_id: 102, variant_id: 202 },
                { title: 'Product 3', product_id: 103, variant_id: 203 },
                { title: 'Product 4', product_id: 104, variant_id: 204 },
            ],
        }
        const productsMap = new Map<number, OrderCardProduct>([
            [
                104,
                {
                    image: {
                        src: 'https://example.com/product4.jpg',
                        variant_ids: [],
                    },
                    images: [],
                },
            ],
        ])
        render(
            <OrderCard
                order={orderWithManyItems}
                productsMap={productsMap}
                onClick={mockOnClick}
            />,
        )
        const img = screen.getByAltText('Product 4') as HTMLImageElement
        expect(img.src).toContain('example.com/product4')
    })

    describe('draft order status rendering', () => {
        const draftOrder: OrderCardOrder = {
            ...mockOrder,
            name: '#D1001',
            status: 'open',
            invoice_sent_at: null,
        }

        it.each([
            ['open', null, 'Open'],
            ['invoice_sent', null, 'Invoice sent'],
            ['completed', null, 'Completed'],
        ] as const)(
            'renders Draft + "%s" tag for status %s',
            (status, invoiceSentAt, expectedLabel) => {
                render(
                    <OrderCard
                        order={{
                            ...draftOrder,
                            status,
                            invoice_sent_at: invoiceSentAt,
                        }}
                        isDraftOrder
                    />,
                )
                expect(screen.getByText('Draft')).toBeInTheDocument()
                expect(screen.getByText(expectedLabel)).toBeInTheDocument()
            },
        )

        it('falls back to "Invoice sent" when status is missing but invoice_sent_at is present', () => {
            render(
                <OrderCard
                    order={{
                        ...mockOrder,
                        name: '#D1002',
                        invoice_sent_at: '2024-01-15T10:00:00Z',
                    }}
                    isDraftOrder
                />,
            )
            expect(screen.getByText('Draft')).toBeInTheDocument()
            expect(screen.getByText('Invoice sent')).toBeInTheDocument()
        })

        it('does not render Cancelled, financial, or fulfillment tags for drafts', () => {
            render(
                <OrderCard
                    order={{
                        ...draftOrder,
                        cancelled_at: '2024-01-15T10:00:00Z',
                        fulfillment_status: null,
                    }}
                    isDraftOrder
                />,
            )
            expect(screen.queryByText('Cancelled')).not.toBeInTheDocument()
            expect(screen.queryByText('Unfulfilled')).not.toBeInTheDocument()
            expect(screen.queryByText('Unknown')).not.toBeInTheDocument()
            expect(screen.queryByText('Paid')).not.toBeInTheDocument()
        })

        it('renders financial and fulfillment tags for regular orders even when draft fields are present', () => {
            render(
                <OrderCard
                    order={{
                        ...mockOrder,
                        status: 'open',
                        invoice_sent_at: null,
                    }}
                />,
            )
            expect(screen.getByText('Paid')).toBeInTheDocument()
            expect(screen.getByText('Unfulfilled')).toBeInTheDocument()
            expect(screen.queryByText('Open')).not.toBeInTheDocument()
        })
    })
})
