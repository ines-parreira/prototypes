import React from 'react'
import {fromJS, Map, List} from 'immutable'
import {shallow} from 'enzyme'

import {
    shopifyDraftOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../../fixtures/shopify'
import OrderTable from '../OrderTable'

describe('<OrderTable/>', () => {
    let onChange: jest.MockedFunction<any>

    const payload = fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
    const refund = fromJS(shopifySuggestedRefundFixture()) as Map<any, any>

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

            const updatedLineItem = (payload.getIn(['line_items', 0]) as Map<
                any,
                any
            >).set('quantity', 5)
            ;(component.instance() as InstanceType<
                typeof OrderTable
            >)._onLineItemChange(0, updatedLineItem)

            const newLineItems = (payload.get('line_items') as List<any>).set(
                0,
                updatedLineItem
            )
            expect(onChange).toHaveBeenCalledWith(newLineItems)
        })
    })
})
