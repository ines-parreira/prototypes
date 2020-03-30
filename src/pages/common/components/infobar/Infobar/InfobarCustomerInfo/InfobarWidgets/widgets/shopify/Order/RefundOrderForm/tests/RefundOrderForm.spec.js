import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture
} from '../../../../../../../../../../../../fixtures/shopify'
import RefundOrderForm from '../RefundOrderForm'
import {ShopifyAction} from '../../constants'

describe('<RefundOrderForm/>', () => {
    const order = fromJS(shopifyOrderFixture())
    const refund = fromJS(shopifySuggestedRefundFixture())
    const payload = fromJS(shopifyRefundOrderPayloadFixture())
    const lineItems = fromJS([shopifyLineItemFixture()])

    let setPayload
    let onPayloadChange
    let onLineItemsChange
    let onReasonChange

    beforeEach(() => {
        setPayload = jest.fn()
        onPayloadChange = jest.fn()
        onLineItemsChange = jest.fn()
        onReasonChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <RefundOrderForm
                    shopName="storegorgias3"
                    actionName={ShopifyAction.CANCEL_ORDER}
                    loading={false}
                    reason=""
                    order={order}
                    refund={refund}
                    payload={payload}
                    lineItems={lineItems}
                    setPayload={setPayload}
                    onPayloadChange={onPayloadChange}
                    onLineItemsChange={onLineItemsChange}
                    onReasonChange={onReasonChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
