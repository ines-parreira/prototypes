import React, {PureComponent} from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {NON_FRACTIONAL_CURRENCIES} from 'constants/integrations/shopify'
import NumberInput from 'pages/common/forms/input/NumberInput'

import getShopifyMoneySymbol from '../helpers'

import css from './AmountInput.less'

type Props = {
    id: string
    value: number
    min: number
    max?: number
    className: string | null
    required: boolean
    disabled: boolean
    currencyCode: string
    symbol: string | null
    saveInputRef: (inputRef: HTMLInputElement) => void
    onChange: (value: number) => void
}

export default class AmountInput extends PureComponent<Props> {
    static defaultProps: Pick<
        Props,
        | 'id'
        | 'min'
        | 'className'
        | 'required'
        | 'disabled'
        | 'symbol'
        | 'saveInputRef'
    > = {
        id: 'amount',
        min: 0,
        className: null,
        required: true,
        disabled: false,
        symbol: null,
        saveInputRef: _noop,
    }

    _onChange = (nextValue?: number) => {
        const {onChange} = this.props

        onChange(nextValue || 0)
    }

    render() {
        const {
            id,
            value,
            min,
            max,
            symbol,
            currencyCode,
            required,
            disabled,
            className,
        } = this.props
        const step =
            symbol !== '%' && NON_FRACTIONAL_CURRENCIES.includes(currencyCode)
                ? 1
                : 0.01
        const hasRightLabel = symbol === '%'
        const label = symbol || getShopifyMoneySymbol(currencyCode, true)
        return (
            <div className={classnames(css.container, className)}>
                <NumberInput
                    id={id}
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    isRequired={required}
                    isDisabled={disabled}
                    onChange={this._onChange}
                    {...(hasRightLabel ? {suffix: label} : {prefix: label})}
                />
            </div>
        )
    }
}
