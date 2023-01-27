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
})
