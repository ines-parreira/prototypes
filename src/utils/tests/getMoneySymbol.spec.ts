import {getMoneySymbol} from '../getMoneySymbol'

describe('getMoneySymbol()', () => {
    it('should return symbol', () => {
        const symbol = getMoneySymbol('AUD')
        expect(symbol).toEqual('A$')
    })

    it('should return short symbol', () => {
        const symbol = getMoneySymbol('AUD', true)
        expect(symbol).toEqual('$')
    })
})
