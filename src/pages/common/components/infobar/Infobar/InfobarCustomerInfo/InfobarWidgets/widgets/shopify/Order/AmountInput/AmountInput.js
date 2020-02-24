// @flow

import React from 'react'
import {Input} from 'reactstrap'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import {RIGHT_SYMBOL_CURRENCY_CODES} from '../../../../../../../../../../../constants/integrations/shopify'
import ShopifyMoneySymbol from '../MoneySymbol'

import css from './AmountInput.less'

type Props = {
    id: string,
    value: string,
    min: ?number,
    max: ?number,
    className: ?string,
    required: boolean,
    currencyCode: string,
    symbol: ?string,
    saveInputRef: (inputRef: HTMLInputElement) => void,
    onChange: (event: SyntheticInputEvent<HTMLInputElement>) => void,
}

export default class AmountInput extends React.PureComponent<Props> {
    static defaultProps = {
        id: 'amount',
        min: 0,
        max: null,
        className: null,
        required: true,
        symbol: null,
        saveInputRef: _noop,
    }

    render() {
        const {id, value, min, max, symbol, currencyCode, required, className, saveInputRef, onChange} = this.props
        const hasRightLabel = RIGHT_SYMBOL_CURRENCY_CODES.includes(currencyCode) || symbol === '%'
        const label = symbol || (
            <ShopifyMoneySymbol
                currencyCode={currencyCode}
                short
            />
        )

        return (
            <div className={classnames(css.container, className)}>
                {!hasRightLabel && <span className={css.leftLabel}>{label}</span>}
                <Input
                    type="number"
                    id={id}
                    value={value}
                    min={min}
                    max={max}
                    step={0.01}
                    required={required}
                    onChange={onChange}
                    innerRef={saveInputRef}
                    className={classnames(css.input, {
                        [css.hasLeftLabel]: !hasRightLabel,
                        [css.hasRightLabel]: hasRightLabel,
                    })}
                />
                {hasRightLabel && <span className={css.rightLabel}>{label}</span>}
            </div>
        )
    }
}
