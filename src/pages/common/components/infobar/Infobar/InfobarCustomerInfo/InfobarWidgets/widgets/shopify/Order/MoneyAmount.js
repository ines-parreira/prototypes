// @flow

import React from 'react'
import {formatMoney} from '@shopify/theme-currency'

import {RIGHT_SYMBOL_CURRENCY_CODES} from '../../../../../../../../../../constants/integrations/shopify'

import ShopifyMoneySymbol from './MoneySymbol'

type Props = {
    amount: string,
    currencyCode: string,
    shortCurrencyCode: boolean,
    negative: boolean,
    renderIfZero: boolean,
}

export default class ShopifyMoneyAmount extends React.PureComponent<Props> {
    static defaultProps = {
        shortCurrencyCode: false,
        negative: false,
        renderIfZero: false,
    }

    render() {
        const {amount, renderIfZero, currencyCode, negative, shortCurrencyCode} = this.props

        if (!parseFloat(amount) && !renderIfZero) {
            return '—'
        }

        const formattedAmount = formatMoney(amount, '{{amount}}')
        const right = RIGHT_SYMBOL_CURRENCY_CODES.includes(currencyCode)

        const formattedSymbol = (
            <ShopifyMoneySymbol
                currencyCode={currencyCode}
                short={shortCurrencyCode}
            />
        )

        return (
            <span>
                {negative && '- '}
                {!right && formattedSymbol}
                {formattedAmount}
                {right && ' '}
                {right && formattedSymbol}
            </span>
        )
    }
}
