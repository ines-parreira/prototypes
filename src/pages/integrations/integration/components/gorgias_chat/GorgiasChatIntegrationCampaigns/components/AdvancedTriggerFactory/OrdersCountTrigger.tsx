import React, {useEffect, useState} from 'react'

import toInteger from 'lodash/toInteger'
import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {isTriggerValueNonNegative} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/utils/isTriggerValueNonNegative'
import {ORDERS_COUNT_OPERATORS} from '../../constants/operators'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    OrdersCountOperators,
    isOrdersCountOperators,
} from '../../types/enums/OrdersCountOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const OrdersCountTrigger = ({
    id,
    isAllowedToEdit = false,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<OrdersCountOperators>(
        trigger.operator as OrdersCountOperators
    )
    const [innerValue, setInnerValue] = useState<number | undefined>(
        toInteger(trigger.value)
    )

    const handleChangeOperator = (operator: Value) => {
        if (isOrdersCountOperators(operator.toString())) {
            setInnerOperator(operator as OrdersCountOperators)
            onUpdateTrigger(id, {operator: operator as OrdersCountOperators})
        }
    }

    const handleChangeValue = (value: string) => {
        if (!isAllowedToEdit) return

        if (value === '') {
            setInnerValue(undefined)
        } else if (!isTriggerValueNonNegative(value)) {
            setInnerValue(0)
        } else {
            setInnerValue(toInteger(value))
        }
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            value: innerValue,
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator as OrdersCountOperators)
        setInnerValue(toInteger(trigger.value))
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="orders-placed"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Number of orders placed
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={ORDERS_COUNT_OPERATORS}
            />
            <div
                data-testid="orders-placed-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    value={innerValue}
                    type="number"
                    min={0}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
