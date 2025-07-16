import type { ComponentProps } from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { produce } from 'immer'

import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'

import { ModifiersPopover } from '../ModifiersPopover'

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
        const { container } = render(<ModifiersPopover {...defaultProps} />)

        expect(container).toMatchSnapshot()
    })

    it('prefills values based on initialModifierValues and performs validation', () => {
        const { container } = render(
            <ModifiersPopover
                {...defaultProps}
                initialModifierValues={{
                    163: 284,
                    165: 288,
                    166: 292,
                    167: 295,
                    143: 250,
                }}
            />,
        )

        expect(screen.getByText('Please check this box.')).toBeInTheDocument()

        expect(container).toMatchSnapshot()
    })

    it('is able to perform actions with inputs', async () => {
        render(<ModifiersPopover {...defaultProps} />)

        // Cannot target by label because we cannot wrap our select boxes into labels properly ;(
        await userEvent.click(screen.getAllByRole('combobox')[0])
        await waitFor(() => {
            expect(screen.getByText(/Test 1/i)).toBeInTheDocument()
        })
        await userEvent.click(screen.getByText(/Test 1/i))

        // Confirm that the of the selected dropdown value is visible after it is selected
        await waitFor(() => {
            expect(screen.getByText(/Test 1/i)).toBeInTheDocument()
        })

        // Checkbox gets checked
        await userEvent.click(
            screen.getByRole('checkbox', { name: /Include Insurance?/i }),
        )
        await waitFor(() => {
            expect(
                screen.getByRole('checkbox', { name: /Include Insurance?/i }),
            ).toBeChecked()
        })
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

    it('can submit the form when all required fields are filled out', async () => {
        const onApplyMock = jest.fn()
        const user = userEvent.setup()

        render(<ModifiersPopover {...defaultProps} onApply={onApplyMock} />)

        // Step 1: Verify initial state
        await user.click(screen.getByRole('button', { name: /Apply/i }))
        expect(onApplyMock).not.toHaveBeenCalled()

        // Check that error messages are visible for required fields
        expect(screen.getAllByText('Please fill out this field.')).toHaveLength(
            4,
        )
        expect(screen.getByText('Please check this box.')).toBeInTheDocument()

        // Step 2: Fill out required fields
        const selectOptions = [
            { index: 0, value: 'Test 1' },
            { index: 1, value: 'Pattern' },
            { index: 2, value: 'Three' },
            { index: 4, value: 'Terrarium Orbit' },
        ]

        // Fill select fields sequentially to avoid race conditions
        for (const { index, value } of selectOptions) {
            const combobox = screen.getAllByRole('combobox')[index]
            await user.click(combobox)
            const option = await screen.findByText(new RegExp(value, 'i'))
            await user.click(option)
        }

        // Step 3: Handle checkbox
        const checkbox = screen.getByRole('checkbox', {
            name: /Include Insurance?/i,
        })

        // Toggle checkbox to false
        await user.click(checkbox)
        await user.click(checkbox)

        // Verify form is invalid
        await user.click(screen.getByRole('button', { name: /Apply/i }))
        expect(onApplyMock).not.toHaveBeenCalled()

        // Toggle checkbox to true
        await user.click(checkbox)
        expect(checkbox).toBeChecked()

        // Step 4: Submit form
        await user.click(screen.getByRole('button', { name: /Apply/i }))
        expect(onApplyMock).toHaveBeenCalled()
    })
})
