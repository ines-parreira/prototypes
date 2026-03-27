import type { MoneyAmount } from '../../../types'

export function resolveMoneyAmount(
    amountSpent: MoneyAmount | undefined,
    shopperCurrency: string | undefined,
): MoneyAmount | undefined {
    if (!amountSpent) return undefined

    // when creating test orders via test store and in some other ambiguous cases
    // the currencyCode will be XXX in which case we'll fall back to shopperCurrency
    if (amountSpent.currencyCode === 'XXX' && shopperCurrency) {
        return { amount: amountSpent.amount, currencyCode: shopperCurrency }
    }

    return amountSpent
}
