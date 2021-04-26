import React, {FocusEvent, ChangeEvent, PureComponent} from 'react'
import {Input} from 'reactstrap'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {NON_FRACTIONAL_CURRENCIES} from '../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../business/shopify/number'
import getShopifyMoneySymbol from '../helpers'

import css from './AmountInput.less'

type Props = {
    id: string
    value: string
    min: number
    max?: number
    className: string | null
    required: boolean
    disabled: boolean
    currencyCode: string
    symbol: string | null
    saveInputRef: (inputRef: HTMLInputElement) => void
    onChange: (value: string) => void
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

    _onBlur = (event: FocusEvent<HTMLInputElement>) => {
        const {currencyCode, onChange} = this.props
        const {value} = event.target
        const formattedValue = formatPrice(value || 0, currencyCode)

        if (value !== formattedValue) {
            event.target.value = formattedValue
            onChange(formattedValue)
        }
    }

    _onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {onChange} = this.props
        const {value} = event.target

        onChange(value)
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
            saveInputRef,
        } = this.props
        const step =
            symbol !== '%' && NON_FRACTIONAL_CURRENCIES.includes(currencyCode)
                ? 1
                : 0.01
        const hasRightLabel = symbol === '%'
        const label = symbol || getShopifyMoneySymbol(currencyCode, true)
        const labelWidth = label.length === 1 ? '2rem' : '3rem'
        const labelStyle = {width: labelWidth}
        const inputStyle = hasRightLabel
            ? {paddingRight: labelWidth}
            : {paddingLeft: labelWidth}

        return (
            <div className={classnames(css.container, className)}>
                {!hasRightLabel && (
                    <span className={css.leftLabel} style={labelStyle}>
                        {label}
                    </span>
                )}
                <Input
                    type="number"
                    id={id}
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    required={required}
                    disabled={disabled}
                    onChange={this._onChange}
                    onBlur={this._onBlur}
                    innerRef={saveInputRef}
                    className={css.input}
                    style={inputStyle}
                />
                {hasRightLabel && (
                    <span className={css.rightLabel} style={labelStyle}>
                        {label}
                    </span>
                )}
            </div>
        )
    }
}
