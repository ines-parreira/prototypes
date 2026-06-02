import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { TimingOffset } from './TimingOffset'

const MINUTES_PER_HOUR = 60

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

const renderWithSubmit = (defaultValues: Record<string, unknown> = {}) => {
    let submittedValues: Record<string, unknown> = {}
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit((data) => {
                        submittedValues = data
                    })}
                >
                    <TimingOffset />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    render(<Wrapper />)
    return { getSubmittedValues: () => submittedValues }
}

describe('<TimingOffset />', () => {
    it('should render the trigger delay selector', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /trigger delay/i }),
        ).toBeInTheDocument()
    })

    it('should show "0 hours" when no value is set', () => {
        renderComponent()

        expect(screen.getByText('0 hours')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 12 hours (720 minutes)', () => {
        renderComponent({ timing_offset: 12 * MINUTES_PER_HOUR })

        expect(screen.getByText('12 hours')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 24 hours (1440 minutes)', () => {
        renderComponent({ timing_offset: 24 * MINUTES_PER_HOUR })

        expect(screen.getByText('24 hours')).toBeInTheDocument()
    })

    it('should show the correct preset label when value is 48 hours (2880 minutes)', () => {
        renderComponent({ timing_offset: 48 * MINUTES_PER_HOUR })

        expect(screen.getByText('48 hours')).toBeInTheDocument()
    })

    it('should not render the custom NumberField when value is a preset', () => {
        renderComponent({ timing_offset: 24 * MINUTES_PER_HOUR })

        expect(
            screen.queryByRole('textbox', { name: /custom delay/i }),
        ).not.toBeInTheDocument()
    })

    it('should show "Custom" and render the NumberField when value is not a preset', () => {
        renderComponent({ timing_offset: 36 * MINUTES_PER_HOUR })

        expect(screen.getByText('Custom')).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /custom delay/i }),
        ).toBeInTheDocument()
    })

    it('should pre-fill the NumberField with the hour equivalent of the stored minutes', () => {
        renderComponent({ timing_offset: 36 * MINUTES_PER_HOUR })

        expect(
            screen.getByRole('textbox', { name: /custom delay/i }),
        ).toHaveValue('36')
    })

    it('should open the dropdown and show all preset options and Custom', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))

        expect(
            screen.getByRole('option', { name: '0 hours' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '12 hours' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '24 hours' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: '48 hours' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Custom' }),
        ).toBeInTheDocument()
    })

    it('should update the selected value when user picks a different preset', async () => {
        const user = userEvent.setup()
        renderComponent({ timing_offset: 0 })

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))
        await user.click(screen.getByRole('option', { name: '48 hours' }))

        expect(screen.getByText('48 hours')).toBeInTheDocument()
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

    it('should store minutes when user selects a preset', async () => {
        const user = userEvent.setup()
        const { getSubmittedValues } = renderWithSubmit({ timing_offset: 0 })

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))
        await user.click(screen.getByRole('option', { name: '24 hours' }))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(getSubmittedValues().timing_offset).toBe(24 * MINUTES_PER_HOUR)
    })

    it('should store 1 hour in minutes when switching from preset to Custom', async () => {
        const user = userEvent.setup()
        const { getSubmittedValues } = renderWithSubmit({ timing_offset: 0 })

        await user.click(screen.getByRole('button', { name: /trigger delay/i }))
        await user.click(screen.getByRole('option', { name: 'Custom' }))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(getSubmittedValues().timing_offset).toBe(MINUTES_PER_HOUR)
    })

    it('should store typed hours as minutes when custom value is entered', async () => {
        const user = userEvent.setup()
        const { getSubmittedValues } = renderWithSubmit({
            timing_offset: 36 * MINUTES_PER_HOUR,
        })

        const numberField = screen.getByRole('textbox', {
            name: /custom delay/i,
        })
        await user.clear(numberField)
        await user.type(numberField, '5')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(getSubmittedValues().timing_offset).toBe(5 * MINUTES_PER_HOUR)
    })
})
