import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { IncludeImage } from './IncludeImage'

const renderComponent = (
    journeyType: string,
    defaultValues: Record<string, unknown> = {},
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <IncludeImage journeyType={journeyType} />
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<IncludeImage />', () => {
    it('should render the toggle with the label "Include image"', () => {
        renderComponent(JOURNEY_TYPES.CART_ABANDONMENT)

        expect(screen.getByText('Include image')).toBeInTheDocument()
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
})
