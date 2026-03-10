import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { FIELD_DEFINITIONS } from '../fields'
import { IntermediateEditPanel } from '../IntermediateEditPanel'
import type {
    FieldConfig,
    FieldRenderContext,
    ShopifyFieldPreferences,
} from '../types'

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

const fields: FieldConfig[] = [
    FIELD_DEFINITIONS.totalSpent,
    FIELD_DEFINITIONS.orders,
    FIELD_DEFINITIONS.note,
]

describe('IntermediateEditPanel', () => {
    const defaultProps = {
        customerFields: fields,
        context: mockContext,
        preferences: defaultPreferences,
        onSavePreferences: vi.fn().mockResolvedValue(undefined),
        onClose: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders customer metrics section with field list', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(screen.getByText('Customer metrics')).toBeInTheDocument()
        expect(screen.getByText('Total spent')).toBeInTheDocument()
        expect(screen.getByText('Note')).toBeInTheDocument()
    })

    it('renders "Edit metrics" button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /edit metrics/i }),
        ).toBeInTheDocument()
    })

    it('renders orders section with disabled "Edit order details" button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        const editOrderButton = screen.getByRole('button', {
            name: /edit order details/i,
        })
        expect(editOrderButton).toBeInTheDocument()
        expect(editOrderButton).toBeDisabled()
    })

    it('renders Confirm button', () => {
        render(<IntermediateEditPanel {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /confirm/i }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Confirm is clicked', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /confirm/i }))

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('opens EditShopifyFieldsSidePanel when "Edit metrics" is clicked', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /edit metrics/i }))

        await waitFor(() => {
            expect(screen.getByText('Shopify metrics')).toBeInTheDocument()
        })
    })

    it('passes preferences to EditShopifyFieldsSidePanel', async () => {
        const { user } = render(<IntermediateEditPanel {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /edit metrics/i }))

        await waitFor(() => {
            expect(screen.getByText('Shopify metrics')).toBeInTheDocument()
        })

        const toggles = screen.getAllByRole('switch')
        expect(toggles.length).toBeGreaterThan(0)
    })
})
