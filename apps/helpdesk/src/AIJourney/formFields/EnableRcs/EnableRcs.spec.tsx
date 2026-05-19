import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { EnableRcs } from './EnableRcs'

const renderComponent = (props: { label?: string } = {}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues: { rcs_enabled: false } })
        return (
            <FormProvider {...methods}>
                <EnableRcs {...props} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<EnableRcs />', () => {
    it('renders a toggle switch when no label is provided', () => {
        renderComponent()

        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.queryByText('RCS enabled')).not.toBeInTheDocument()
    })

    it('renders the provided label next to the toggle', () => {
        renderComponent({ label: 'RCS enabled' })

        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByText('RCS enabled')).toBeInTheDocument()
    })
})
