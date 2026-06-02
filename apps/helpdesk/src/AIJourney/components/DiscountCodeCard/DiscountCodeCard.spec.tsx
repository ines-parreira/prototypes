import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'

import { DiscountCodeCard } from './DiscountCodeCard'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: ReactNode
        children: ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

jest.mock('AIJourney/formFields', () => ({
    EnableDiscountCode: () => <div>EnableDiscountCode</div>,
    MaxDiscountCode: () => <div>MaxDiscountCode</div>,
    MessageWithDiscountCode: () => <div>MessageWithDiscountCode</div>,
}))

const renderComponent = (
    isFormReady: boolean,
    defaultValues: Record<string, unknown> = {},
    { isV3Architecture = false }: { isV3Architecture?: boolean } = {},
) => {
    let capturedGetValues: (() => Record<string, unknown>) | undefined

    const ValuesCaptor = () => {
        const { getValues } = useFormContext()
        capturedGetValues = getValues
        return null
    }

    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <ValuesCaptor />
                <DiscountCodeCard
                    isFormReady={isFormReady}
                    isV3Architecture={isV3Architecture}
                />
            </FormProvider>
        )
    }

    const result = render(<Wrapper />)
    return { ...result, getValues: () => capturedGetValues?.() ?? {} }
}

describe('<DiscountCodeCard />', () => {
    describe('when isFormReady is false', () => {
        it('renders a skeleton instead of the card', () => {
            renderComponent(false)

            expect(screen.queryByText('Discount code')).not.toBeInTheDocument()
            expect(screen.queryByRole('article')).not.toBeInTheDocument()
        })
    })

    describe('when isFormReady is true (legacy)', () => {
        it('renders the Discount code card header', () => {
            renderComponent(true)

            expect(screen.getByText('Discount code')).toBeInTheDocument()
        })

        it('renders the EnableDiscountCode toggle', () => {
            renderComponent(true)

            expect(screen.getByText('EnableDiscountCode')).toBeInTheDocument()
        })

        it('does not render MaxDiscountCode when offer_discount is false', () => {
            renderComponent(true, { offer_discount: false })

            expect(
                screen.queryByText('MaxDiscountCode'),
            ).not.toBeInTheDocument()
        })

        it('does not render MessageWithDiscountCode when offer_discount is false', () => {
            renderComponent(true, { offer_discount: false })

            expect(
                screen.queryByText('MessageWithDiscountCode'),
            ).not.toBeInTheDocument()
        })

        it('renders MaxDiscountCode when offer_discount is true', () => {
            renderComponent(true, { offer_discount: true })

            expect(screen.getByText('MaxDiscountCode')).toBeInTheDocument()
        })

        it('does not render MessageWithDiscountCode when offer_discount is true and max_follow_up_messages is 1', () => {
            renderComponent(true, {
                offer_discount: true,
                max_follow_up_messages: 1,
            })

            expect(
                screen.queryByText('MessageWithDiscountCode'),
            ).not.toBeInTheDocument()
        })

        it('renders MessageWithDiscountCode when offer_discount is true and max_follow_up_messages is greater than 1', () => {
            renderComponent(true, {
                offer_discount: true,
                max_follow_up_messages: 2,
            })

            expect(
                screen.getByText('MessageWithDiscountCode'),
            ).toBeInTheDocument()
        })

        it('does not reset discount_code_message_threshold when max_follow_up_messages is greater than 1', () => {
            const { getValues } = renderComponent(true, {
                offer_discount: true,
                max_follow_up_messages: 3,
                discount_code_message_threshold: 2,
            })

            expect(getValues().discount_code_message_threshold).toBe(2)
        })

        it('resets discount_code_message_threshold to 1 when max_follow_up_messages is 1', () => {
            const { getValues } = renderComponent(true, {
                offer_discount: true,
                max_follow_up_messages: 1,
                discount_code_message_threshold: 3,
            })

            expect(getValues().discount_code_message_threshold).toBe(1)
        })
    })

    describe('when isV3Architecture is true', () => {
        it('renders without the legacy Card header', () => {
            renderComponent(true, {}, { isV3Architecture: true })

            expect(screen.queryByText('Discount code')).not.toBeInTheDocument()
            expect(screen.getByText('EnableDiscountCode')).toBeInTheDocument()
        })

        it('resets discount_code_message_threshold to 1 when there are no follow-ups', () => {
            const { getValues } = renderComponent(
                true,
                {
                    offer_discount: true,
                    max_follow_up_messages: 0,
                    discount_code_message_threshold: 3,
                },
                { isV3Architecture: true },
            )

            expect(getValues().discount_code_message_threshold).toBe(1)
        })

        it('does not render MessageWithDiscountCode when there are no follow-ups', () => {
            renderComponent(
                true,
                {
                    offer_discount: true,
                    max_follow_up_messages: 0,
                },
                { isV3Architecture: true },
            )

            expect(
                screen.queryByText('MessageWithDiscountCode'),
            ).not.toBeInTheDocument()
        })

        it('renders MessageWithDiscountCode and keeps the threshold once there is at least one follow-up', () => {
            const { getValues } = renderComponent(
                true,
                {
                    offer_discount: true,
                    max_follow_up_messages: 1,
                    discount_code_message_threshold: 2,
                },
                { isV3Architecture: true },
            )

            expect(
                screen.getByText('MessageWithDiscountCode'),
            ).toBeInTheDocument()
            expect(getValues().discount_code_message_threshold).toBe(2)
        })

        it('renders the info tooltip beside the "Offer discount" toggle', () => {
            renderComponent(true, {}, { isV3Architecture: true })

            expect(screen.getByRole('tooltip')).toHaveTextContent(
                'Add a discount amount or code, and choose which message offers it.',
            )
        })
    })
})
