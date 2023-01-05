import React from 'react'
import produce from 'immer'

import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {bigCommerceCartFixture} from 'fixtures/bigcommerce'

import {Discount} from '../Discount'
import {useCanViewBigCommerceV1Features} from '../utils'

jest.mock('../utils', () => ({
    useCanViewBigCommerceV1Features: jest.fn(() => true),
}))

describe('<Discount />', () => {
    it('works as expected', async () => {
        const cartFixture = bigCommerceCartFixture()
        const onUpdateDiscountAmountMock = jest.fn()

        const {rerender, baseElement} = render(
            <Discount
                cart={cartFixture}
                currencyCode="EUR"
                onUpdateDiscountAmount={onUpdateDiscountAmountMock}
            />
        )

        expect(baseElement).toMatchSnapshot('initial')

        userEvent.click(screen.getByRole('button', {name: /Add discount/i}))

        // Close button is visible when we first open the popover
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: /Close/i})
            ).toBeInTheDocument()
        })
        // And the remove button is not visible
        expect(
            screen.queryByRole('button', {name: /Remove/i})
        ).not.toBeInTheDocument()

        // Using `fireEvent` here, because `userEvent.type` and `step` on `NumberInput` causes some swanky business ;(
        fireEvent.change(screen.getByLabelText('Discount amount'), {
            target: {value: 5.55},
        })
        userEvent.click(screen.getByRole('button', {name: /Apply/i}))

        expect(onUpdateDiscountAmountMock).toHaveBeenNthCalledWith(1, 5.55)

        // Popover gets closed
        expect(
            screen.queryByRole('button', {name: /Apply/i})
        ).not.toBeInTheDocument()

        expect(screen.getByRole('status')).toBeInTheDocument()

        rerender(
            <Discount
                cart={produce(cartFixture, (draft) => {
                    draft.discount_amount = 5.55
                })}
                currencyCode="EUR"
                onUpdateDiscountAmount={onUpdateDiscountAmountMock}
            />
        )

        expect(await screen.findByRole('status')).not.toBeInTheDocument()
        expect(baseElement).toMatchSnapshot('discount set')

        userEvent.click(screen.getByRole('button', {name: /Add discount/i}))

        // Remove button is visible when we open popover the second time, because the discount is set in the cart
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: /Remove/i})
            ).toBeInTheDocument()
        })
        // And the remove button is not visible
        expect(
            screen.queryByRole('button', {name: /Close/i})
        ).not.toBeInTheDocument()

        // Check that the callback on the "Remove" button is called correctly
        userEvent.click(screen.getByRole('button', {name: /Remove/i}))
        expect(onUpdateDiscountAmountMock).toHaveBeenNthCalledWith(2, 0)
    })

    it('returns null', () => {
        ;(
            useCanViewBigCommerceV1Features as jest.MockedFunction<
                typeof useCanViewBigCommerceV1Features
            >
        ).mockImplementation(() => false)

        const cartFixture = bigCommerceCartFixture()
        const onUpdateDiscountAmountMock = jest.fn()

        const {container} = render(
            <Discount
                cart={cartFixture}
                currencyCode="EUR"
                onUpdateDiscountAmount={onUpdateDiscountAmountMock}
            />
        )

        expect(container.firstChild).toBe(null)
    })
})
