import {fromJS} from 'immutable'

import {
    shopifyCancelOrderPayloadFixture,
    shopifyOrderAdjustmentFixture,
    shopifyOrderFixture,
    shopifyRefundFixture,
    shopifyRefundLineItemFixture,
    shopifyShippingLineFixture,
    shopifySuggestedRefundFixture
} from '../../../fixtures/shopify'
import {
    getFinalCancelOrderPayload,
    getLineItemQuantity,
    getRefundableShippingAmount,
    initCancelOrderLineItems,
    initCancelOrderPayload
} from '../order'

describe('initCancelOrderPayload()', () => {
    it('should return cancel order payload', () => {
        const order = fromJS(shopifyOrderFixture())
        const payload = initCancelOrderPayload(order)

        expect(payload).toMatchSnapshot()
    })
})

describe('initCancelOrderLineItems()', () => {
    it('should return line items used to render the cancel order modal', () => {
        const order = fromJS(shopifyOrderFixture())
        const payload = initCancelOrderLineItems(order)

        expect(payload).toMatchSnapshot()
    })
})

describe('getLineItemQuantity()', () => {
    it('should return original quantity because there is no refund', () => {
        const order = fromJS(shopifyOrderFixture())
        const lineItem = order.getIn(['line_items', 0])
        const quantity = getLineItemQuantity(order, lineItem)

        expect(quantity).toMatchSnapshot()
    })

    it('should return adjusted quantity because there is a refund', () => {
        const refundLineItems = fromJS([shopifyRefundLineItemFixture()])
        const refund = fromJS(shopifyRefundFixture({refundLineItems}))
        const order = fromJS(shopifyOrderFixture()).setIn(['refunds', 0], refund)
        const lineItem = order.getIn(['line_items', 0])
        const quantity = getLineItemQuantity(order, lineItem)

        expect(quantity).toMatchSnapshot()
    })
})

describe('getRefundableShippingAmount()', () => {
    it('should return original amount because there is no refund', () => {
        const shippingLines = fromJS([shopifyShippingLineFixture()])
        const order = fromJS(shopifyOrderFixture({shippingLines}))
        const amount = getRefundableShippingAmount(order)

        expect(amount).toMatchSnapshot()
    })

    it('should return adjusted amount because there is a refund', () => {
        const shippingLines = fromJS([shopifyShippingLineFixture()])
        const orderAdjustments = fromJS([shopifyOrderAdjustmentFixture()])
        const refund = fromJS(shopifyRefundFixture({orderAdjustments}))
        const order = fromJS(shopifyOrderFixture({shippingLines})).setIn(['refunds', 0], refund)
        const amount = getRefundableShippingAmount(order)

        expect(amount).toMatchSnapshot()
    })
})

describe('getFinalCancelOrderPayload()', () => {
    it('should return final cancel order payload', () => {
        const payload = fromJS(shopifyCancelOrderPayloadFixture())
        const refund = fromJS(shopifySuggestedRefundFixture())
        const finalPayload = getFinalCancelOrderPayload(payload, refund)

        expect(finalPayload).toMatchSnapshot()
    })
})
