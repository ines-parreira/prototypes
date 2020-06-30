// @flow

import React from 'react'
import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import {
    shopifyDraftOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import OrderTable from '../OrderTable'

describe('<OrderTable/>', () => {
    let onChange

    const payload = fromJS(shopifyDraftOrderPayloadFixture())
    const refund = fromJS(shopifySuggestedRefundFixture())

    beforeEach(() => {
        onChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <OrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    refund={refund}
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should render for multi-currency order', () => {
            const component = shallow(
                <OrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="JPY"
                    lineItems={payload.get('line_items', [])}
                    refund={refund}
                    onChange={onChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })

    describe('_onLineItemChange()', () => {
        it('should call onChange() with updated payload', () => {
            const component = shallow(
                <OrderTable
                    shopName="storegorgias3"
                    currencyCode="USD"
                    shopCurrencyCode="USD"
                    lineItems={payload.get('line_items', [])}
                    refund={refund}
                    onChange={onChange}
                />
            )

            const updatedLineItem = payload
                .getIn(['line_items', 0])
                .set('quantity', 5)
            component.instance()._onLineItemChange(0, updatedLineItem)

            const newLineItems = payload
                .get('line_items')
                .set(0, updatedLineItem)
            expect(onChange).toHaveBeenCalledWith(newLineItems)
        })
    })
})
