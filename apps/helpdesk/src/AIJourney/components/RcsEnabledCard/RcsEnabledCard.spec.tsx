import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { RcsEnabledCard } from './RcsEnabledCard'

jest.mock('AIJourney/formFields', () => ({
    EnableRcs: ({ label }: { label?: string }) => (
        <div>EnableRcs{label ? `:${label}` : ''}</div>
    ),
}))

const renderComponent = (
    isFormReady: boolean,
    { isV3Architecture = false }: { isV3Architecture?: boolean } = {},
) => {
    const Wrapper = () => {
        const methods = useForm()
        return (
            <FormProvider {...methods}>
                <RcsEnabledCard
                    isFormReady={isFormReady}
                    isV3Architecture={isV3Architecture}
                />
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

        it('renders a skeleton without the fixed 680px width when isV3Architecture is true', () => {
            renderComponent(false, { isV3Architecture: true })

            expect(screen.queryByText('EnableRcs')).not.toBeInTheDocument()
            expect(
                screen.queryByText('EnableRcs:RCS enabled'),
            ).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true (legacy)', () => {
        it('renders the legacy RCS enable card header', () => {
            renderComponent(true)

            expect(screen.getByText('RCS enabled')).toBeInTheDocument()
        })

        it('renders the EnableRcs toggle without a label in legacy', () => {
            renderComponent(true)

            expect(screen.getByText('EnableRcs')).toBeInTheDocument()
        })
    })

    describe('when isV3Architecture is true', () => {
        it('renders EnableRcs inline with a RCS enabled label and no card header', () => {
            renderComponent(true, { isV3Architecture: true })

            expect(screen.queryByText('RCS enabled')).not.toBeInTheDocument()
            expect(
                screen.getByText('EnableRcs:RCS enabled'),
            ).toBeInTheDocument()
        })
    })
})
