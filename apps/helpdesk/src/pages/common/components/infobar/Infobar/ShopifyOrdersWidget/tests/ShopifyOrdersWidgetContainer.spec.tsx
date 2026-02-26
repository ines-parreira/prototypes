import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useAppSelector from 'hooks/useAppSelector'

import { ShopifyOrdersWidgetContainer } from '../ShopifyOrdersWidgetContainer'
import { useShopifyOrdersSummary } from '../useShopifyOrdersSummary'
import { useWidgetOrderProducts } from '../useWidgetOrderProducts'

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))

jest.mock('../useShopifyOrdersSummary', () => ({
    useShopifyOrdersSummary: jest.fn(),
}))

jest.mock('../useWidgetOrderProducts', () => ({
    useWidgetOrderProducts: jest.fn(),
}))

jest.mock('@repo/ecommerce/shopify/components', () => ({
    OrderCard: ({ order }: { order: { name: string } }) => (
        <div>{order.name}</div>
    ),
}))

jest.mock('@repo/ecommerce/shopify/utils', () => ({
    ...jest.requireActual('@repo/ecommerce/shopify/utils'),
    formatOrderDate: (date: string) => date,
}))

const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseTicketInfobarNavigation = assumeMock(useTicketInfobarNavigation)
const mockUseShopifyOrdersSummary = assumeMock(useShopifyOrdersSummary)
const mockUseWidgetOrderProducts = assumeMock(useWidgetOrderProducts)

const mockOnChangeTab = jest.fn()

function createOrder(overrides: Record<string, any> = {}) {
    return {
        id: 1,
        name: '#1001',
        currency: 'USD',
        total_price: '99.99',
        financial_status: 'paid' as any,
        fulfillment_status: null,
        line_items: [],
        note: '',
        tags: '',
        shipping_address: {} as any,
        billing_address: {} as any,
        discount_codes: [],
        shipping_lines: [],
        total_line_items_price: '99.99',
        total_discounts: '0',
        subtotal_price: '99.99',
        total_tax: '0',
        taxes_included: false,
        discount_applications: [],
        refunds: [],
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        ...overrides,
    }
}

beforeEach(() => {
    jest.clearAllMocks()

    mockUseAppSelector.mockReturnValue(undefined)
    mockUseTicketInfobarNavigation.mockReturnValue({
        activeTab: TicketInfobarTab.Customer,
        onChangeTab: mockOnChangeTab,
        onToggle: jest.fn(),
        isExpanded: true,
        isEditShopifyFieldsOpen: false,
        onToggleEditShopifyFields: jest.fn(),
    })
    mockUseWidgetOrderProducts.mockReturnValue({
        productsMap: new Map(),
    })
})

describe('ShopifyOrdersWidgetContainer', () => {
    it('should render nothing when there are no orders', () => {
        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: null,
            totalCount: 0,
            unfulfilledCount: 0,
            integrationId: undefined,
        })

        const { container } = render(<ShopifyOrdersWidgetContainer />)

        expect(container).toBeEmptyDOMElement()
    })

    it('should render the widget when there is a last order', () => {
        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: createOrder(),
            totalCount: 3,
            unfulfilledCount: 1,
            integrationId: 42,
        })

        render(<ShopifyOrdersWidgetContainer />)

        expect(screen.getByText('Orders')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('1 unfulfilled')).toBeInTheDocument()
        expect(screen.getByText('#1001')).toBeInTheDocument()
    })

    it('should navigate to Shopify tab with integration id when "Show all" is clicked', async () => {
        const user = userEvent.setup()

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: createOrder(),
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
        })

        render(<ShopifyOrdersWidgetContainer />)

        await user.click(screen.getByRole('button', { name: /show all/i }))

        expect(mockOnChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify, {
            shopifyIntegrationId: 42,
        })
    })
})
