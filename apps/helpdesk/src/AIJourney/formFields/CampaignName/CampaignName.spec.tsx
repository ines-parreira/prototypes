import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { CampaignName } from './CampaignName'

const renderComponent = (defaultValues: Record<string, unknown> = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <CampaignName />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<CampaignName />', () => {
    it('should render the campaign name input', () => {
        renderComponent()

        expect(
            screen.getByRole('textbox', { name: /campaign name/i }),
        ).toBeInTheDocument()
    })

    it('should display a pre-filled value when provided', () => {
        renderComponent({ campaignTitle: 'Summer Sale' })

        expect(
            screen.getByRole('textbox', { name: /campaign name/i }),
        ).toHaveValue('Summer Sale')
    })

    it('should update the input when user types a value', async () => {
        const user = userEvent.setup()
        renderComponent()

        const input = screen.getByRole('textbox', { name: /campaign name/i })
        await act(async () => {
            await user.type(input, 'Black Friday')
        })

        expect(input).toHaveValue('Black Friday')
    })

    it('should clear the input when user clears the field', async () => {
        const user = userEvent.setup()
        renderComponent({ campaignTitle: 'Summer Sale' })

        const input = screen.getByRole('textbox', { name: /campaign name/i })
        await act(async () => {
            await user.clear(input)
        })

        expect(input).toHaveValue('')
    })

    it('should update the input when user replaces the existing value', async () => {
        const user = userEvent.setup()
        renderComponent({ campaignTitle: 'Old Campaign' })

        const input = screen.getByRole('textbox', { name: /campaign name/i })
        await act(async () => {
            await user.clear(input)
            await user.type(input, 'New Campaign')
        })

        expect(input).toHaveValue('New Campaign')
    })
})
