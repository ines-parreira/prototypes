import {fireEvent, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {produce} from 'immer'
import React, {ComponentProps} from 'react'

import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'

import {ModifiersPopover} from '../ModifiersPopover'

const defaultProps: ComponentProps<typeof ModifiersPopover> = {
    storeHash: 'Hello',
    product: bigCommerceProductFixture(),
    lineItem: bigCommerceLineItemFixture(),
    sku: 'THIS IS SKU',
    onClose: jest.fn(),
    onApply: jest.fn(),
    setReference: jest.fn(),
}
describe('<ModifiersPopover/>', () => {
    it('renders as expected', () => {
        const {container} = render(<ModifiersPopover {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('prefills values based on initialModifierValues and performs validation', () => {
        const {container} = render(
            <ModifiersPopover
                {...defaultProps}
                initialModifierValues={{
                    163: 284,
                    165: 288,
                    166: 292,
                    167: 295,
                    143: 250,
                }}
            />
        )

        expect(screen.getByText('Please check this box.')).toBeInTheDocument()

        expect(container).toMatchSnapshot()
    })

    it('is able to perform actions with inputs', () => {
        render(<ModifiersPopover {...defaultProps} />)

        // Cannot target by label because we cannot wrap our select boxes into labels properly ;(
        userEvent.click(screen.getAllByRole('combobox')[0])
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

    it('has inputs filled with values from line item', () => {
        const lineItem = produce(bigCommerceLineItemFixture(), (draft) => {
            draft.options = [
                {
                    nameId: 163,
                    valueId: 285,
                    name: 'Test Radio Buttons',
                    value: 'Test 2',
                },
            ]
        })

        render(<ModifiersPopover {...defaultProps} lineItem={lineItem} />)

        // Confirm that values is visible because it is selected from existing line item
        expect(screen.getByText(/Test 2/i)).toBeInTheDocument()
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
        userEvent.click(screen.getAllByRole('combobox')[0])
        userEvent.click(screen.getByText(/Test 1/i))

        userEvent.click(screen.getAllByRole('combobox')[1])
        fireEvent.click(screen.getByText(/Pattern/i))

        userEvent.click(screen.getAllByRole('combobox')[2])
        userEvent.click(screen.getByText(/Three/i))

        // userEvent.click(screen.getAllByRole('combobox')[3])
        // userEvent.click(screen.getByText(/Dropdown 2/i))

        userEvent.click(screen.getAllByRole('combobox')[4])
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
