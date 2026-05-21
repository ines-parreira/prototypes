import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { OrderStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES, MAX_WAIT_TIME } from 'AIJourney/constants'

import { MinutesDelay } from './MinutesDelay'

const renderComponent = (
    journeyType?:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME,
    defaultValues: Record<string, unknown> = {},
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <MinutesDelay journeyType={journeyType} />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

const renderV3Component = (
    journeyType:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME = JOURNEY_TYPES.POST_PURCHASE,
    defaultValues: Record<string, unknown> = {},
) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: {
                target_order_status: OrderStatusEnum.OrderPlaced,
                post_purchase_wait_minutes: 30,
                wait_time_minutes: 60,
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <MinutesDelay journeyType={journeyType} isV3Architecture />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<MinutesDelay />', () => {
    it('should render label and trailing unit', () => {
        renderComponent()

        expect(
            screen.getByText('Delay before first message'),
        ).toBeInTheDocument()
        expect(screen.getByText('min')).toBeInTheDocument()
    })

    it('should render post-purchase caption by default', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Minutes to wait after the order event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should render post-purchase caption when journeyType is POST_PURCHASE', () => {
        renderComponent(JOURNEY_TYPES.POST_PURCHASE)

        expect(
            screen.getByText(
                'Minutes to wait after the order event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should render welcome caption when journeyType is WELCOME', () => {
        renderComponent(JOURNEY_TYPES.WELCOME)

        expect(
            screen.getByText(
                'Minutes to wait after the SMS consent event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should show validation error when input value exceeds MAX_WAIT_TIME for post-purchase', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.POST_PURCHASE)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.type(input, String(MAX_WAIT_TIME + 1))
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should show validation error when input value exceeds MAX_WAIT_TIME for welcome', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.WELCOME)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.type(input, String(MAX_WAIT_TIME + 1))
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should not show validation error when input value is within range', async () => {
        const user = userEvent.setup()
        renderComponent()

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.type(input, String(50))
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('should pre-populate the field with default value for post-purchase', () => {
        renderComponent(JOURNEY_TYPES.POST_PURCHASE, {
            post_purchase_wait_minutes: 30,
        })

        expect(screen.getByRole('textbox')).toHaveValue('30')
    })

    it('should pre-populate the field with default value for welcome', () => {
        renderComponent(JOURNEY_TYPES.WELCOME, { wait_time_minutes: 15 })

        expect(screen.getByRole('textbox')).toHaveValue('15')
    })
})

describe('<MinutesDelay /> with isV3Architecture', () => {
    it('should render a SelectField button with the "Send delay" label', () => {
        renderV3Component()

        expect(
            screen.getByRole('button', { name: /send delay/i }),
        ).toBeInTheDocument()
    })

    it('should not render a number input field', () => {
        renderV3Component()

        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })

    it('should not render the "min" trailing unit', () => {
        renderV3Component()

        expect(screen.queryByText('min')).not.toBeInTheDocument()
    })

    it('should display the selected delay label for OrderPlaced (30 minutes default)', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderPlaced,
            post_purchase_wait_minutes: 30,
        })

        expect(screen.getByText('30 minutes')).toBeInTheDocument()
    })

    it('should display "Immediate" when delay is 0 for OrderPlaced', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderPlaced,
            post_purchase_wait_minutes: 0,
        })

        expect(screen.getByText('Immediate')).toBeInTheDocument()
    })

    it('should display the selected delay label for OrderFulfilled (1 hour default)', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderFulfilled,
            post_purchase_wait_minutes: 60,
        })

        expect(screen.getByText('1 hour')).toBeInTheDocument()
    })

    it('should not render "Immediate" option label for OrderFulfilled', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderFulfilled,
            post_purchase_wait_minutes: 60,
        })

        expect(screen.queryByText('Immediate')).not.toBeInTheDocument()
    })
})

describe('<MinutesDelay /> with isV3Architecture - Welcome flow', () => {
    const renderV3WelcomeComponent = (
        defaultValues: Record<string, unknown> = {},
    ) => {
        const Wrapper = () => {
            const methods = useForm({ defaultValues })
            return (
                <FormProvider {...methods}>
                    <form>
                        <MinutesDelay
                            journeyType={JOURNEY_TYPES.WELCOME}
                            isV3Architecture
                        />
                    </form>
                </FormProvider>
            )
        }
        return render(<Wrapper />)
    }

    it('should default to 5 minutes when no value is provided', async () => {
        renderV3WelcomeComponent()

        await waitFor(() => {
            expect(screen.getByText('5 minutes')).toBeInTheDocument()
        })
    })

    it('should display the selected welcome delay option', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 15 })

        expect(screen.getByText('15 minutes')).toBeInTheDocument()
    })

    it('should display "Immediate" when delay is 0', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 0 })

        expect(screen.getByText('Immediate')).toBeInTheDocument()
    })

    it('should display "1 hour" when delay is 60', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 60 })

        expect(screen.getByText('1 hour')).toBeInTheDocument()
    })

    it('should not display "4 hours" as it is not a valid welcome option', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 240 })

        expect(screen.queryByText('4 hours')).not.toBeInTheDocument()
    })

    it('should not display "24 hours" as it is not a valid welcome option', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 1440 })

        expect(screen.queryByText('24 hours')).not.toBeInTheDocument()
    })
})
