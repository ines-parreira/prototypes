import { fireEvent, render, screen } from '@testing-library/react'

import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import GuidanceVariableTag from '../GuidanceVariableTag'
import { parseGuidanceVariable } from '../utils'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
}))

jest.mock('../utils', () => ({
    parseGuidanceVariable: jest.fn(),
    pickCategoryLogo: jest.requireActual('../utils').pickCategoryLogo,
}))

jest.mock('@gorgias/axiom', () => ({
    LegacyTooltip: jest.fn(({ children, target }) => (
        <div data-testid="tooltip" data-target={target}>
            {children}
        </div>
    )),
}))

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
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

        const container = screen.getByText('Variable Content').parentElement
        expect(container).toHaveAttribute('id', 'guidance-variable-tag-mock-id')
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

        const container = screen.getByText('Variable Content').parentElement
        expect(container).toHaveAttribute('id', 'guidance-variable-tag-mock-id')
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

        const contentElement = document.querySelector(
            '[aria-label="Customer: Name"]',
        )
        expect(contentElement).toBeInTheDocument()
        expect(contentElement).toHaveClass('small')
    })

    it('handles invalid variables', () => {
        const variableValue = '&&&invalid.variable&&&'
        ;(parseGuidanceVariable as jest.Mock).mockReturnValue(null)

        render(
            <GuidanceVariableTag value={variableValue}>
                Variable Content
            </GuidanceVariableTag>,
        )

        const contentElement = document.querySelector(
            '[aria-label="Invalid variable"]',
        )
        expect(contentElement).toBeInTheDocument()

        const container = contentElement?.parentElement
        expect(container).toHaveClass('invalid')
    })

    it('calls onClick when clicked', () => {
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

        const contentElement = document.querySelector(
            '[aria-label="Customer: Name"]',
        )
        const container = contentElement?.parentElement
        fireEvent.click(container as HTMLElement)

        expect(handleClick).toHaveBeenCalled()
    })

    it('shows tooltip when text overflows', () => {
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

        const tooltip = screen.getByTestId('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent('Customer: Name')
        expect(tooltip).toHaveAttribute(
            'data-target',
            'guidance-variable-tag-mock-id',
        )
    })

    it('does not show tooltip when text does not overflow', () => {
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

        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
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
