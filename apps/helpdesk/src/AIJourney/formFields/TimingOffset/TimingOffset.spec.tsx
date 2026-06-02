import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { TimingOffset } from './TimingOffset'

const renderComponent = (defaultValues: Record<string, unknown> = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <TimingOffset />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<TimingOffset />', () => {
    it('should render the trigger delay selector', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /trigger delay/i }),
        ).toBeInTheDocument()
    })

    it('should show "0 days" when no value is set', () => {
        renderComponent()

        expect(screen.getByText('0 days')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 7', () => {
        renderComponent({ timing_offset: 7 })

        expect(screen.getByText('7 days')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 14', () => {
        renderComponent({ timing_offset: 14 })

        expect(screen.getByText('14 days')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 30', () => {
        renderComponent({ timing_offset: 30 })

        expect(screen.getByText('30 days')).toBeInTheDocument()
    })

    it('should not render the custom NumberField when value is a preset', () => {
        renderComponent({ timing_offset: 7 })

        expect(
            screen.queryByRole('textbox', { name: /custom delay/i }),
        ).not.toBeInTheDocument()
    })

    it('should show "Custom" and render the NumberField when value is not a preset', () => {
        renderComponent({ timing_offset: 21 })

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /custom delay/i }),
        ).toBeInTheDocument()
    })

    it('should pre-fill the NumberField with the custom value', () => {
        renderComponent({ timing_offset: 21 })

        expect(
            screen.getByRole('textbox', { name: /custom delay/i }),
        ).toHaveValue('21')
    })

    it('should open the dropdown and show all preset options and Custom', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))

        expect(
            screen.getByRole('option', { name: '0 days' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '7 days' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '14 days' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '30 days' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Custom' }),
        ).toBeInTheDocument()
    })

    it('should update the selected value when user picks a different preset', async () => {
        const user = userEvent.setup()
        renderComponent({ timing_offset: 0 })

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))
        await user.click(screen.getByRole('option', { name: '30 days' }))

        expect(screen.getByText('30 days')).toBeInTheDocument()
        expect(
            screen.queryByRole('spinbutton', { name: /custom delay/i }),
        ).not.toBeInTheDocument()
    })

    it('should reveal the NumberField when user selects Custom', async () => {
        const user = userEvent.setup()
        renderComponent({ timing_offset: 0 })

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))
        await user.click(screen.getByRole('option', { name: 'Custom' }))

        expect(
            screen.getByRole('textbox', { name: /custom delay/i }),
        ).toBeInTheDocument()
    })
})
