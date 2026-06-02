import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { JourneyName } from './JourneyName'

const renderComponent = (defaultValues: Record<string, unknown> = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <JourneyName />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<JourneyName />', () => {
    it('should render the flow name input', () => {
        renderComponent()

        expect(
            screen.getByRole('textbox', { name: /flow name/i }),
        ).toBeInTheDocument()
    })

    it('should display a pre-filled value when provided', () => {
        renderComponent({ journeyName: 'Post-purchase VIP' })

        expect(screen.getByRole('textbox', { name: /flow name/i })).toHaveValue(
            'Post-purchase VIP',
        )
    })

    it('should update the input when user types a value', async () => {
        const user = userEvent.setup()
        renderComponent()

        const input = screen.getByRole('textbox', { name: /flow name/i })
        await act(async () => {
            await user.type(input, 'Welcome flow')
        })

        expect(input).toHaveValue('Welcome flow')
    })

    it('should clear the input when user clears the field', async () => {
        const user = userEvent.setup()
        renderComponent({ journeyName: 'Post-purchase VIP' })

        const input = screen.getByRole('textbox', { name: /flow name/i })
        await act(async () => {
            await user.clear(input)
        })

        expect(input).toHaveValue('')
    })

    it('should update the input when user replaces the existing value', async () => {
        const user = userEvent.setup()
        renderComponent({ journeyName: 'Old name' })

        const input = screen.getByRole('textbox', { name: /flow name/i })
        await act(async () => {
            await user.clear(input)
            await user.type(input, 'New name')
        })

        expect(input).toHaveValue('New name')
    })
})
