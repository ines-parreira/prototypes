import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { MaxDiscountCode } from './MaxDiscountCode'

const renderComponent = (defaultValues: Record<string, unknown> = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <MaxDiscountCode />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<MaxDiscountCode />', () => {
    it('should not show validation error when discount is disabled and value is empty', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: false })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Field is required'),
            ).not.toBeInTheDocument()
        })
    })

    it('should show required error when discount is enabled and value is 0', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true, max_discount_percent: '0' })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(screen.getByText('Field is required')).toBeInTheDocument()
        })
    })

    it('should show minimum error when discount is enabled and value is less than 1', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true, max_discount_percent: '0.5' })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(screen.getByText('Minimum value is 1%')).toBeInTheDocument()
        })
    })

    it('should show maximum error when discount is enabled and value is greater than 100', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true, max_discount_percent: '101' })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(
                screen.getByText('Maximum value is 100%'),
            ).toBeInTheDocument()
        })
    })

    it('should not show validation error when discount is enabled and value is valid', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true, max_discount_percent: '50' })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Field is required'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Minimum value is 1%'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Maximum value is 100%'),
            ).not.toBeInTheDocument()
        })
    })

    it('should update the input when user types a value', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true })

        const input = screen.getByRole('textbox')
        await act(async () => {
            await user.clear(input)
            await user.type(input, '42')
        })

        expect(input).toHaveValue('42')
    })

    it('should show required error when field is cleared after an invalid value and form is submitted', async () => {
        const user = userEvent.setup()
        renderComponent({ offer_discount: true, max_discount_percent: '101' })

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(
                screen.getByText('Maximum value is 100%'),
            ).toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await user.clear(input)

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /submit/i }))
        })

        await waitFor(() => {
            expect(input).toHaveValue('')
            expect(screen.getByText('Field is required')).toBeInTheDocument()
        })
    })
})
