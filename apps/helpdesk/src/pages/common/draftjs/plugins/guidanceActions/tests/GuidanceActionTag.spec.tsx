import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import GuidanceActionTag from '../GuidanceActionTag'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: jest.fn(({ children, trigger }) => (
        <div data-testid="tooltip">
            {trigger}
            {children}
        </div>
    )),
    TooltipContent: jest.fn(({ title, children }) => (
        <div data-testid="tooltip-content">{title ?? children}</div>
    )),
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

        featureFlagsClientMock.allFlags.mockReturnValue({})
        ;(useToolbarContext as jest.Mock).mockReturnValue({
            guidanceActions: mockGuidanceActions,
            shopName: 'test-shop',
        })

        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 100,
        })
    })

    it('renders the action', () => {
        const actionId = encodeAction(mockGuidanceActions[0])

        const { container } = render(
            <GuidanceActionTag value={actionId}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.getByAltText('action logo')).toBeInTheDocument()
        expect(screen.getByText('TOTO action')).toBeInTheDocument()

        fireEvent.click(container.querySelector('a') as HTMLElement)

        expect(window.open).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/actions/edit/00AAAAA7AAA0AAA1A50AAAA00A',
            '_blank',
        )
    })

    it('handles invalid actions', () => {
        const actionId = 'something'

        render(
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

    describe('setup-required actions', () => {
        const disabledAction = {
            name: 'Disabled action',
            value: '00BBBBB7BBB0BBB1B50BBBB00B',
            enabled: false,
        }

        it('shows the warning styling by default', () => {
            ;(useToolbarContext as jest.Mock).mockReturnValue({
                guidanceActions: [disabledAction],
                shopName: 'test-shop',
            })

            render(
                <GuidanceActionTag value={encodeAction(disabledAction)}>
                    Action Content
                </GuidanceActionTag>,
            )

            const container = screen.getByText('Disabled action').parentElement
            expect(container).toHaveClass('disabled')
            expect(screen.queryByAltText('action logo')).not.toBeInTheDocument()
        })

        it('shows the regular grey styling and keeps the action icon when appearance is neutral', () => {
            ;(useToolbarContext as jest.Mock).mockReturnValue({
                guidanceActions: [disabledAction],
                shopName: 'test-shop',
                disabledActionsAppearance: 'neutral',
            })

            render(
                <GuidanceActionTag value={encodeAction(disabledAction)}>
                    Action Content
                </GuidanceActionTag>,
            )

            const container = screen.getByText('Disabled action').parentElement
            expect(container).not.toHaveClass('disabled')
            expect(screen.getByAltText('action logo')).toBeInTheDocument()
        })

        it('surfaces the skill review tooltip in neutral mode', () => {
            ;(useToolbarContext as jest.Mock).mockReturnValue({
                guidanceActions: [disabledAction],
                shopName: 'test-shop',
                disabledActionsAppearance: 'neutral',
            })

            render(
                <GuidanceActionTag value={encodeAction(disabledAction)}>
                    Action Content
                </GuidanceActionTag>,
            )

            expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
                'This action is currently disabled and will be enabled with this skill once you complete your review.',
            )
        })
    })

    it('shows tooltip when text overflows', () => {
        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 50,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 100,
        })

        const actionValue = encodeAction(mockGuidanceActions[0])

        render(
            <GuidanceActionTag value={actionValue}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
        expect(screen.getByTestId('tooltip-content')).toHaveTextContent(
            'TOTO action',
        )
    })

    it('does not show tooltip when text does not overflow', () => {
        Object.defineProperty(HTMLSpanElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(HTMLSpanElement.prototype, 'scrollWidth', {
            configurable: true,
            value: 90,
        })

        const actionValue = encodeAction(mockGuidanceActions[0])

        render(
            <GuidanceActionTag value={actionValue}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })
})
