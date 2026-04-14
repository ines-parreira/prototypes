import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, waitFor, within } from '@testing-library/react'

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
    timezone: undefined,
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
    function getFieldToggle(label: string) {
        const row = screen.getByText(label).closest('tr')

        if (!row) {
            throw new Error(`Unable to find row for "${label}"`)
        }

        return within(row).getByRole('switch')
    }

    function getSectionToggle(label: string) {
        const sectionLabel = screen.getByText(label)
        let sectionHeader = sectionLabel.parentElement

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

    it('has confirm button disabled when no changes are made', () => {
        render(<EditShopifyFieldsSidePanel {...defaultProps} />)

        expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled()
    })

    it('enables confirm button after toggling a field', async () => {
        const { user } = render(
            <EditShopifyFieldsSidePanel {...defaultProps} />,
        )

        await user.click(getFieldToggle('Note'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /confirm/i }),
            ).not.toBeDisabled()
        })
    }, 10000)

    it('calls onConfirm with updated preferences on confirm', async () => {
        const { user } = render(
            <EditShopifyFieldsSidePanel {...defaultProps} />,
        )

        await user.click(getFieldToggle('Note'))

        const saveButton = screen.getByRole('button', { name: /confirm/i })

        await waitFor(() => {
            expect(saveButton).toBeEnabled()
        })
        await user.click(saveButton)

        await waitFor(() => {
            expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1)
        })

        const savedPrefs = defaultProps.onConfirm.mock.calls[0][0]
        expect(savedPrefs.fields).toEqual([{ id: 'note', visible: true }])
        expect(savedPrefs.sections).toBeDefined()
        expect(savedPrefs.sections.customer.fields).toEqual([
            { id: 'note', visible: true },
        ])
        await waitFor(() => {
            expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
        })
    }, 10000)

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

        await user.click(getSectionToggle('Customer'))

        await user.click(screen.getByRole('button', { name: /confirm/i }))

        const savedPrefs = defaultProps.onConfirm.mock.calls[0][0]
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
