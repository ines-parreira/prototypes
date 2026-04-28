import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock, render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetCustomerHandler,
} from '@gorgias/helpdesk-mocks'

import useAppSelector from 'hooks/useAppSelector'
import { getActiveCustomer } from 'state/customers/selectors'
import { getTicketCustomer } from 'state/ticket/selectors'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

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

jest.mock('@repo/ecommerce/shopify/utils', () => ({
    ...jest.requireActual('@repo/ecommerce/shopify/utils'),
    formatOrderDate: (date: string) => date,
}))

jest.mock(
    'Widgets/modules/Shopify/modules/Order/components/OrderSidePanelWithActions',
    () => ({
        OrderSidePanelWithActions: ({
            isOpen,
            customerId,
            order,
            hasPrevious,
            hasNext,
            onNavigatePrevious,
            onNavigateNext,
        }: {
            isOpen: boolean
            customerId?: string
            order?: { name?: string } | null
            hasPrevious?: boolean
            hasNext?: boolean
            onNavigatePrevious?: () => void
            onNavigateNext?: () => void
        }) =>
            isOpen ? (
                <div>
                    <span>
                        OrderSidePanelWithActions customerId:{customerId}
                    </span>
                    <span>order:{order?.name}</span>
                    {onNavigatePrevious && (
                        <button
                            onClick={onNavigatePrevious}
                            disabled={!hasPrevious}
                        >
                            Previous
                        </button>
                    )}
                    {onNavigateNext && (
                        <button onClick={onNavigateNext} disabled={!hasNext}>
                            Next
                        </button>
                    )}
                </div>
            ) : null,
    }),
)

const mockGetCurrentUser = mockGetCurrentUserHandler()
const mockGetCustomer = mockGetCustomerHandler()

const server = setupServer(
    mockGetCurrentUser.handler,
    mockGetCustomer.handler,
    http.get('/api/users/:id', () => HttpResponse.json({})),
    http.get('/integrations/shopify/shop-tags/orders/list/', () =>
        HttpResponse.json({
            data: { shop: { orderTags: { edges: [] } } },
        }),
    ),
    http.get(
        '/integrations/shopify/:integrationId/order/:orderId/metafields',
        () => HttpResponse.json({ data: [], meta: {} }),
    ),
)

const queryClient = mockQueryClient()

const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseTicketInfobarNavigation = assumeMock(useTicketInfobarNavigation)
const mockUseShopifyOrdersSummary = assumeMock(useShopifyOrdersSummary)
const mockUseWidgetOrderProducts = assumeMock(useWidgetOrderProducts)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

const mockOnChangeTab = jest.fn()

function renderComponent() {
    return render(
        <QueryClientProvider client={queryClient}>
            <ShopifyOrdersWidgetContainer />
        </QueryClientProvider>,
    )
}

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

    mockUseAppSelector.mockImplementation((selector: any) => {
        if (selector === getTicketCustomer) return undefined
        if (selector === getActiveCustomer) return undefined
        return undefined
    })
    mockUseTicketInfobarNavigation.mockReturnValue({
        activeTab: TicketInfobarTab.Customer,
        onChangeTab: mockOnChangeTab,
        onToggle: jest.fn(),
        isExpanded: true,
        editingWidgetType: null,
        onSetEditingWidgetType: jest.fn(),
    })
    mockUseWidgetOrderProducts.mockReturnValue({
        productsMap: new Map(),
    })
})

