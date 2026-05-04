import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FollowUpWaitHours } from './FollowUpWaitHours'

const renderComponent = (
    defaultValues: Record<string, unknown> = {},
    onSubmit: (values: Record<string, unknown>) => void = () => {},
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <FollowUpWaitHours />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<FollowUpWaitHours />', () => {
    it('renders nothing when max_follow_up_messages is 1', () => {
        renderComponent({ max_follow_up_messages: 1 })

        expect(
            screen.queryByText('Delay between follow-up messages'),
        ).not.toBeInTheDocument()
    })

    it('renders nothing when max_follow_up_messages is undefined', () => {
        renderComponent()

        expect(
            screen.queryByText('Delay between follow-up messages'),
        ).not.toBeInTheDocument()
    })

    it('renders the field when max_follow_up_messages is 2', () => {
        renderComponent({
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 1440,
        })

        expect(
            screen.getByText('Delay between follow-up messages'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Hours to wait between each follow-up message.'),
        ).toBeInTheDocument()
        expect(screen.getByText('hr')).toBeInTheDocument()
    })

    it('pre-populates the field with hours when follow_up_wait_minutes is set', () => {
        renderComponent({
            max_follow_up_messages: 3,
            follow_up_wait_minutes: 1440,
        })

        expect(screen.getByRole('textbox')).toHaveValue('24')
    })

    it('shows validation error when input value is below 1 hour', async () => {
        const user = userEvent.setup()
        renderComponent({
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 60,
        })

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.clear(input)
            await user.type(input, '0')
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please enter wait time between 1 and 168 hours (7 days)',
                ),
            ).toBeInTheDocument()
        })
    })

    it('shows validation error when input value exceeds 168 hours', async () => {
        const user = userEvent.setup()
        renderComponent({
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 60,
        })

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.clear(input)
            await user.type(input, '200')
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please enter wait time between 1 and 168 hours (7 days)',
                ),
            ).toBeInTheDocument()
        })
    })

    it('does not show validation error for a value within range', async () => {
        const user = userEvent.setup()
        renderComponent({
            max_follow_up_messages: 2,
            follow_up_wait_minutes: 60,
        })

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.clear(input)
            await user.type(input, '48')
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'Please enter wait time between 1 and 168 hours (7 days)',
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('persists the value as minutes (hours * 60) when submitted', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent(
            {
                max_follow_up_messages: 2,
                follow_up_wait_minutes: 60,
            },
            onSubmit,
        )

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await act(async () => {
            await user.clear(input)
            await user.type(input, '48')
            await user.click(submitButton)
        })

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    follow_up_wait_minutes: 2880,
                }),
                expect.anything(),
            )
        })
    })
})
