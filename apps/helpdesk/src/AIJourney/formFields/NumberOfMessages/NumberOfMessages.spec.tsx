import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { NumberOfMessages } from './NumberOfMessages'

const renderComponent = ({
    defaultValue,
}: {
    defaultValue?: number
} = {}) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: { max_follow_up_messages: defaultValue ?? 2 },
        })
        return (
            <FormProvider {...methods}>
                <NumberOfMessages />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<NumberOfMessages />', () => {
    describe('legacy (V2)', () => {
        it('renders the ButtonGroup label and all message options', () => {
            renderComponent()

            expect(
                screen.getByText('Messages in this flow'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '1 message' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '2 messages' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '3 messages' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '4 messages' }),
            ).toBeInTheDocument()
        })

        it('selects the option matching the form value', () => {
            renderComponent({ defaultValue: 3 })

            expect(
                screen.getByRole('radio', { name: '3 messages' }),
            ).toBeChecked()
        })

        it('renders 1-message label in singular form for the first option', () => {
            renderComponent({ defaultValue: 1 })

            expect(
                screen.getByRole('radio', { name: '1 message' }),
            ).toBeChecked()
        })
    })
})
