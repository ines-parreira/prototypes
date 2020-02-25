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
    // Supported currencies on Shopify:
    // https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency#supported-currencies
    static _SYMBOLS = {
        AUD: 'A$',  // Australian dollar
        CAD: 'C$',  // Canadian dollar
        DKK: 'kr.', // Danish Krone
        EUR: '€',   // Euro
        HKD: 'HK$', // Hong Kong dollar
        JPY: '¥',   // Japanese yen
        NZD: 'NZ$', // New Zealand dollar
        GBP: '£',   // Pound sterling (British pound)
        SGD: 'S$',  // Singapore dollar
        SEK: 'kr',  // Swedish krona
        USD: '$',   // United States dollar
    }

    static defaultProps = {
        short: false,
    }

    render() {
        const {currencyCode, short} = this.props
        const symbol = ShopifyMoneySymbol._SYMBOLS[currencyCode] || ShopifyMoneySymbol._SYMBOLS.USD

        return short && symbol.includes(ShopifyMoneySymbol._SYMBOLS.USD)
            ? ShopifyMoneySymbol._SYMBOLS.USD
            : symbol
    }
}
