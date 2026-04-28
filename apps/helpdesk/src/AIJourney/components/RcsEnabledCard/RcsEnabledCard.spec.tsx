import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { RcsEnabledCard } from './RcsEnabledCard'

jest.mock('AIJourney/formFields', () => ({
    EnableRcs: () => <div>EnableRcs</div>,
}))

const renderComponent = (
    isFormReady: boolean,
    defaultValues: Record<string, unknown> = {},
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <RcsEnabledCard isFormReady={isFormReady} />
            </FormProvider>
        )
    }

    return render(<Wrapper />)
}

describe('<RcsEnabledCard />', () => {
    describe('when isFormReady is false', () => {
        it('renders a skeleton instead of the card', () => {
            renderComponent(false)

            expect(screen.queryByText('RCS enabled')).not.toBeInTheDocument()
            expect(screen.queryByRole('article')).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true', () => {
        it('renders the RCS enable card header', () => {
            renderComponent(true)

            expect(screen.getByText('RCS enabled')).toBeInTheDocument()
        })

        it('renders the EnableRcs toggle', () => {
            renderComponent(true)

            expect(screen.getByText('EnableRcs')).toBeInTheDocument()
        })
    })
})
