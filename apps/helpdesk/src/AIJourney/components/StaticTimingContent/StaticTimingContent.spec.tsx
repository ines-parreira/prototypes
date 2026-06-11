import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { StaticTimingContent } from './StaticTimingContent'

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

describe('<StaticTimingContent />', () => {
    describe('Cart Abandonment', () => {
        it('should render "Start this flow when" and "Cart abandoned"', () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                />,
            )

            expect(screen.getByText('Start this flow when')).toBeInTheDocument()
            expect(screen.getByText('Cart abandoned')).toBeInTheDocument()
        })

        it('should default journeyType to "Cart abandoned" when no prop is passed', () => {
            render(<StaticTimingContent />)

            expect(screen.getByText('Start this flow when')).toBeInTheDocument()
            expect(screen.getByText('Cart abandoned')).toBeInTheDocument()
        })

        it('should render "Delay before first message" section with "30 min"', () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                />,
            )

            expect(
                screen.getByText('Delay before first message'),
            ).toBeInTheDocument()
            expect(screen.getByText('30 min')).toBeInTheDocument()
        })

        it('should render the order event delay tooltip for cart abandonment', async () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                />,
            )

            const user = userEvent.setup()
            await act(async () => {
                await user.tab()
            })

            expect(
                await screen.findByText(
                    'Minutes to wait after the order event before messaging.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Session Abandonment', () => {
        it('should render "Start this flow when" and "Browse abandoned"', () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                />,
            )

            expect(screen.getByText('Start this flow when')).toBeInTheDocument()
            expect(screen.getByText('Browse abandoned')).toBeInTheDocument()
        })

        it('should render "Delay before first message" section with "30 min"', () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                />,
            )

            expect(
                screen.getByText('Delay before first message'),
            ).toBeInTheDocument()
            expect(screen.getByText('30 min')).toBeInTheDocument()
        })

        it('should render the last page visited event delay tooltip for session abandonment', async () => {
            render(
                <StaticTimingContent
                    journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                />,
            )

            const user = userEvent.setup()
            await act(async () => {
                await user.tab()
            })

            expect(
                await screen.findByText(
                    'Minutes to wait after the last page visited event before messaging.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Win Back', () => {
        it('should render the order event delay tooltip for win back', async () => {
            render(<StaticTimingContent journeyType={JOURNEY_TYPES.WIN_BACK} />)

            const user = userEvent.setup()
            await user.tab()

            expect(
                await screen.findByText(
                    'Minutes to wait after the order event before messaging.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Welcome flow', () => {
        it('should render "Start this flow when" and "Subscribed to SMS"', () => {
            render(<StaticTimingContent journeyType={JOURNEY_TYPES.WELCOME} />)

            expect(screen.getByText('Start this flow when')).toBeInTheDocument()
            expect(screen.getByText('Subscribed to SMS')).toBeInTheDocument()
        })

        it('should not render the "Delay before first message" section', () => {
            render(<StaticTimingContent journeyType={JOURNEY_TYPES.WELCOME} />)

            expect(
                screen.queryByText('Delay before first message'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('30 min')).not.toBeInTheDocument()
        })
    })
})

describe('<StaticTimingContent /> with isV3Architecture', () => {
    it('should render a disabled select with "Cart abandoned" for cart abandonment', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                isV3Architecture
            />,
        )

        const select = screen.getByRole('button', {
            name: /start when/i,
        })
        expect(select).toBeInTheDocument()
        expect(select).toBeDisabled()
        expect(screen.getByText('Cart abandoned')).toBeInTheDocument()
    })

    it('should render a disabled select with "Browse abandoned" for session abandonment', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                isV3Architecture
            />,
        )

        const select = screen.getByRole('button', {
            name: /start when/i,
        })
        expect(select).toBeDisabled()
        expect(screen.getByText('Browse abandoned')).toBeInTheDocument()
    })

    it('should render a disabled select with "Subscribed to SMS" for welcome', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.WELCOME}
                isV3Architecture
            />,
        )

        const select = screen.getByRole('button', {
            name: /start when/i,
        })
        expect(select).toBeDisabled()
        expect(screen.getByText('Subscribed to SMS')).toBeInTheDocument()
    })

    it('should default to "Cart abandoned" when no journeyType is passed', () => {
        render(<StaticTimingContent isV3Architecture />)

        expect(screen.getByText('Cart abandoned')).toBeInTheDocument()
    })

    it('should not render the v2 "Delay before first message" label', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                isV3Architecture
            />,
        )

        expect(
            screen.queryByText('Delay before first message'),
        ).not.toBeInTheDocument()
    })

    it('should not render the tooltip for welcome', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.WELCOME}
                isV3Architecture
            />,
        )

        expect(
            screen.queryByText(
                'These settings are managed by Gorgias and cannot be edited for this flow type.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render a disabled "Send delay" select with "30 min" for cart abandonment', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                isV3Architecture
            />,
        )

        const delaySelect = screen.getByRole('button', { name: /send delay/i })
        expect(delaySelect).toBeDisabled()
        expect(screen.getByText('30 min')).toBeInTheDocument()
    })

    it('should render a disabled "Send delay" select with "30 min" for session abandonment', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                isV3Architecture
            />,
        )

        const delaySelect = screen.getByRole('button', { name: /send delay/i })
        expect(delaySelect).toBeDisabled()
        expect(screen.getByText('30 min')).toBeInTheDocument()
    })

    it('should not render the "Send delay" select for welcome', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.WELCOME}
                isV3Architecture
            />,
        )

        expect(
            screen.queryByRole('button', { name: /send delay/i }),
        ).not.toBeInTheDocument()
    })

    it('should render a disabled select with "Shopper inactive" for win back', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.WIN_BACK}
                isV3Architecture
            />,
        )

        const startWhenSelect = screen.getByRole('button', {
            name: /start when/i,
        })
        expect(startWhenSelect).toBeDisabled()
        expect(screen.getByText('Shopper inactive')).toBeInTheDocument()
    })

    it('should not render the "Send delay" select for win back', () => {
        render(
            <StaticTimingContent
                journeyType={JOURNEY_TYPES.WIN_BACK}
                isV3Architecture
            />,
        )

        expect(
            screen.queryByRole('button', { name: /send delay/i }),
        ).not.toBeInTheDocument()
    })
})
