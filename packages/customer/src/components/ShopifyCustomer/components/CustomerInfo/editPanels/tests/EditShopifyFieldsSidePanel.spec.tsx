import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { render } from '../../../../../../tests/render.utils'
import type { FieldRenderContext, ShopifyFieldPreferences } from '../../types'
import { EditShopifyFieldsSidePanel } from '../EditShopifyFieldsSidePanel'

vi.mock('react-dnd', () => ({
    useDrag: () => [{ isDragging: false }, vi.fn(), vi.fn()],
    useDrop: () => [{ isOver: false }, vi.fn()],
}))

vi.mock('react-dnd-html5-backend', () => ({
    HTML5Backend: {},
}))

const mockContext: FieldRenderContext = {
    purchaseSummary: undefined,
    shopper: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
    integrationId: undefined,
    externalId: undefined,
    customerId: undefined,
    ticketId: undefined,
    emailMarketingConsent: undefined,
    smsMarketingConsent: undefined,
}

const defaultPreferences: ShopifyFieldPreferences = {
    fields: [
        { id: 'totalSpent', visible: true },
        { id: 'orders', visible: true },
        { id: 'note', visible: false },
    ],
}

describe('EditShopifyFieldsSidePanel', () => {
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

    it('renders header and field labels, excluding always-visible fields', () => {
        render(<EditShopifyFieldsSidePanel {...defaultProps} />)

        expect(screen.getByText('Shopify metrics')).toBeInTheDocument()
        expect(screen.queryByText('Total spent')).not.toBeInTheDocument()
        expect(screen.queryByText('Orders')).not.toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
    })

    it('does not render totalSpent or orders in edit panel even when in preferences', () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
                { id: 'note', visible: false },
                { id: 'createdAt', visible: true },
            ],
        }

        render(
            <EditShopifyFieldsSidePanel
                {...defaultProps}
                preferences={preferences}
            />,
        )

        expect(screen.queryByText('Total spent')).not.toBeInTheDocument()
        expect(screen.queryByText('Orders')).not.toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
        expect(screen.getByText('Created at')).toBeInTheDocument()
    })

    it('has save button disabled when no changes are made', () => {
        render(<EditShopifyFieldsSidePanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('enables save button after toggling a field', async () => {
        const { user } = render(
            <EditShopifyFieldsSidePanel {...defaultProps} />,
        )

        const toggles = screen.getAllByRole('switch')
        await user.click(toggles[1])

        expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
    })

    it('calls onSave with updated preferences on save', async () => {
        const { user } = render(
            <EditShopifyFieldsSidePanel {...defaultProps} />,
        )

        const toggles = screen.getAllByRole('switch')
        await user.click(toggles[1])

        await user.click(screen.getByRole('button', { name: /save/i }))

        const savedPrefs = defaultProps.onSave.mock.calls[0][0]
        expect(savedPrefs.fields).toEqual([{ id: 'note', visible: true }])
        expect(savedPrefs.sections).toBeDefined()
        expect(savedPrefs.sections.customer.fields).toEqual([
            { id: 'note', visible: true },
        ])
        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('collapses fields when clicking the collapse button', async () => {
        const { user } = render(
            <EditShopifyFieldsSidePanel {...defaultProps} />,
        )

        expect(screen.getByText('Note')).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /collapse customer fields/i }),
        )

        expect(screen.queryByText('Note')).not.toBeInTheDocument()
    })

    it('toggles all fields visibility', async () => {
        const preferences: ShopifyFieldPreferences = {
            fields: [
                { id: 'totalSpent', visible: true },
                { id: 'orders', visible: true },
                { id: 'note', visible: true },
                { id: 'createdAt', visible: true },
            ],
        }

        const { user } = render(
            <EditShopifyFieldsSidePanel
                {...defaultProps}
                preferences={preferences}
            />,
        )

        const sectionToggle = screen.getAllByRole('switch')[0]
        await user.click(sectionToggle)

        await user.click(screen.getByRole('button', { name: /save/i }))

        const savedPrefs = defaultProps.onSave.mock.calls[0][0]
        expect(savedPrefs.fields).toEqual([
            { id: 'note', visible: false },
            { id: 'createdAt', visible: false },
        ])
        expect(savedPrefs.sections.customer.fields).toEqual([
            { id: 'note', visible: false },
            { id: 'createdAt', visible: false },
        ])
    })
})
