// @flow

import getShopifyMoneySymbol from '../helpers'

describe('getShopifyMoneySymbol()', () => {
    it('should return symbol', () => {
        const symbol = getShopifyMoneySymbol('AUD')
        expect(symbol).toEqual('A$')
    })

    it('should return short symbol', () => {
        const symbol = getShopifyMoneySymbol('AUD', true)
        expect(symbol).toEqual('$')
    })
})
