import {fromJS, Map} from 'immutable'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyShippingLineFixture,
} from '../../../fixtures/shopify'
import {getCalculateDraftOrderPayload} from '../calculatedDraftOrder'

describe('getCalculateDraftOrderPayload()', () => {
    function getDraftOrderPayload(): Map<any, any> {
        return fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
    }

    it('should return payload with shipping line', () => {
        const shippingLine = fromJS(shopifyShippingLineFixture())
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_line',
            shippingLine
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)
        expect(payload).toMatchSnapshot()
    })

    it('should return payload without shipping line', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_line',
            null
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)
        expect(payload).toMatchSnapshot()
    })

    it('should return payload without applied discount', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'applied_discount',
            null
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)
        expect(payload).toMatchSnapshot()
    })

    it('should return payload without shipping address', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_address',
            null
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)
        expect(payload).toMatchSnapshot()
    })
})
