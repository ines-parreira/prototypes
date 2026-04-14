import { render, screen } from '@testing-library/react'

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