describe('ShopifyOrdersWidgetContainer', () => {
    it('should render nothing when there are no orders', async () => {
        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: null,
            totalCount: 0,
            unfulfilledCount: 0,
            integrationId: undefined,
            integrationOrders: [],
        })

        const { container } = renderComponent()

        await waitFor(() => {
            expect(container).toBeEmptyDOMElement()
        })
    })

    it('should render the widget when there is a last order', async () => {
        const order = createOrder()
        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 3,
            unfulfilledCount: 1,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Orders')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument()
            expect(screen.getByText('1 unfulfilled')).toBeInTheDocument()
            expect(screen.getByText('#1001')).toBeInTheDocument()
        })
    })

    it('should open the order side panel when an order is clicked', async () => {
        const user = userEvent.setup()
        const order = createOrder()

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        expect(
            screen.queryByText(/OrderSidePanelWithActions/),
        ).not.toBeInTheDocument()

        await user.click(screen.getByText('#1001'))

        await waitFor(() => {
            expect(
                screen.getByText(/OrderSidePanelWithActions/),
            ).toBeInTheDocument()
        })
    })

    it('should navigate to Shopify tab with integration id when "Show all" is clicked', async () => {
        const user = userEvent.setup()
        const order = createOrder()

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        await user.click(screen.getByRole('button', { name: /show all/i }))

        expect(mockOnChangeTab).toHaveBeenCalledWith(TicketInfobarTab.Shopify, {
            shopifyIntegrationId: 42,
        })
    })

    it('should use ticketCustomer id when available', async () => {
        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getTicketCustomer)
                return { get: (key: string) => (key === 'id' ? 10 : undefined) }
            if (selector === getActiveCustomer) return { id: 99 }
            return undefined
        })

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: null,
            totalCount: 0,
            unfulfilledCount: 0,
            integrationId: undefined,
            integrationOrders: [],
        })

        const waitForGetCustomerRequest = mockGetCustomer.waitForRequest(server)

        renderComponent()

        await waitForGetCustomerRequest(async (request) => {
            expect(request.url).toContain('/customers/10')
        })
    })

    it('should fall back to activeCustomer id when ticketCustomer has no id', async () => {
        const activeCustomer = { id: 20, name: 'Active Customer' }

        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getTicketCustomer) return undefined
            if (selector === getActiveCustomer) return activeCustomer
            return undefined
        })

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: null,
            totalCount: 0,
            unfulfilledCount: 0,
            integrationId: undefined,
            integrationOrders: [],
        })

        const waitForGetCustomerRequest = mockGetCustomer.waitForRequest(server)

        renderComponent()

        await waitForGetCustomerRequest(async (request) => {
            expect(request.url).toContain('/customers/20')
        })
    })

    it('should pass customerId from lastOrder.customer.id to OrderSidePanelWithActions', async () => {
        const user = userEvent.setup()
        const order = createOrder({ customer: { id: 123 } })

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        await user.click(screen.getByText('#1001'))

        await waitFor(() => {
            expect(
                screen.getByText('OrderSidePanelWithActions customerId:123'),
            ).toBeInTheDocument()
        })
    })

    it('should pass empty customerId when lastOrder has no customer', async () => {
        const user = userEvent.setup()
        const order = createOrder()

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        await user.click(screen.getByText('#1001'))

        await waitFor(() => {
            expect(
                screen.getByText('OrderSidePanelWithActions customerId:'),
            ).toBeInTheDocument()
        })
    })

    it('should not render navigation buttons when there is only one order', async () => {
        const user = userEvent.setup()
        const order = createOrder()

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order,
            totalCount: 1,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order],
        })

        renderComponent()

        await user.click(screen.getByText('#1001'))

        await waitFor(() => {
            expect(
                screen.getByText(/OrderSidePanelWithActions/),
            ).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('button', { name: /previous/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /next/i }),
        ).not.toBeInTheDocument()
    })

    it('should cycle through orders using navigation buttons', async () => {
        const user = userEvent.setup()
        const order1 = createOrder({ id: 1, name: '#1001' })
        const order2 = createOrder({ id: 2, name: '#1002' })
        const order3 = createOrder({ id: 3, name: '#1003' })

        mockUseShopifyOrdersSummary.mockReturnValue({
            lastOrder: order1,
            totalCount: 3,
            unfulfilledCount: 0,
            integrationId: 42,
            integrationOrders: [order1, order2, order3],
        })

        renderComponent()

        await user.click(screen.getByText('#1001'))

        await waitFor(() => {
            expect(screen.getByText('order:#1001')).toBeInTheDocument()
        })

        expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
        expect(screen.getByRole('button', { name: /next/i })).toBeEnabled()

        await user.click(screen.getByRole('button', { name: /next/i }))

        await waitFor(() => {
            expect(screen.getByText('order:#1002')).toBeInTheDocument()
        })

        expect(screen.getByRole('button', { name: /previous/i })).toBeEnabled()

        await user.click(screen.getByRole('button', { name: /next/i }))

        await waitFor(() => {
            expect(screen.getByText('order:#1003')).toBeInTheDocument()
        })

        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()

        await user.click(screen.getByRole('button', { name: /previous/i }))

        await waitFor(() => {
            expect(screen.getByText('order:#1002')).toBeInTheDocument()
        })
    })
})
