import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { EnableImageField } from './EnableImage'

describe('EnableImageField', () => {
    it('renders the toggle with correct cart abandonment label and unchecked by default', () => {
        render(
            <EnableImageField journeyType={JOURNEY_TYPES.CART_ABANDONMENT} />,
        )

        expect(screen.getByText('Send image')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show the shopper an image of the items left in their cart in the first message.',
            ),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('checkbox')
        expect(toggle).not.toBeChecked()
    })

    it('renders the toggle with correct session abandonment label and unchecked by default', () => {
        render(
            <EnableImageField
                journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
            />,
        )

        expect(screen.getByText('Send image')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Show the shopper an image of the product from their last visited page.',
            ),
        ).toBeInTheDocument()

        const toggle = screen.getByRole('checkbox')
        expect(toggle).not.toBeChecked()
    })

    it('renders the toggle as checked when isEnabled is true', () => {
        render(
            <EnableImageField
                isEnabled={true}
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
            />,
        )

        const toggle = screen.getByRole('checkbox')
        expect(toggle).toBeChecked()
    })

    it('calls onChange when toggle is clicked', async () => {
        const mockOnChange = jest.fn()
        render(
            <EnableImageField
                onChange={mockOnChange}
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
            />,
        )

        const toggle = screen.getByRole('checkbox')
        await act(async () => {
            await userEvent.click(toggle)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('does not error when onChange is not provided', async () => {
        render(
            <EnableImageField journeyType={JOURNEY_TYPES.CART_ABANDONMENT} />,
        )

        const toggle = screen.getByRole('checkbox')

        await act(async () => {
            expect(async () => {
                await userEvent.click(toggle)
            }).not.toThrow()
        })
    })

    it('renders correctly with both isEnabled and onChange props', async () => {
        const mockOnChange = jest.fn()
        render(
            <EnableImageField
                isEnabled={true}
                journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                onChange={mockOnChange}
            />,
        )

        const toggle = screen.getByRole('checkbox')
        expect(toggle).toBeChecked()

        await act(async () => {
            await userEvent.click(toggle)
        })

        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
})
