// @flow

import React from 'react'

type Props = {
    currencyCode: string,
    short: boolean,
}

/**
 * With `short` prop, we render `$` instead of `A$` (for any currency that includes a `$` in it).
 * `currencyCode` value is never render, it's the ID of a currency.
 */
export default class ShopifyMoneySymbol extends React.PureComponent<Props> {
    static _DEFAULT_SYMBOL = '$'

    static defaultProps = {
        short: false,
    }

    render() {
        const {currencyCode, short} = this.props
        const formatter = new Intl.NumberFormat(window.navigator.language, {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol',
        })
        //$FlowFixMe
        const parts = formatter.formatToParts(1)
        const currencyPart = parts.find((part) => part.type === 'currency')
        const symbol = currencyPart
            ? currencyPart.value
            : ShopifyMoneySymbol._DEFAULT_SYMBOL

        return short && symbol.includes(ShopifyMoneySymbol._DEFAULT_SYMBOL)
            ? ShopifyMoneySymbol._DEFAULT_SYMBOL
            : symbol
    }
}
