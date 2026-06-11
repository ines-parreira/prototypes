import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { OrdersSidebarV2 } from '../OrdersSidebarV2'
import { makeOrder } from './fixtures'

vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn().mockReturnValue(false),
}))

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: DateFormatType.en_US,
        timeFormat: TimeFormatType.AmPm,
        timezone: undefined,
    }),
}))

// OrderTags makes its own network requests; stub it out — covered separately.
vi.mock('../../orders/OrderTags', () => ({
    OrderTags: () => null,
}))

vi.mock('../../CustomActions', () => ({
    CustomActions: () => null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TemplateResolverProvider: ({ children }: any) => children,
}))

// The expanded order's sections fetch widget field preferences; stub the hook.
vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: () => ({
        preferences: { sections: {} },
        savePreferences: vi.fn(),
        getVisibleFields: () => [],
    }),
}))

const baseProps = {
    isLoadingOrders: false,
    isLoadingDraftOrders: false,
    productsMap: undefined,
}

describe('OrdersSidebarV2', () => {
    it('renders an empty state when there are no orders', () => {
        render(<OrdersSidebarV2 {...baseProps} orders={[]} draftOrders={[]} />)

        expect(screen.getByText('No orders')).toBeInTheDocument()
    })

    it('renders every order as a collapsed row by default', () => {
        render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[
                    makeOrder({ id: 1001, name: '#1001' }),
                    makeOrder({ id: 1002, name: '#1002' }),
                ]}
                draftOrders={[]}
            />,
        )

        expect(screen.getByText('#1001')).toBeInTheDocument()
        expect(screen.getByText('#1002')).toBeInTheDocument()
        // Collapsed → no row shows a collapse control.
        expect(
            screen.queryByRole('button', { name: /collapse order/i }),
        ).not.toBeInTheDocument()
    })

    it('expands a row when clicked and collapses it again', async () => {
        const { user } = render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[makeOrder({ id: 1001, name: '#1001' })]}
                draftOrders={[]}
            />,
        )

        await user.click(screen.getByText('#1001'))
        expect(
            await screen.findByRole('button', { name: /collapse order/i }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /collapse order/i }),
        )
        expect(
            screen.queryByRole('button', { name: /collapse order/i }),
        ).not.toBeInTheDocument()
    })

    it('allows multiple rows to be expanded at once', async () => {
        const { user } = render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[
                    makeOrder({ id: 1001, name: '#1001' }),
                    makeOrder({ id: 1002, name: '#1002' }),
                ]}
                draftOrders={[]}
            />,
        )

        await user.click(screen.getByText('#1001'))
        await user.click(screen.getByText('#1002'))

        expect(
            screen.getAllByRole('button', { name: /collapse order/i }),
        ).toHaveLength(2)
    })

    it('renders product thumbnails for line items in a collapsed row', () => {
        render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[
                    makeOrder({
                        id: 1001,
                        name: '#1001',
                        line_items: [
                            {
                                id: 1,
                                title: 'Blue Shirt',
                                quantity: 1,
                                price: '29.99',
                            },
                            {
                                id: 2,
                                title: 'Black Jeans',
                                quantity: 1,
                                price: '59.99',
                            },
                        ] as any,
                    }),
                ]}
                draftOrders={[]}
            />,
        )

        expect(screen.getByAltText('Blue Shirt')).toBeInTheDocument()
        expect(screen.getByAltText('Black Jeans')).toBeInTheDocument()
    })

    it('shows overflow count when there are more than 4 line items', () => {
        render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[
                    makeOrder({
                        id: 1001,
                        name: '#1001',
                        line_items: [1, 2, 3, 4, 5].map((n) => ({
                            id: n,
                            title: `Item ${n}`,
                            quantity: 1,
                            price: '10.00',
                        })) as any,
                    }),
                ]}
                draftOrders={[]}
            />,
        )

        expect(screen.getByText('+2')).toBeInTheDocument()
    })

    it('calls onCreateOrder from the header button', async () => {
        const onCreateOrder = vi.fn()
        const { user } = render(
            <OrdersSidebarV2
                {...baseProps}
                orders={[makeOrder({ id: 1001, name: '#1001' })]}
                draftOrders={[]}
                onCreateOrder={onCreateOrder}
            />,
        )

        await user.click(screen.getByRole('button', { name: /create order/i }))
        expect(onCreateOrder).toHaveBeenCalledTimes(1)
    })
})
