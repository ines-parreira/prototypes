import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { formatCurrency } from '../formatCurrency'

describe('formatCurrency', () => {
    const originalNavigator = globalThis.navigator

    beforeAll(() => {
        vi.stubGlobal('navigator', { language: 'en-US' })
    })

    afterAll(() => {
        vi.stubGlobal('navigator', originalNavigator)
    })
    it('formats USD with 2 decimal places', () => {
        const result = formatCurrency({ amount: '318.21', currencyCode: 'USD' })
        expect(result).toBe('$318.21')
    })

    it('formats EUR with 2 decimal places', () => {
        const result = formatCurrency({ amount: '100.50', currencyCode: 'EUR' })
        expect(result).toBe('€100.50')
    })

    it('formats JPY with 0 decimal places', () => {
        const result = formatCurrency({ amount: '1000', currencyCode: 'JPY' })
        expect(result).toBe('¥1,000')
    })

    it('formats KRW with 0 decimal places', () => {
        const result = formatCurrency({ amount: '50000', currencyCode: 'KRW' })
        expect(result).toBe('₩50,000')
    })

    it('handles lowercase currency codes', () => {
        const result = formatCurrency({ amount: '99.99', currencyCode: 'usd' })
        expect(result).toBe('$99.99')
    })

    it('returns fallback for undefined money', () => {
        const result = formatCurrency(undefined)
        expect(result).toBe('-')
    })

    it('returns fallback for null money', () => {
        const result = formatCurrency(null)
        expect(result).toBe('-')
    })

    it('returns fallback when amount is missing', () => {
        const result = formatCurrency({
            amount: '',
            currencyCode: 'USD',
        })
        expect(result).toBe('-')
    })

    it('returns fallback when currencyCode is missing', () => {
        const result = formatCurrency({
            amount: '100',
            currencyCode: '',
        })
        expect(result).toBe('-')
    })

    it('uses custom fallback value', () => {
        const result = formatCurrency(undefined, { fallback: 'N/A' })
        expect(result).toBe('N/A')
    })

    it('formats whole numbers with trailing zeros for fractional currencies', () => {
        const result = formatCurrency({ amount: '100', currencyCode: 'USD' })
        expect(result).toBe('$100.00')
    })

    it('handles floating-point precision issues', () => {
        const result = formatCurrency({
            amount: '0.1',
            currencyCode: 'USD',
        })
        expect(result).toBe('$0.10')
    })

    it('formats large amounts with thousand separators', () => {
        const result = formatCurrency({
            amount: '1234567.89',
            currencyCode: 'USD',
        })
        expect(result).toBe('$1,234,567.89')
    })

    it('formats negative amounts when negative option is true', () => {
        const result = formatCurrency(
            { amount: '100', currencyCode: 'USD' },
            { negative: true },
        )
        expect(result).toBe('-$100.00')
    })

    it('returns fallback for zero amounts when renderIfZero is false', () => {
        const result = formatCurrency(
            { amount: '0', currencyCode: 'USD' },
            { renderIfZero: false },
        )
        expect(result).toBe('-')
    })

    it('formats zero amounts by default (renderIfZero is true)', () => {
        const result = formatCurrency({ amount: '0', currencyCode: 'USD' })
        expect(result).toBe('$0.00')
    })

    it('returns custom fallback for zero amounts when renderIfZero is false', () => {
        const result = formatCurrency(
            { amount: '0', currencyCode: 'USD' },
            { renderIfZero: false, fallback: 'N/A' },
        )
        expect(result).toBe('N/A')
    })
})
