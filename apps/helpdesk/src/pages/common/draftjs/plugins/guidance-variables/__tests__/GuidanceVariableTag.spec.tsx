import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import { GuidanceVariableTag } from '../GuidanceVariableTag'
import { parseGuidanceVariable } from '../utils'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
}))

jest.mock('../utils', () => ({
    parseGuidanceVariable: jest.fn(),
    pickCategoryLogo: jest.requireActual('../utils').pickCategoryLogo,
}))

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useId: jest.fn().mockImplementation(() => 'mock-id'),
}))

describe('GuidanceVariableTag', () => {
    const mockGuidanceVariables = [
        {
            name: 'Name',
            value: '&&&customer.name&&&',
            category: 'customer',
        },
        {
            name: 'Is cancelled',
            value: '&&&order.is_cancelled&&&',
            category: 'order',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        // Mock useToolbarContext
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceVariables: mockGuidanceVariables,
        })

        // Mock Element.prototype properties used in the component
        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 100, // Equal to offsetWidth by default (no overflow)
        })
    })

    it('renders with default size', () => {
        const variableValue = '&&&customer.name&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        expect(screen.getByText('Variable Content')).toBeInTheDocument()
        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByLabelText('Customer: Name')).toBeInTheDocument()
    })

    it('displays variable prefix', () => {
        const variableValue = '&&&order.is_cancelled&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Is cancelled',
            value: variableValue,
            category: 'order',
        })

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        expect(screen.getByText('Variable Content')).toBeInTheDocument()
        expect(screen.getByAltText('shopify logo')).toBeInTheDocument()
        expect(screen.getByLabelText('Order: Is cancelled')).toBeInTheDocument()
    })

    it('renders with small size', () => {
        const variableValue = '&&&customer.name&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue} size="small">
                Variable Content
            </GuidanceVariableTag>,
        )

        expect(screen.getByLabelText('Customer: Name')).toBeInTheDocument()
    })

    it('handles invalid variables', () => {
        const variableValue = '&&&invalid.variable&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue(null)

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        expect(screen.getByLabelText('Invalid variable')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup()
        const variableValue = '&&&customer.name&&&'
        const handleClick = jest.fn()
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue} onClick={handleClick}>
                Variable Content
            </GuidanceVariableTag>,
        )

        await user.click(screen.getByLabelText('Customer: Name'))

        expect(handleClick).toHaveBeenCalled()
    })

    it('shows tooltip when text overflows', async () => {
        const user = userEvent.setup()
        // Mock text overflow
        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 50,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 100, // Greater than offsetWidth (overflow)
        })

        const variableValue = '&&&customer.name&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        await user.hover(screen.getByLabelText('Customer: Name'))

        await waitFor(() => {
            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'Customer: Name',
            )
        })
    })

    it('does not show tooltip when text does not overflow', async () => {
        const user = userEvent.setup()

        // Ensure no text overflow
        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 90, // Less than offsetWidth (no overflow)
        })

        const variableValue = '&&&customer.name&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        await user.hover(screen.getByLabelText('Customer: Name'))

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('passes the correct variable to parseGuidanceVariable', () => {
        const variableValue = '&&&customer.name&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue({
            name: 'Name',
            value: variableValue,
            category: 'customer',
        })

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        expect(parseGuidanceVariable).toHaveBeenCalledWith(
            variableValue,
            mockGuidanceVariables,
        )
    })
})
