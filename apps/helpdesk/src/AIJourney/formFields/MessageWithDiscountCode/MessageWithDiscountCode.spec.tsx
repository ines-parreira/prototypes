import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'

import { MessageWithDiscountCode } from './MessageWithDiscountCode'

const renderComponent = ({
    isV3Architecture,
    maxFollowUpMessages = 3,
    discountCodeMessageThreshold = 1,
}: {
    isV3Architecture?: boolean
    maxFollowUpMessages?: number
    discountCodeMessageThreshold?: number
} = {}) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: {
                max_follow_up_messages: maxFollowUpMessages,
                discount_code_message_threshold: discountCodeMessageThreshold,
            },
        })
        return (
            <FormProvider {...methods}>
                <MessageWithDiscountCode isV3Architecture={isV3Architecture} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<MessageWithDiscountCode />', () => {
    describe('legacy (V2)', () => {
        it('renders the label and one option per follow-up message', () => {
            renderComponent({ maxFollowUpMessages: 3 })

            expect(
                screen.getByText('Message that includes the discount code'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '1st message' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '2nd message' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '3rd message' }),
            ).toBeInTheDocument()
        })

        it('selects the option matching the form value', () => {
            renderComponent({
                maxFollowUpMessages: 3,
                discountCodeMessageThreshold: 2,
            })

            expect(
                screen.getByRole('radio', { name: '2nd message' }),
            ).toBeChecked()
        })

        it('only renders options up to maxFollowUpMessages', () => {
            renderComponent({ maxFollowUpMessages: 2 })

            expect(
                screen.getByRole('radio', { name: '1st message' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('radio', { name: '2nd message' }),
            ).toBeInTheDocument()
            expect(
                screen.queryByRole('radio', { name: '3rd message' }),
            ).not.toBeInTheDocument()
        })
    })

    describe('V3 architecture', () => {
        it('renders a SelectField with the discount-code label', () => {
            renderComponent({ isV3Architecture: true })

            expect(
                screen.getByRole('button', {
                    name: /message that includes the discount code/i,
                }),
            ).toBeInTheDocument()
        })

        it('displays the selected option label from the form value', () => {
            renderComponent({
                isV3Architecture: true,
                maxFollowUpMessages: 3,
                discountCodeMessageThreshold: 2,
            })

            expect(screen.getByText('2nd message')).toBeInTheDocument()
        })
    })
})
