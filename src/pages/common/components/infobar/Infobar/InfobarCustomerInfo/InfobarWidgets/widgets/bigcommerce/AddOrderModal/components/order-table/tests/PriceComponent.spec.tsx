import React from 'react'
import {render, screen} from '@testing-library/react'

import produce from 'immer'
import {
    bigCommerceCustomLineItemFixture,
    bigCommerceLineItemFixture,
} from 'fixtures/bigcommerce'

import PriceComponent from '../PriceComponent'

jest.mock('../../../utils', () => ({
    ...jest.requireActual<Record<string, unknown>>('../../../utils'),
}))

describe('<PriceComponent/>', () => {
    it('does not show price as button when line item is custom', () => {
        render(
            <PriceComponent
                lineItem={bigCommerceCustomLineItemFixture}
                currencyCode="EUR"
                handleDiscount={jest.fn()}
                discounts={new Map()}
            />
        )

        expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('show price as button', () => {
        render(
            <PriceComponent
                lineItem={bigCommerceLineItemFixture()}
                currencyCode="EUR"
                handleDiscount={jest.fn()}
                discounts={new Map()}
            />
        )

        expect(screen.queryByRole('button')).toBeInTheDocument()
    })

    it('show price as button and the discounted price', () => {
        const initialLineItem = produce(
            bigCommerceLineItemFixture(),
            (draft) => {
                draft.list_price = 55
                draft.variant_id = 1
            }
        )
        const discounts = new Map([
            [initialLineItem.id, initialLineItem.list_price],
        ])
        const {rerender} = render(
            <PriceComponent
                lineItem={initialLineItem}
                currencyCode="EUR"
                handleDiscount={jest.fn()}
                discounts={discounts}
            />
        )

        const updatedLineItem = produce(initialLineItem, (draft) => {
            draft.list_price = 44
        })

        rerender(
            <PriceComponent
                lineItem={updatedLineItem}
                currencyCode="EUR"
                handleDiscount={jest.fn()}
                discounts={discounts}
            />
        )

        expect(screen.getByText(/55/i)).toBeInTheDocument()
        expect(screen.getByRole('button', {name: /44/i})).toBeInTheDocument()
    })
})
