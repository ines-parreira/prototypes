import { getMoneySymbol } from '@repo/utils'

export function formatTotal(
    currency: string | undefined,
    amount: string | undefined,
): string {
    const symbol = currency ? getMoneySymbol(currency, true) : ''
    return `${symbol}${amount ?? '0.00'}`
}
