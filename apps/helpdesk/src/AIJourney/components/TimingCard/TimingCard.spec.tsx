import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { TimingCard } from './TimingCard'

const renderComponent = (
    journeyType?: JOURNEY_TYPES,
    defaultValues: Record<string, unknown> = {},
    isFormReady = true,
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <TimingCard
                        journeyType={journeyType}
                        isFormReady={isFormReady}
                    />
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<TimingCard />', () => {
    it('should render the Timing card header', () => {
        render(<TimingCard isFormReady />)

        expect(screen.getByText('Timing')).toBeInTheDocument()
    })

    it('should render a skeleton and hide the card when form is not ready', () => {
        renderComponent(undefined, {}, false)

        expect(screen.queryByText('Timing')).not.toBeInTheDocument()
    })

    it('should render an empty card when no journeyType is provided', () => {
        renderComponent()

        expect(screen.getByText('Timing')).toBeInTheDocument()
        expect(
            screen.queryByText('Start this flow when'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Delay before first message'),
        ).not.toBeInTheDocument()
    })

    describe('Post purchase flow', () => {
        it('should render TargetOrderStatus and MinutesDelay for post-purchase journey type', () => {
            renderComponent(JOURNEY_TYPES.POST_PURCHASE)

            expect(screen.getByText('Start this flow when')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Minutes to wait after the order event before messaging.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Welcome flow', () => {
        it('should render MinutesDelay for welcome journey type', () => {
            renderComponent(JOURNEY_TYPES.WELCOME)

            expect(
                screen.getByText(
                    'Minutes to wait after the SMS consent event before messaging.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Start this flow when'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Winback flow', () => {
        it('should render WaitingDays for win-back journey type', () => {
            renderComponent(JOURNEY_TYPES.WIN_BACK, {
                cooldown_days: 30,
                inactive_days: 30,
            })

            expect(
                screen.getByText('Shopper inactive for at least'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Shopper can re-enter after'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Delay before first message'),
            ).not.toBeInTheDocument()
        })
    })
})
