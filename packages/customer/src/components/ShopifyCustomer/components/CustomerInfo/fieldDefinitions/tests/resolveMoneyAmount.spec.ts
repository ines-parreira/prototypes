import { describe, expect, it } from 'vitest'

import { resolveMoneyAmount } from '../resolveMoneyAmount'

describe('resolveMoneyAmount', () => {
    it('returns undefined when amountSpent is undefined', () => {
        expect(resolveMoneyAmount(undefined, 'USD')).toBeUndefined()
    })

    it('returns original MoneyAmount when currencyCode is not XXX', () => {
        const money = { amount: '100.00', currencyCode: 'USD' }
        expect(resolveMoneyAmount(money, 'EUR')).toEqual(money)
    })

    it('replaces XXX currencyCode with shopperCurrency', () => {
        const money = { amount: '50.00', currencyCode: 'XXX' }
        expect(resolveMoneyAmount(money, 'EUR')).toEqual({
            amount: '50.00',
            currencyCode: 'EUR',
        })
    })

    it('returns original MoneyAmount with XXX when shopperCurrency is undefined', () => {
        const money = { amount: '50.00', currencyCode: 'XXX' }
        expect(resolveMoneyAmount(money, undefined)).toEqual(money)
    })
})
