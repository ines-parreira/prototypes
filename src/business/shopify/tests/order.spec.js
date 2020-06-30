//@flow
import {fromJS} from 'immutable'

import {
    shopifyCancelOrderPayloadFixture,
    shopifyMultiCurrencyOrderFixture,
    shopifyOrderFixture,
    shopifyRefundFixture,
    shopifyRefundLineItemFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../fixtures/shopify'
import {
    getFinalCancelOrderPayload,
    getFinalRefundOrderPayload,
    getLineItemQuantity,
    initCancelOrderPayload,
    initRefundOrderLineItems,
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
        const payload = initRefundOrderLineItems(order)

        expect(payload).toMatchSnapshot()
    })

    it('should return line items used to render the cancel order modal for multi-currency order', () => {
        const order = fromJS(shopifyMultiCurrencyOrderFixture())
        const payload = initRefundOrderLineItems(order)

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
        const order = fromJS(shopifyOrderFixture()).setIn(
            ['refunds', 0],
            refund
        )
        const lineItem = order.getIn(['line_items', 0])
        const quantity = getLineItemQuantity(order, lineItem)

        expect(quantity).toMatchSnapshot()
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

describe('getFinalRefundOrderPayload()', () => {
    it('should return final refund order payload', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())
        const refund = fromJS(shopifySuggestedRefundFixture())
        const finalPayload = getFinalRefundOrderPayload(payload, refund)

        expect(finalPayload).toMatchSnapshot()
    })

    it('should override `restock_type` to `no_restock` because `location_id` is `null`', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())
        const refund = fromJS(shopifySuggestedRefundFixture({locationId: null}))
        const finalPayload = getFinalRefundOrderPayload(payload, refund)

        expect(finalPayload).toMatchSnapshot()
    })
})
