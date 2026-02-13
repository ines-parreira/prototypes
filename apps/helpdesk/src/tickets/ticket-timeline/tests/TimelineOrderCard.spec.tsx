import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import type { Order, Product } from 'constants/integrations/types/shopify'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { TimelineOrderCard } from '../components/TimelineOrderCard'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2MS2Flag: jest.fn(),
}))

const mockUseHelpdeskV2MS2Flag = jest.mocked(useHelpdeskV2MS2Flag)

const createMockOrder = (overrides: Partial<Order>): Order =>
    ({
        id: 1,
        name: '#1001',
        line_items: [],
        financial_status: 'paid' as any,
        fulfillment_status: null,
        note: '',
        tags: '',
        shipping_address: {} as any,
        billing_address: {} as any,
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '100.00',
        total_discounts: '0.00',
        subtotal_price: '100.00',
        total_tax: '10.00',
        total_price: '110.00',
        currency: 'USD',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        ...overrides,
    }) as Order

const renderOrderCard = (order: Order, onSelect?: (order: Order) => void) => {
    const productsMap = new Map()
    return renderWithStoreAndQueryClientProvider(
        <MemoryRouter>
            <TimelineOrderCard
                order={order}
                productsMap={productsMap}
                displayedDate="Jan 1, 2024"
                onSelect={onSelect}
            />
        </MemoryRouter>,
    )
}

beforeEach(() => {
    mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
})

