import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { IncludeImage } from './IncludeImage'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: ({
        trigger,
        children,
    }: {
        trigger: React.ReactNode
        children: React.ReactNode
    }) => (
        <>
            {trigger}
            {children}
        </>
    ),
    TooltipContent: ({ title }: { title?: React.ReactNode }) => (
        <div role="tooltip">{title}</div>
    ),
}))

const renderComponent = (
    journeyType: string,
    defaultValues: Record<string, unknown> = {},
    isV3Architecture?: boolean,
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <IncludeImage
                    journeyType={journeyType}
                    isV3Architecture={isV3Architecture}
                />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<IncludeImage />', () => {
    it('should render the toggle with the label "Include product image"', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT)

        expect(screen.getByText('Include product image')).toBeInTheDocument()
    })

    it('should render the correct caption for CART_ABANDONMENT', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT)

        expect(
            screen.getByText(
                'Add an image of the items left in their cart in the first message.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the correct caption for SESSION_ABANDONMENT', () => {
        renderComponent(JOURNEY_TYPES.SESSION_ABANDONMENT)

        expect(
            screen.getByText(
                'Add an image of the product from their last visited page in the first message.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the correct caption for WIN_BACK', () => {
        renderComponent(JOURNEY_TYPES.WIN_BACK)

        expect(
            screen.getByText(
                'Add an image of the featured product in the first message.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the correct caption for POST_PURCHASE', () => {
        renderComponent(JOURNEY_TYPES.POST_PURCHASE)

        expect(
            screen.getByText(
                'Add an image of the last purchased product in the first message.',
            ),
        ).toBeInTheDocument()
    })

    it('should not render a caption when isV3Architecture is true', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {}, true)

        expect(
            screen.queryByText(
                'Add an image of the items left in their cart in the first message.',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render the caption when isV3Architecture is false', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {}, false)

        expect(
            screen.getByText(
                'Add an image of the items left in their cart in the first message.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the toggle in unchecked state by default', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {
            include_image: false,
        })

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('should render the toggle in checked state when include_image is true', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {
            include_image: true,
        })

        expect(screen.getByRole('switch')).toBeChecked()
    })

    it('should toggle the value when the user clicks the toggle', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {
            include_image: false,
        })

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()

        await user.click(toggle)

        expect(toggle).toBeChecked()
    })

    it('should toggle off when the user clicks an already checked toggle', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {
            include_image: true,
        })

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeChecked()

        await user.click(toggle)

        expect(toggle).not.toBeChecked()
    })

    describe('info tooltip (v3 architecture)', () => {
        it('should render the info tooltip with the correct content when isV3Architecture is true', () => {
            renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {}, true)

            expect(screen.getByRole('tooltip')).toHaveTextContent(
                "Shows the relevant product from the shopper's session, pulled from Shopify",
            )
        })

        it('should not render the info tooltip when isV3Architecture is false', () => {
            renderComponent(JOURNEY_TYPES.CART_ABANDONMENT, {}, false)

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })

        it('should not render the info tooltip when isV3Architecture is undefined', () => {
            renderComponent(JOURNEY_TYPES.CART_ABANDONMENT)

            expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
        })
    })
})
