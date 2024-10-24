import {
    bigCommerceLineItemFixture,
    bigCommerceProductFixture,
} from 'fixtures/bigcommerce'
import {BigCommerceProductsListType} from 'models/integration/types'

import {getOrderLineItemInfo} from '../utils'

describe('utils', () => {
    describe('getOrderLineItemInfo', () => {
        it('should return line item info for product without options', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()
            product.id = lineItem.product_id
            const products: BigCommerceProductsListType = new Map([
                [product.id, product],
            ])
            expect(getOrderLineItemInfo(lineItem, products)).toEqual({
                product: product,
                uid: `${lineItem.product_id}_${lineItem.variant_id}`,
            })
        })

        it('should return line item info for product with options', () => {
            const lineItem = bigCommerceLineItemFixture()
            const product = bigCommerceProductFixture()
            product.id = lineItem.product_id
            lineItem.options = [
                {name: 'name1', name_id: 1, value: 'name1', value_id: 1},
                {name: 'name2', name_id: 2, value: 'name2', value_id: 2},
                {name: 'name3', name_id: 3, value: 'name3', value_id: 3},
            ]
            const products: BigCommerceProductsListType = new Map([
                [product.id, product],
            ])
            expect(getOrderLineItemInfo(lineItem, products)).toEqual({
                product: product,
                uid: `${lineItem.product_id}_${lineItem.variant_id}_1_2_3`,
            })
        })
    })
})
