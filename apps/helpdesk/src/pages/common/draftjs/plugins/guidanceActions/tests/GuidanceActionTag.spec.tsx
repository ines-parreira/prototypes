import { featureFlagsClientMock } from '@repo/feature-flags/testing'
import { render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { encodeAction } from 'pages/common/draftjs/plugins/guidanceActions/utils'
import { useToolbarContext } from 'pages/common/draftjs/plugins/toolbar/ToolbarContext'

import GuidanceActionTag from '../GuidanceActionTag'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarContext', () => ({
    useToolbarContext: jest.fn(),
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

    it('renders the action', async () => {
        const user = userEvent.setup()
        const actionId = encodeAction(mockGuidanceActions[0])

        render(
            <GuidanceActionTag value={actionId}>
                Action Content
            </GuidanceActionTag>,
        )

        expect(screen.getByAltText('action logo')).toBeInTheDocument()
        expect(screen.getByText('TOTO action')).toBeInTheDocument()

        await user.click(screen.getByRole('link'))

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
        expect(screen.getByText('Invalid action')).toBeInTheDocument()
    })

    describe('setup-required actions', () => {
        const disabledAction = {
            name: 'Disabled action',
            value: '00BBBBB7BBB0BBB1B50BBBB00B',
            enabled: false,
        }

        it('hides the action icon by default', () => {
            ;(useToolbarContext as jest.Mock).mockReturnValue({
                guidanceActions: [disabledAction],
                shopName: 'test-shop',
            })

            render(
                <GuidanceActionTag value={encodeAction(disabledAction)}>
                    Action Content
                </GuidanceActionTag>,
            )

            expect(screen.getByText('Disabled action')).toBeInTheDocument()
            expect(screen.queryByAltText('action logo')).not.toBeInTheDocument()
        })

        it('keeps the action icon when appearance is neutral', () => {
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

            expect(screen.getByText('Disabled action')).toBeInTheDocument()
            expect(screen.getByAltText('action logo')).toBeInTheDocument()
        })

        it('surfaces the skill review tooltip in neutral mode', async () => {
            const user = userEvent.setup()
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

            await user.hover(screen.getByText('Disabled action'))

            expect(await screen.findByRole('tooltip')).toHaveTextContent(
                'This action is currently disabled and will be enabled with this skill once you complete your review.',
            )
        })
    })

    it('shows tooltip when text overflows', async () => {
        const user = userEvent.setup()

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

        await user.hover(screen.getByText('TOTO action'))

        expect(await screen.findByRole('tooltip')).toHaveTextContent(
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

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
})
