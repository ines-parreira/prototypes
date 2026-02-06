import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FinancialStatus, FulfillmentStatus } from '../../../types'
import type { OrderCardOrder, OrderCardProduct } from '../../../types'
import { OrderCard } from '../OrderCard'

const mockOrder: OrderCardOrder = {
    name: '#1234',
    currency: 'USD',
    total_price: '99.99',
    financial_status: FinancialStatus.Paid,
    fulfillment_status: null,
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

const mockDisplayedDate = 'Jan 1, 2024'
const mockOnClick = vi.fn()

describe('OrderCard', () => {
    it.each([
        ['order name', '#1234'],
        ['item count', '2 items'],
        ['total price with currency symbol', '$99.99'],
        ['displayed date', 'Jan 1, 2024'],
    ])('should render %s', (_, expectedText) => {
        render(
            <OrderCard
                order={mockOrder}
                displayedDate={mockDisplayedDate}
                onClick={mockOnClick}
            />,
        )
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
            render(
                <OrderCard
                    order={order}
                    displayedDate={mockDisplayedDate}
                    onClick={mockOnClick}
                />,
            )
            expect(screen.getByText(expectedLabel)).toBeInTheDocument()
        },
    )

    it('should render product images with alt text', () => {
        render(
            <OrderCard
                order={mockOrder}
                displayedDate={mockDisplayedDate}
                onClick={mockOnClick}
            />,
        )
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
        render(
            <OrderCard
                order={orderWithManyItems}
                displayedDate={mockDisplayedDate}
                onClick={mockOnClick}
            />,
        )
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
                displayedDate={mockDisplayedDate}
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
                displayedDate={mockDisplayedDate}
                productsMap={productsMap}
                onClick={mockOnClick}
            />,
        )
        const img = screen.getByAltText('Product 4') as HTMLImageElement
        expect(img.src).toContain('example.com/product4')
    })
})
