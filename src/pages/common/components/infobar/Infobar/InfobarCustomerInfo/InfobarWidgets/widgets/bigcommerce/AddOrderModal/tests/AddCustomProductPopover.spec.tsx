import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {AddCustomProductPopover} from '../AddCustomProductPopover'

describe('AddCustomProductPopover', () => {
    it('does not add invalid custom product when clicking the `Add Item` button', () => {
        const onAddCustomProductMock = jest.fn()

        render(
            <AddCustomProductPopover
                id="test-add-custom-product-btn"
                currencyCode="EUR"
                onAddCustomProduct={onAddCustomProductMock}
                isOpen={true}
                onOpen={jest.fn()}
                onClose={jest.fn()}
            />
        )

        userEvent.click(screen.getByRole('button', {name: 'Add Item'}))
        expect(onAddCustomProductMock).toHaveBeenCalledTimes(0)
        expect(
            screen.getByRole('button', {name: 'Add Item'})
        ).toBeAriaDisabled()
    })

    it('adds custom product when clicking the `Add Item` button', async () => {
        const onAddCustomProductMock = jest.fn()
        const testProduct = {
            list_price: 100,
            name: 'test-product',
            quantity: 9,
            sku: 'sku001',
        }

        render(
            <AddCustomProductPopover
                id="test-add-custom-product-btn"
                currencyCode="EUR"
                onAddCustomProduct={onAddCustomProductMock}
                isOpen={true}
                onOpen={jest.fn()}
                onClose={jest.fn()}
            />
        )

        await userEvent.type(
            screen.getByRole('textbox', {name: 'Custom product name required'}),
            testProduct.name
        )
        await userEvent.type(
            screen.getByRole('textbox', {name: 'SKU'}),
            testProduct.sku
        )
        await userEvent.type(
            screen.getByRole('textbox', {name: 'Price per item required'}),
            String(testProduct.list_price)
        )
        await userEvent.type(
            screen.getByRole('textbox', {name: 'Quantity required'}),
            String(testProduct.quantity)
        )

        userEvent.click(screen.getByRole('button', {name: 'Add Item'}))
        expect(onAddCustomProductMock).toHaveBeenCalledTimes(1)
        expect(onAddCustomProductMock).toHaveBeenCalledWith(testProduct)
    })
})
