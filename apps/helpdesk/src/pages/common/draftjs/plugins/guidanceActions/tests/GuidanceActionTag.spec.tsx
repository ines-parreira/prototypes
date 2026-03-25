import { ldClientMock } from '@repo/feature-flags/testing'
import { fireEvent, screen } from '@testing-library/react'

import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'
import { renderWithRouter } from 'utils/testing'

import GuidanceActionTag from '../GuidanceActionTag'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
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

describe('GuidanceActionTag', () => {
    const mockGuidanceActions = [
        {
            name: 'TOTO action',
            value: '00AAAAA7AAA0AAA1A50AAAA00A',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()

        ldClientMock.allFlags.mockReturnValue({})

        // Mock useToolbarContext
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceActions: mockGuidanceActions,
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

    it('renders the action', () => {
        const actionId = encodeAction(mockGuidanceActions[0])

        const { container } = renderWithRouter(
            <GuidanceActionTag value={actionId}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.getByAltText('action logo')).toBeInTheDocument()
        expect(screen.getByText('TOTO action')).toBeInTheDocument()

        fireEvent.click(container.querySelector('a') as HTMLElement)

        expect(window.open).toHaveBeenCalledWith(
            '/app/ai-agent/shopify//actions/edit/00AAAAA7AAA0AAA1A50AAAA00A',
            '_blank',
        )
    })

    it('handles invalid actions', () => {
        const actionId = 'something'

        renderWithRouter(
            <GuidanceActionTag value={actionId}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.getByAltText('action logo')).toBeInTheDocument()

        const contentElement = screen.getByText('Invalid action')
        expect(contentElement).toBeInTheDocument()

        const container = contentElement?.parentElement
        expect(container).toHaveClass('invalid')
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

        const actionValue = encodeAction(mockGuidanceActions[0])

        renderWithRouter(
            <GuidanceActionTag value={actionValue}>
                Action Content
            </GuidanceActionTag>,
        )

        const tooltip = screen.getByTestId('tooltip')
        expect(tooltip).toBeInTheDocument()
        expect(tooltip).toHaveTextContent('TOTO action')
        expect(tooltip).toHaveAttribute(
            'data-target',
            'guidance-action-tag-mock-id',
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

        const actionValue = encodeAction(mockGuidanceActions[0])

        renderWithRouter(
            <GuidanceActionTag value={actionValue}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })
})
