import {fromJS} from 'immutable'

import Customer from '../Customer'
import Order from '../Order'

import magento2 from '..'


describe('magento2', () => {
    it('should return the Customer widget because the passed path matches its path', () => {
        expect(magento2({template: fromJS({absolutePath: ['customer', 'integrations', 123, 'customer']})}))
            .toEqual(Customer())
    })

    it('should return the Order widget because the passed path matches its path', () => {
        expect(magento2({template: fromJS({absolutePath: ['customer', 'integrations', 123, 'orders', '[]']})}))
            .toEqual(Order())
    })

    it('should return an empty object because the path does not match anything', () => {
        const paths = [
            ['customer', 'integrations', 123, 'sangria'],
            ['customer', 'integrations', 'foo', 'customer'],
            ['customer', 123, 'customer']
        ]
        paths.forEach((absolutePath) => {
            expect(magento2({template: fromJS({absolutePath})})) .toEqual({})
        })
    })
})
