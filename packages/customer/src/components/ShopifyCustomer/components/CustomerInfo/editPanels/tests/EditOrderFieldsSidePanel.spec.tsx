import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { render } from '../../../../../../tests/render.utils'
import type {
    OrderFieldPreferences,
    OrderFieldRenderContext,
} from '../../types'
import { EditOrderFieldsSidePanel } from '../EditOrderFieldsSidePanel'

vi.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
    useDrop: () => [{ isOver: false }, vi.fn()],
}))

vi.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: {},
}))

const mockContext: OrderFieldRenderContext = {
    order: { id: 1 },
    isDraftOrder: false,
    integrationId: undefined,
    ticketId: undefined,
    storeName: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
}

const defaultPreferences: OrderFieldPreferences = {
    sections: {
        orderDetails: {
            fields: [
                { id: 'tags', visible: true },
                { id: 'store', visible: true },
                { id: 'id', visible: true },
            ],
        },
        lineItems: { fields: [] },
        shipping: {
            fields: [
                { id: 'tracking_url', visible: true },
                { id: 'tracking_number', visible: true },
            ],
        },
        shippingAddress: { fields: [] },
        billingAddress: { fields: [] },
    },
}

describe('EditOrderFieldsSidePanel', () => {
    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        preferences: defaultPreferences,
        onSave: vi.fn().mockResolvedValue(undefined),
        context: mockContext,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders all section headers', () => {
        render(<EditOrderFieldsSidePanel {...defaultProps} />)

        expect(
            screen.getAllByText('Order details').length,
        ).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Line items')).toBeInTheDocument()
        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('Shipping address')).toBeInTheDocument()
        expect(screen.getByText('Billing address')).toBeInTheDocument()
    })

    it('has save button disabled when no changes are made', () => {
        render(<EditOrderFieldsSidePanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('enables save and calls onSave with updated preferences after toggling a field', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        const toggles = screen.getAllByRole('switch')
        // toggles[0] = "Order details" toggle-all, [1]=tags, [2]=store, [3]=id
        await user.click(toggles[1])

        const saveButton = screen.getByRole('button', { name: /save/i })
        expect(saveButton).not.toBeDisabled()

        await user.click(saveButton)

        const savedPrefs = defaultProps.onSave.mock.calls[0][0]
        expect(savedPrefs.sections.orderDetails.fields).toEqual([
            { id: 'tags', visible: false },
            { id: 'store', visible: true },
            { id: 'id', visible: true },
        ])
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('toggles all fields in a configurable section', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        const sectionToggle = screen.getAllByRole('switch')[0]
        await user.click(sectionToggle)

        await user.click(screen.getByRole('button', { name: /save/i }))

        const savedPrefs = defaultProps.onSave.mock.calls[0][0]
        expect(
            savedPrefs.sections.orderDetails.fields.every(
                (f: { visible: boolean }) => f.visible === false,
            ),
        ).toBe(true)
    })

    it('renders disclaimer text for non-configurable sections', () => {
        render(<EditOrderFieldsSidePanel {...defaultProps} />)

        const disclaimers = screen.getAllByText(/unable to edit/i)
        expect(disclaimers.length).toBeGreaterThanOrEqual(2)
    })

    it('toggles non-configurable section visibility and calls onSave', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        // Find the Shipping address section toggle — non-configurable sections come
        // after configurable ones. The switches are:
        // [0] Order details toggle-all, [1-3] order detail fields,
        // [4] Shipping toggle-all, [5-6] shipping fields,
        // [7] Line items (disabled), [8] Shipping address, [9] Billing address
        const switches = screen.getAllByRole('switch')
        const shippingAddressToggle = switches[switches.length - 2]
        await user.click(shippingAddressToggle)

        await user.click(screen.getByRole('button', { name: /save/i }))

        const savedPrefs = defaultProps.onSave.mock.calls[0][0]
        expect(savedPrefs.sections.shippingAddress.sectionVisible).toBe(false)
    })
})
