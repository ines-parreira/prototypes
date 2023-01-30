import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    bigCommerceProductFixture,
    bigCommerceVariantFixture,
} from 'fixtures/bigcommerce'
import {ModifiersPopover} from '../ModifiersPopover'

const defaultProps = {
    storeHash: 'Hello',
    product: bigCommerceProductFixture(),
    variant: bigCommerceVariantFixture(),
    onClose: jest.fn(),
    onApply: jest.fn(),
    setReference: jest.fn(),
}
describe('<ModifiersPopover/>', () => {
    it('renders as expected', () => {
        const {container} = render(<ModifiersPopover {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('is able to perform actions with inputs', () => {
        render(<ModifiersPopover {...defaultProps} />)

        // Cannot target by label because we cannot wrap our select boxes into labels properly ;(
        userEvent.click(screen.getAllByRole('listbox')[0])
        userEvent.click(screen.getByText(/Test 1/i))

        // Confirm that the of the selected dropdown value is visible after it is selected
        expect(screen.getByText(/Test 1/i)).toBeInTheDocument()

        // Checkbox gets checked
        userEvent.click(
            screen.getByRole('checkbox', {name: /Include Insurance?/i})
        )
        expect(
            screen.getByRole('checkbox', {name: /Include Insurance?/i})
        ).toBeChecked()
    })

    it('can submit the form when all required fields are filled out', () => {
        const onApplyMock = jest.fn()

        const {container} = render(
            <ModifiersPopover {...defaultProps} onApply={onApplyMock} />
        )

        // Does not call `onApply` callback because the form is not completed
        userEvent.click(screen.getByRole('button', {name: /Apply/i}))
        expect(onApplyMock).not.toHaveBeenCalled()

        // Snap with all the errors
        expect(container).toMatchSnapshot('visible error messages')

        // Fill out required fields
        userEvent.click(screen.getAllByRole('listbox')[0])
        userEvent.click(screen.getByText(/Test 1/i))

        userEvent.click(screen.getAllByRole('listbox')[1])
        userEvent.click(screen.getByText(/Pattern/i))

        userEvent.click(screen.getAllByRole('listbox')[2])
        userEvent.click(screen.getByText(/Three/i))

        // userEvent.click(screen.getAllByRole('listbox')[3])
        // userEvent.click(screen.getByText(/Dropdown 2/i))

        userEvent.click(screen.getAllByRole('listbox')[4])
        userEvent.click(screen.getByText(/Terrarium Orbit/i))

        // Set "true" value for a checkbox
        userEvent.click(
            screen.getByRole('checkbox', {name: /Include Insurance?/i})
        )

        // Set "false" value for a checkbox
        userEvent.click(
            screen.getByRole('checkbox', {name: /Include Insurance?/i})
        )

        // Cannot call onApply because validation is failing due to checkbox with "false" value
        userEvent.click(screen.getByRole('button', {name: /Apply/i}))
        expect(onApplyMock).not.toHaveBeenCalled()

        // Set "true" value for a checkbox
        userEvent.click(
            screen.getByRole('checkbox', {name: /Include Insurance?/i})
        )

        // `onApply` is now called after all required fields are completed
        userEvent.click(screen.getByRole('button', {name: /Apply/i}))
        expect(onApplyMock).toHaveBeenCalled()
    })
})
