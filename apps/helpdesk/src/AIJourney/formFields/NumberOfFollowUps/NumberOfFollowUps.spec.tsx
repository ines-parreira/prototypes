import { render } from '@repo/testing'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { NumberOfFollowUps } from './NumberOfFollowUps'

const renderComponent = (
    defaultValue?: number,
    onSubmit: (values: Record<string, unknown>) => void = () => {},
) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: { max_follow_up_messages: defaultValue ?? 1 },
        })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <NumberOfFollowUps />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<NumberOfFollowUps />', () => {
    it('renders a SelectField labeled "Number of follow-ups"', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /number of follow-ups/i }),
        ).toBeInTheDocument()
    })

    it('displays the option matching the form value (1:1, no shift)', () => {
        renderComponent(2)

        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('offers exactly three numeric options: 1, 2 and 3 (max 3)', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(
            screen.getByRole('button', { name: /number of follow-ups/i }),
        )

        const listbox = await screen.findByRole('listbox')
        const options = within(listbox).getAllByRole('option')

        expect(options).toHaveLength(3)
        expect(
            within(listbox).getByRole('option', { name: '1' }),
        ).toBeInTheDocument()
        expect(
            within(listbox).getByRole('option', { name: '2' }),
        ).toBeInTheDocument()
        expect(
            within(listbox).getByRole('option', { name: '3' }),
        ).toBeInTheDocument()
    })

    it('writes the selected number 1:1 to max_follow_up_messages', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent(1, onSubmit)

        await user.click(
            screen.getByRole('button', { name: /number of follow-ups/i }),
        )
        await user.click(await screen.findByRole('option', { name: '3' }))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ max_follow_up_messages: 3 }),
                expect.anything(),
            )
        })
    })
})