describe('TimelineOrderCard - Financial Status (getFinancialStatusInfo)', () => {
    it('should display "Paid" status for paid orders', () => {
        const order = createMockOrder({ financial_status: 'paid' as any })
        renderOrderCard(order)

        expect(screen.getByText('Paid')).toBeInTheDocument()
    })

    it('should display "Pending" status for pending orders', () => {
        const order = createMockOrder({ financial_status: 'pending' as any })
        renderOrderCard(order)

        expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    it('should display "Partially paid" status', () => {
        const order = createMockOrder({
            financial_status: 'partially_paid' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Partially paid')).toBeInTheDocument()
    })

    it('should display "Refunded" status for refunded orders', () => {
        const order = createMockOrder({ financial_status: 'refunded' as any })
        renderOrderCard(order)

        expect(screen.getByText('Refunded')).toBeInTheDocument()
    })

    it('should display "Voided" status for voided orders', () => {
        const order = createMockOrder({ financial_status: 'voided' as any })
        renderOrderCard(order)

        expect(screen.getByText('Voided')).toBeInTheDocument()
    })

    it('should display "Partially refunded" status', () => {
        const order = createMockOrder({
            financial_status: 'partially_refunded' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Partially refunded')).toBeInTheDocument()
    })

    it('should display "Unknown" status for unrecognized financial status', () => {
        const order = createMockOrder({
            financial_status: 'invalid_status' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
})

describe('TimelineOrderCard - Fulfillment Status (getFulfillmentStatusInfo)', () => {
    it('should display "Unfulfilled" status when fulfillment_status is null', () => {
        const order = createMockOrder({ fulfillment_status: null })
        renderOrderCard(order)

        expect(screen.getByText('Unfulfilled')).toBeInTheDocument()
    })

    it('should display "Fulfilled" status for fulfilled orders', () => {
        const order = createMockOrder({
            fulfillment_status: 'fulfilled' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Fulfilled')).toBeInTheDocument()
    })

    it('should display "Partially fulfilled" status', () => {
        const order = createMockOrder({
            fulfillment_status: 'partial' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Partially fulfilled')).toBeInTheDocument()
    })

    it('should display "Restocked" status for restocked orders', () => {
        const order = createMockOrder({
            fulfillment_status: 'restocked' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Restocked')).toBeInTheDocument()
    })

    it('should display "Unknown" status for unrecognized fulfillment status', () => {
        const order = createMockOrder({
            fulfillment_status: 'invalid_status' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
})

describe('TimelineOrderCard - Combined Financial and Fulfillment Status', () => {
    it('should display both financial and fulfillment status tags together', () => {
        const order = createMockOrder({
            financial_status: 'paid' as any,
            fulfillment_status: 'fulfilled' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Paid')).toBeInTheDocument()
        expect(screen.getByText('Fulfilled')).toBeInTheDocument()
    })

    it('should display correct status combinations for partially paid and partially fulfilled', () => {
        const order = createMockOrder({
            financial_status: 'partially_paid' as any,
            fulfillment_status: 'partial' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Partially paid')).toBeInTheDocument()
        expect(screen.getByText('Partially fulfilled')).toBeInTheDocument()
    })

    it('should display correct status combinations for refunded and restocked', () => {
        const order = createMockOrder({
            financial_status: 'refunded' as any,
            fulfillment_status: 'restocked' as any,
        })
        renderOrderCard(order)

        expect(screen.getByText('Refunded')).toBeInTheDocument()
        expect(screen.getByText('Restocked')).toBeInTheDocument()
    })
})

describe('TimelineOrderCard - Image Display (getLineItemImageSrc)', () => {
    it('should display default image when product is not found', () => {
        const order = createMockOrder({
            line_items: [
                {
                    id: 1,
                    product_id: 999,
                    variant_id: 999,
                    title: 'Unknown Product',
                    variant_title: 'Unknown',
                    quantity: 1,
                    price: '10.00',
                } as any,
            ],
        })

        const productsMap = new Map()
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineOrderCard
                    order={order}
                    productsMap={productsMap}
                    displayedDate="Jan 1, 2024"
                />
            </MemoryRouter>,
        )

        const images = screen.getAllByRole('img')
        const productImage = images.find(
            (img) => img.getAttribute('alt') === 'Unknown Product',
        )

        expect(productImage?.getAttribute('src')).toBe('test-file-stub')
    })

    it('should display variant-specific image when available', () => {
        const product: Product = {
            id: 100,
            title: 'T-Shirt',
            vendor: 'Test Vendor',
            product_type: 'Apparel',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-01T00:00:00Z',
            tags: '',
            image: {
                id: 1,
                src: 'https://cdn.shopify.com/main-image.jpg',
                alt: 'Main image',
                variant_ids: [],
            },
            images: [
                {
                    id: 1,
                    src: 'https://cdn.shopify.com/main-image.jpg',
                    alt: 'Main image',
                    variant_ids: [],
                },
                {
                    id: 2,
                    src: 'https://cdn.shopify.com/blue-variant.jpg',
                    alt: 'Blue variant',
                    variant_ids: [999],
                },
            ],
            variants: [],
            options: [],
        } as Product

        const order = createMockOrder({
            line_items: [
                {
                    id: 1,
                    product_id: 100,
                    variant_id: 999,
                    title: 'T-Shirt',
                    variant_title: 'Blue',
                    quantity: 1,
                    price: '25.00',
                } as any,
            ],
        })

        const productsMap = new Map()
        productsMap.set(100, product)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineOrderCard
                    order={order}
                    productsMap={productsMap}
                    displayedDate="Jan 1, 2024"
                />
            </MemoryRouter>,
        )

        const images = screen.getAllByRole('img')
        const productImage = images.find(
            (img) => img.getAttribute('alt') === 'T-Shirt',
        )

        expect(productImage?.getAttribute('src')).toContain('blue-variant')
    })

    it('should fall back to main product image when no variant-specific image exists', () => {
        const product: Product = {
            id: 100,
            title: 'Hat',
            vendor: 'Test Vendor',
            product_type: 'Accessories',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-01T00:00:00Z',
            tags: '',
            image: {
                id: 1,
                src: 'https://cdn.shopify.com/hat-main.jpg',
                alt: 'Hat main image',
                variant_ids: [],
            },
            images: [
                {
                    id: 1,
                    src: 'https://cdn.shopify.com/hat-main.jpg',
                    alt: 'Hat main image',
                    variant_ids: [],
                },
            ],
            variants: [],
            options: [],
        } as Product

        const order = createMockOrder({
            line_items: [
                {
                    id: 1,
                    product_id: 100,
                    variant_id: 888,
                    title: 'Hat',
                    variant_title: 'One Size',
                    quantity: 1,
                    price: '15.00',
                } as any,
            ],
        })

        const productsMap = new Map()
        productsMap.set(100, product)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineOrderCard
                    order={order}
                    productsMap={productsMap}
                    displayedDate="Jan 1, 2024"
                />
            </MemoryRouter>,
        )

        const images = screen.getAllByRole('img')
        const productImage = images.find((img) =>
            img.getAttribute('alt')?.includes('Hat'),
        )

        expect(productImage?.getAttribute('src')).toContain('hat-main')
    })

    it('should display default image when product has no images', () => {
        const product: Product = {
            id: 100,
            title: 'Product Without Image',
            vendor: 'Test Vendor',
            product_type: 'Test',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-01T00:00:00Z',
            tags: '',
            image: null,
            images: [],
            variants: [],
            options: [],
        } as Product

        const order = createMockOrder({
            line_items: [
                {
                    id: 1,
                    product_id: 100,
                    variant_id: 100,
                    title: 'Product Without Image',
                    variant_title: 'Default',
                    quantity: 1,
                    price: '10.00',
                } as any,
            ],
        })

        const productsMap = new Map()
        productsMap.set(100, product)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineOrderCard
                    order={order}
                    productsMap={productsMap}
                    displayedDate="Jan 1, 2024"
                />
            </MemoryRouter>,
        )

        const images = screen.getAllByRole('img')
        const productImage = images.find(
            (img) => img.getAttribute('alt') === 'Product Without Image',
        )

        expect(productImage?.getAttribute('src')).toBe('test-file-stub')
    })

    it('should display multiple product images when order has multiple line items', () => {
        const product1: Product = {
            id: 100,
            title: 'Product 1',
            vendor: 'Test Vendor',
            product_type: 'Test',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-01T00:00:00Z',
            tags: '',
            image: {
                id: 1,
                src: 'https://cdn.shopify.com/product1.jpg',
                alt: 'Product 1',
                variant_ids: [],
            },
            images: [],
            variants: [],
            options: [],
        } as Product

        const product2: Product = {
            id: 200,
            title: 'Product 2',
            vendor: 'Test Vendor',
            product_type: 'Test',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            published_at: '2024-01-01T00:00:00Z',
            tags: '',
            image: {
                id: 2,
                src: 'https://cdn.shopify.com/product2.jpg',
                alt: 'Product 2',
                variant_ids: [],
            },
            images: [],
            variants: [],
            options: [],
        } as Product

        const order = createMockOrder({
            line_items: [
                {
                    id: 1,
                    product_id: 100,
                    variant_id: 100,
                    title: 'Product 1',
                    variant_title: 'Variant 1',
                    quantity: 1,
                    price: '10.00',
                } as any,
                {
                    id: 2,
                    product_id: 200,
                    variant_id: 200,
                    title: 'Product 2',
                    variant_title: 'Variant 2',
                    quantity: 1,
                    price: '20.00',
                } as any,
            ],
        })

        const productsMap = new Map()
        productsMap.set(100, product1)
        productsMap.set(200, product2)

        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <TimelineOrderCard
                    order={order}
                    productsMap={productsMap}
                    displayedDate="Jan 1, 2024"
                />
            </MemoryRouter>,
        )

        const images = screen.getAllByRole('img')
        const product1Image = images.find(
            (img) => img.getAttribute('alt') === 'Product 1',
        )
        const product2Image = images.find(
            (img) => img.getAttribute('alt') === 'Product 2',
        )

        expect(product1Image?.getAttribute('src')).toContain('product1')
        expect(product2Image?.getAttribute('src')).toContain('product2')
    })
})

describe('TimelineOrderCard - onClick behavior with feature flag', () => {
    it('should trigger onSelect when feature flag is true and card is clicked', async () => {
        const user = userEvent.setup()
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const order = createMockOrder({ financial_status: 'paid' as any })
        const onSelect = jest.fn()

        renderOrderCard(order, onSelect)

        const orderText = screen.getByText('#1001')
        const card = orderText.closest('div[class*="orderCard"]')

        await user.click(card!.parentElement!)

        expect(onSelect).toHaveBeenCalledWith(order)
        expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('should not trigger onSelect when feature flag is false and card is clicked', async () => {
        const user = userEvent.setup()
        mockUseHelpdeskV2MS2Flag.mockReturnValue(false)
        const order = createMockOrder({ financial_status: 'paid' as any })
        const onSelect = jest.fn()

        renderOrderCard(order, onSelect)

        const orderText = screen.getByText('#1001')
        const card = orderText.closest('div[class*="orderCard"]')

        await user.click(card!.parentElement!)

        expect(onSelect).not.toHaveBeenCalled()
    })

    it('should not trigger onSelect when onSelect is not provided', async () => {
        const user = userEvent.setup()
        mockUseHelpdeskV2MS2Flag.mockReturnValue(true)
        const order = createMockOrder({ financial_status: 'paid' as any })
        const onSelect = jest.fn()

        renderOrderCard(order)

        const orderText = screen.getByText('#1001')
        const card = orderText.closest('div[class*="orderCard"]')

        await user.click(card!.parentElement!)

        expect(onSelect).not.toHaveBeenCalled()
    })
})
