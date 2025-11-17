import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    shopifyDraftOrderPayloadFixture,
    shopifyShippingLineFixture,
} from '../../../fixtures/shopify'
import { getCalculateDraftOrderPayload } from '../calculatedDraftOrder'

describe('getCalculateDraftOrderPayload()', () => {
    function getDraftOrderPayload(): Map<any, any> {
        return fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
    }

    it('should return payload with shipping line', () => {
        const shippingLine = fromJS(shopifyShippingLineFixture())
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_line',
            shippingLine,
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)

        expect(payload.get('shippingLine')).not.toBeNull()
        expect(payload.getIn(['shippingLine', 'price'])).toBe('12.00')
        expect(payload.getIn(['shippingLine', 'title'])).toBe(
            'Standard Shipping',
        )
    })

    it('should return payload without shipping line', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_line',
            null,
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)

        expect(payload.get('shippingLine')).toBeNull()
    })

    it('should return payload without applied discount', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'applied_discount',
            null,
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)

        expect(payload.get('appliedDiscount')).toBeNull()
    })

    it('should return payload without shipping address', () => {
        const draftOrderPayload = getDraftOrderPayload().set(
            'shipping_address',
            null,
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)

        expect(payload.get('shippingAddress')).toBeNull()
    })

    it('should include phone number in shipping address when phone is present', () => {
        const draftOrderPayload = getDraftOrderPayload().setIn(
            ['shipping_address', 'phone'],
            '+1234567890',
        )
        const payload = getCalculateDraftOrderPayload(draftOrderPayload)

        expect(payload.getIn(['shippingAddress', 'phone'])).toBe('+1234567890')
        expect(payload.getIn(['shippingAddress', 'countryCode'])).toBe('FR')
    })

    it.each([
        ['null', null],
        ['undefined', undefined],
        ['empty string', ''],
    ])(
        'should not include phone field in shipping address when phone is %s',
        (_, phoneValue) => {
            const draftOrderPayload = getDraftOrderPayload().setIn(
                ['shipping_address', 'phone'],
                phoneValue,
            )
            const payload = getCalculateDraftOrderPayload(draftOrderPayload)

            expect(payload.getIn(['shippingAddress'])).toBeDefined()
            expect(payload.getIn(['shippingAddress']).has('phone')).toBe(false)
            expect(payload.getIn(['shippingAddress', 'countryCode'])).toBe('FR')
        },
    )
})
