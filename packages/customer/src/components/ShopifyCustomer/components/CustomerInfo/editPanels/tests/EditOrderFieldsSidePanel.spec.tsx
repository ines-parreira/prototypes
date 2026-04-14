import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, within } from '@testing-library/react'

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
    timezone: undefined,
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
    function getFieldToggle(label: string) {
        const row = screen.getByText(label).closest('tr')

        if (!row) {
            throw new Error(`Unable to find row for "${label}"`)
        }

        return within(row).getByRole('switch')
    }

    function getSectionToggle(label: string) {
        const sectionCollapseButton = screen.getByRole('button', {
            name: new RegExp(`(?:collapse|expand) ${label} fields`, 'i'),
        })
        let sectionHeader = sectionCollapseButton.parentElement

        while (sectionHeader && !within(sectionHeader).queryByRole('switch')) {
            sectionHeader = sectionHeader.parentElement
        }

        if (!sectionHeader) {
            throw new Error(`Unable to find section toggle for "${label}"`)
        }

        return within(sectionHeader).getByRole('switch')
    }

    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        preferences: defaultPreferences,
        onConfirm: vi.fn(),
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

    it('has confirm button disabled when no changes are made', () => {
        render(<EditOrderFieldsSidePanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
    })

    it('enables confirm and calls onConfirm with updated preferences after toggling a field', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        await user.click(getFieldToggle('Tags'))

        const saveButton = screen.getByRole('button', { name: /confirm/i })
        expect(saveButton).not.toBeDisabled()

        await user.click(saveButton)

        const savedPrefs = defaultProps.onConfirm.mock.calls[0][0]
        expect(savedPrefs.sections.orderDetails.fields).toEqual([
            { id: 'tags', visible: false },
            { id: 'store', visible: true },
            { id: 'id', visible: true },
        ])
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('toggles all fields in a configurable section', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        await user.click(getSectionToggle('Order details'))

        await user.click(screen.getByRole('button', { name: /confirm/i }))

        const savedPrefs = defaultProps.onConfirm.mock.calls[0][0]
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

    it('toggles non-configurable section visibility and calls onConfirm', async () => {
        const { user } = render(<EditOrderFieldsSidePanel {...defaultProps} />)

        await user.click(getSectionToggle('Shipping address'))

        await user.click(screen.getByRole('button', { name: /confirm/i }))

        const savedPrefs = defaultProps.onConfirm.mock.calls[0][0]
        expect(savedPrefs.sections.shippingAddress.sectionVisible).toBe(false)
    })
})
