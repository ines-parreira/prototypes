import {fromJS, Map} from 'immutable'

import {DiscountType} from '../../../constants/integrations/types/shopify'
import {
    shopifyAppliedDiscountFixture,
    shopifyCustomLineItemFixture,
    shopifyDraftOrderPayloadFixture,
    shopifyLineItemFixture,
} from '../../../fixtures/shopify'
import {addCustomLineItem} from '../draftOrder'
import {getDiscountAmount, refreshAppliedDiscounts} from '../discount'
import {formatPrice} from '../number'

describe('getDiscountAmount()', () => {
    it('should return the discount amount for fixed amount discount', () => {
        const amount = 50
        const discountType = DiscountType.FixedAmount
        const discountAmount = '10.0'
        const currencyCode = 'USD'
        const result = formatPrice(
            getDiscountAmount(amount, discountType, discountAmount),
            currencyCode,
            true
        )
        expect(result).toMatchSnapshot()
    })

    it('should return the discount amount for percentage discount', () => {
        const amount = 50
        const discountType = DiscountType.Percentage
        const discountAmount = '10.0'
        const currencyCode = 'USD'
        const result = formatPrice(
            getDiscountAmount(amount, discountType, discountAmount),
            currencyCode,
            true
        )
        expect(result).toMatchSnapshot()
    })
})

describe('refreshAppliedDiscounts()', () => {
    it('should refresh the applied discount amount of the given payload', () => {
        // Payload has a 100% discount applied
        const payload = fromJS(shopifyDraftOrderPayloadFixture())

        // Add a line item, applied discounts are wrong because we did not refresh them yet
        const customLineItem = fromJS(shopifyCustomLineItemFixture())
        const payloadWithCustomLineItem = addCustomLineItem(
            payload,
            customLineItem
        )
        expect(
            parseFloat(
                payloadWithCustomLineItem.getIn([
                    'applied_discount',
                    'amount',
                ]) as string
            )
        ).toMatchSnapshot()

        // Refresh applied discounts
        const newPayload = refreshAppliedDiscounts(payloadWithCustomLineItem)
        expect(
            parseFloat(
                newPayload.getIn(['applied_discount', 'amount']) as string
            )
        ).toMatchSnapshot()
    })

    it('should work without rounding errors', () => {
        // Payload has a 100% discount applied
        const payload = (
            fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
        ).set(
            'line_items',
            fromJS([
                shopifyLineItemFixture({price: '98.99'}),
                shopifyLineItemFixture({price: '24.95'}),
                shopifyLineItemFixture({price: '8.95'}),
            ])
        )

        const newPayload = refreshAppliedDiscounts(payload)
        expect(newPayload).toMatchSnapshot()
    })

    it.each([
        [1, '9.99'],
        [2, '19.99'],
        [3, '29.98'],
        [4, '39.98'],
        [5, '49.97'],
        [6, '59.97'],
        [7, '69.96'],
        [8, '79.96'],
        [9, '89.95'],
        [10, '99.95'],
        [11, '109.94'],
        [12, '119.94'],
        [13, '129.93'],
        [14, '139.93'],
        [15, '149.92'],
    ])(
        'should return expected payload with applied discounts',
        (quantity, expectedAmount) => {
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({value: '50.00'})
            )
            const lineItem = fromJS(
                shopifyLineItemFixture({
                    price: '19.99',
                    quantity,
                    appliedDiscount,
                })
            )
            const payload = (
                fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
            )
                .set('applied_discount', null)
                .set('line_items', fromJS([lineItem]))

            const newPayload = refreshAppliedDiscounts(payload)
            const discountAmount = newPayload.getIn([
                'line_items',
                0,
                'applied_discount',
                'amount',
            ])
            expect(discountAmount).toEqual(expectedAmount)
        }
    )

    it.each([
        [1, '4747'],
        [2, '9495'],
        [3, '14242'],
        [4, '18990'],
        [5, '23738'],
        [6, '28485'],
        [7, '33233'],
        [8, '37980'],
        [9, '42728'],
        [10, '47476'],
        [11, '52223'],
        [12, '56971'],
        [13, '61718'],
        [14, '66466'],
        [15, '71214'],
    ])(
        'should return expected payload with applied discounts and non-fractional currency',
        (quantity, expectedAmount) => {
            const appliedDiscount = fromJS(
                shopifyAppliedDiscountFixture({value: '5.00'})
            )
            const lineItem = fromJS(
                shopifyLineItemFixture({
                    price: '94952',
                    quantity,
                    appliedDiscount,
                })
            )
            const payload = (
                fromJS(shopifyDraftOrderPayloadFixture()) as Map<any, any>
            )
                .set('applied_discount', null)
                .set('line_items', fromJS([lineItem]))
                .set('currency', 'JPY')

            const newPayload = refreshAppliedDiscounts(payload)
            const discountAmount = newPayload.getIn([
                'line_items',
                0,
                'applied_discount',
                'amount',
            ])
            expect(discountAmount).toEqual(expectedAmount)
        }
    )
})
