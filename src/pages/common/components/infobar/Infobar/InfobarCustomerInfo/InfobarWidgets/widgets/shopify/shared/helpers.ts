const DEFAULT_SYMBOL = '$'

/**
 * With `short` option, we return `$` instead of `A$` (for any currency that includes a `$` in it).
 * `currencyCode` value is never render, it's the ID of a currency.
 */
export default function getShopifyMoneySymbol(
    currencyCode: string,
    short = false
): string {
    const formatter = new Intl.NumberFormat(window.navigator.language, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
    })
    const parts = formatter.formatToParts(1)
    const currencyPart = parts.find((part) => part.type === 'currency')
    const symbol = currencyPart ? currencyPart.value : DEFAULT_SYMBOL

    return short && symbol.includes(DEFAULT_SYMBOL) ? DEFAULT_SYMBOL : symbol
}
