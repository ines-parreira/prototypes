import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

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
