import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { EnableDiscountCode } from './EnableDiscountCode'

const renderComponent = (props: { label?: string } = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues: { offer_discount: false } })
        return (
            <FormProvider {...methods}>
                <EnableDiscountCode {...props} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<EnableDiscountCode />', () => {
    it('renders a toggle switch when no label is provided', () => {
        renderComponent()

        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.queryByText('Offer discount')).not.toBeInTheDocument()
    })

    it('renders the provided label next to the toggle', () => {
        renderComponent({ label: 'Offer discount' })

        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByText('Offer discount')).toBeInTheDocument()
    })
})
