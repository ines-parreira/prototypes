// @flow

import React from 'react'
import {Input} from 'reactstrap'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {NON_FRACTIONAL_CURRENCIES} from '../../../../../../../../../../../constants/integrations/shopify'
import {formatPrice} from '../../../../../../../../../../../business/shopify/number.ts'
import ShopifyMoneySymbol from '../MoneySymbol'

import css from './AmountInput.less'

type Props = {
    id: string,
    value: string,
    min: ?number,
    max: ?number,
    className: ?string,
    required: boolean,
    disabled: boolean,
    currencyCode: string,
    symbol: ?string,
    saveInputRef: (inputRef: HTMLInputElement) => void,
    onChange: (value: string) => void,
}

export default class AmountInput extends React.PureComponent<Props> {
    static defaultProps = {
        id: 'amount',
        min: 0,
        max: null,
        className: null,
        required: true,
        disabled: false,
        symbol: null,
        saveInputRef: _noop,
    }

    _onBlur = (event: SyntheticInputEvent<HTMLInputElement>) => {
        const {currencyCode, onChange} = this.props
        const {value} = event.target
        const formattedValue = formatPrice(value || 0, currencyCode)

        if (value !== formattedValue) {
            event.target.value = formattedValue
            onChange(formattedValue)
        }
    }

    _onChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
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
        const label = symbol || (
            <ShopifyMoneySymbol currencyCode={currencyCode} short />
        )

        return (
            <div className={classnames(css.container, className)}>
                {!hasRightLabel && (
                    <span className={css.leftLabel}>{label}</span>
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
                    className={classnames(css.input, {
                        [css.hasLeftLabel]: !hasRightLabel,
                        [css.hasRightLabel]: hasRightLabel,
                    })}
                />
                {hasRightLabel && (
                    <span className={css.rightLabel}>{label}</span>
                )}
            </div>
        )
    }
}
