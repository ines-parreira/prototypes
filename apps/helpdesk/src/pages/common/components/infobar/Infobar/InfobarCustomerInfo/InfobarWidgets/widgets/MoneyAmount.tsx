import React, { Component } from 'react'

type Props = {
    amount: string
    currencyCode: string | null
    negative: boolean
    renderIfZero: boolean
    currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay']
}

export default class MoneyAmount extends Component<Props> {
    static defaultProps: Pick<Props, 'negative' | 'renderIfZero'> = {
        negative: false,
        renderIfZero: false,
    }

    static _DEFAULT_CURRENCY_CODE = 'USD'

    static _DEFAULT_CURRENCY_DISPLAY: Intl.NumberFormatOptions['currencyDisplay'] =
        'symbol'

    render() {
        const {
            amount,
            renderIfZero,
            currencyCode,
            negative,
            currencyDisplay,
        } = this.props
        const parsedAmount = parseFloat(amount)

        if ((!parsedAmount && !renderIfZero) || isNaN(parsedAmount)) {
            return '—'
        }

        const formatter = new Intl.NumberFormat(window.navigator.language, {
            style: 'currency',
            currency: currencyCode || MoneyAmount._DEFAULT_CURRENCY_CODE,
            currencyDisplay:
                currencyDisplay ?? MoneyAmount._DEFAULT_CURRENCY_DISPLAY,
            maximumFractionDigits: 2,
        })
        const formattedAmount = formatter.format(
            negative ? -parsedAmount : parsedAmount,
        )

        return <span>{formattedAmount}</span>
    }
}
