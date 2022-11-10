import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {CART_VALUE_OPERATORS} from '../../constants/operators'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    CartValueOperators,
    isCartValueOperators,
} from '../../types/enums/CartValueOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CartValueTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CartValueOperators>(
        trigger.operator as CartValueOperators
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) => {
        if (isCartValueOperators(operator.toString())) {
            setInnerOperator(operator as CartValueOperators)
            onUpdateTrigger(id, {operator: operator as CartValueOperators})
        }
    }

    const handleChangeValue = (value: string) => {
        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            value: innerValue,
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator as CartValueOperators)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Amount added to cart"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Amount Added To Cart
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={CART_VALUE_OPERATORS}
            />
            <div
                data-testid="cart-amount-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    prefix="$"
                    value={innerValue}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
