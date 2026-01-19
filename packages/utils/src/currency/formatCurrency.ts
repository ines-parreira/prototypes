const NON_FRACTIONAL_CURRENCIES = new Set([
    'BIF',
    'CLP',
    'DJF',
    'GNF',
    'JPY',
    'KMF',
    'KRW',
    'MGA',
    'PYG',
    'RWF',
    'UGX',
    'VND',
    'VUV',
    'XAF',
    'XOF',
    'XPF',
])

export type MoneyAmount = {
    amount: string
    currencyCode: string
}

export type FormatCurrencyOptions = {
    fallback?: string
    negative?: boolean
    renderIfZero?: boolean
}

export function formatCurrency(
    money: MoneyAmount | undefined | null,
    options: FormatCurrencyOptions = {},
): string {
    const { fallback = '-', negative = false, renderIfZero = true } = options

    if (!money?.amount || !money?.currencyCode) return fallback

    const currencyCode = money.currencyCode.toUpperCase()
    const isNonFractional = NON_FRACTIONAL_CURRENCIES.has(currencyCode)
    const decimals = isNonFractional ? 0 : 2

    const numericAmount = parseFloat(parseFloat(money.amount).toFixed(3))

    if (numericAmount === 0 && !renderIfZero) return fallback

    const finalAmount = negative ? -numericAmount : numericAmount

    return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(finalAmount)
}
