// @flow

import React from 'react'

type Props = {
    amount: string,
    currencyCode: string,
    negative: boolean,
    renderIfZero: boolean,
}

export default class ShopifyMoneyAmount extends React.PureComponent<Props> {
    static defaultProps = {
        negative: false,
        renderIfZero: false,
    }

    render() {
        const {amount, renderIfZero, currencyCode, negative} = this.props
        const parsedAmount = parseFloat(amount)

        if (!parsedAmount && !renderIfZero || isNaN(parsedAmount)) {
            return '—'
        }

        const formatter = new Intl.NumberFormat(window.navigator.language, {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol',
            maximumFractionDigits: 2,
        })
        const formattedAmount = formatter.format(negative ? -parsedAmount : parsedAmount)

        return (
            <span>{formattedAmount}</span>
        )
    }
}
