import type { OrderProduct } from '@repo/ecommerce'
import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import type { OrderEcommerceData } from '../../../types'
import { OrdersList } from '../OrdersList'

const mockOrderData: OrderEcommerceData = {
    id: 'order-1',
    account_id: 1,
    created_datetime: '2024-01-15T10:00:00Z',
    updated_datetime: '2024-01-15T10:00:00Z',
    source_type: 'shopify',
    integration_id: 1,
    external_id: 'ext-order-1',
    data: {
        id: 12345,
        order_number: 1001,
        name: '#1001',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        currency: 'USD',
        total_price: '99.99',
        financial_status: 'paid',
        fulfillment_status: 'fulfilled',
        line_items: [
            {
                id: 1,
                title: 'Test Product',
                quantity: 2,
                price: '49.99',
                product_id: 100,
                variant_id: 200,
            },
        ],
        customer: {
            id: 456,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            first_name: 'John',
            last_name: 'Doe',
            state: 'enabled',
            note: '',
            verified_email: true,
            multipass_identifier: null,
            tax_exempt: false,
            email: 'john@example.com',
            phone: null,
            currency: 'USD',
            addresses: [],
            tax_exemptions: [],
            admin_graphql_api_id: 'gid://shopify/Customer/456',
            default_address: null,
            tags: '',
        },
    },
}

const mockSecondOrderData: OrderEcommerceData = {
    ...mockOrderData,
    id: 'order-2',
    external_id: 'ext-order-2',
    data: {
        ...mockOrderData.data,
        id: 12346,
        order_number: 1002,
        name: '#1002',
        created_at: '2024-01-16T10:00:00Z',
    },
}

const mockProductsMap = new Map<number, OrderProduct>([
    [
        100,
        {
            id: 100,
            title: 'Test Product',
            image: {
                alt: 'Test Product Image',
                src: 'https://example.com/image.jpg',
                variant_ids: [200],
            },
            images: [
                {
                    alt: 'Test Product Image',
                    src: 'https://example.com/image.jpg',
                    variant_ids: [200],
                },
            ],
        },
    ],
])

describe('OrdersList', () => {
    it('renders nothing when isLoadingOrders is true', () => {
        const { container } = render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={true}
                productsMap={mockProductsMap}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when orders array is empty', () => {
        const { container } = render(
            <OrdersList
                orders={[]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('renders OrdersHeader with correct orders count', () => {
        render(
            <OrdersList
                orders={[mockOrderData, mockSecondOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders OrderCard for each order', () => {
        render(
            <OrdersList
                orders={[mockOrderData, mockSecondOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(screen.getByText('#1001')).toBeInTheDocument()
        expect(screen.getByText('#1002')).toBeInTheDocument()
    })

    it('displays product images for orders', () => {
        render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(screen.getByAltText('Test Product')).toBeInTheDocument()
    })

    it('displays order price and item count', () => {
        render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(screen.getByText('$99.99')).toBeInTheDocument()
        expect(screen.getByText('1 item')).toBeInTheDocument()
    })

    it('displays financial and fulfillment status tags', () => {
        render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.getByText('Fulfilled')).toBeInTheDocument()
    })

    it('renders Create order button', () => {
        render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={false}
                productsMap={mockProductsMap}
            />,
        )

        expect(
            screen.getByRole('button', { name: /create order/i }),
        ).toBeInTheDocument()
    })

    it('renders with undefined productsMap', () => {
        render(
            <OrdersList
                orders={[mockOrderData]}
                isLoadingOrders={false}
                productsMap={undefined}
            />,
        )

        expect(screen.getByText('#1001')).toBeInTheDocument()
    })
})
