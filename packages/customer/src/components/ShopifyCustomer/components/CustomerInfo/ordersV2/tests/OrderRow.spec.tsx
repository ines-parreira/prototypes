import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { OrderRow } from '../OrderRow'
import { makeOrder, toV2Order } from './fixtures'

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: DateFormatType.en_US,
        timeFormat: TimeFormatType.AmPm,
        timezone: undefined,
    }),
}))

vi.mock('../../orders/OrderTags', () => ({
    OrderTags: () => null,
}))

vi.mock('../../CustomActions', () => ({
    CustomActions: () => null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TemplateResolverProvider: ({ children }: any) => children,
}))

vi.mock('../../widget/useOrderFieldPreferences', () => ({
    useOrderFieldPreferences: () => ({
        preferences: { sections: {} },
        savePreferences: vi.fn(),
        getVisibleFields: () => [],
    }),
}))

describe('OrderRow', () => {
    it('renders the collapsed summary without the detail', () => {
        const order = toV2Order(makeOrder({ id: 1001, name: '#1001' }))

        render(<OrderRow order={order} isExpanded={false} onToggle={vi.fn()} />)

        expect(screen.getByText('#1001')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /collapse order/i }),
        ).not.toBeInTheDocument()
    })

    it('toggles when the row is clicked', async () => {
        const onToggle = vi.fn()
        const order = toV2Order(makeOrder({ id: 1001, name: '#1001' }))

        const { user } = render(
            <OrderRow order={order} isExpanded={false} onToggle={onToggle} />,
        )

        await user.click(screen.getByText('#1001'))
        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('toggles from the chevron button', async () => {
        const onToggle = vi.fn()
        const order = toV2Order(makeOrder({ id: 1001, name: '#1001' }))

        const { user } = render(
            <OrderRow order={order} isExpanded={false} onToggle={onToggle} />,
        )

        await user.click(screen.getByRole('button', { name: /expand order/i }))
        expect(onToggle).toHaveBeenCalledTimes(1)
    })

    it('renders a collapse control when expanded', () => {
        const order = toV2Order(makeOrder({ id: 1001, name: '#1001' }))

        render(<OrderRow order={order} isExpanded onToggle={vi.fn()} />)

        expect(
            screen.getByRole('button', { name: /collapse order/i }),
        ).toBeInTheDocument()
    })
})
