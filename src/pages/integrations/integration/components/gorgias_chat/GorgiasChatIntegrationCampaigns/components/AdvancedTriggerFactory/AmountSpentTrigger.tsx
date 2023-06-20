import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'

import {AMOUNT_SPENT_OPERATORS} from '../../constants/operators'

import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    AmountSpentOperators,
    isAmountSpentOperators,
} from '../../types/enums/AmountSpentOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const AmountSpentTrigger = ({
    id,
    isAllowedToEdit = false,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<AmountSpentOperators>(
        trigger.operator as AmountSpentOperators
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )
    const {shopifyIntegration} = useIntegrationContext()

    const handleChangeOperator = (operator: Value) => {
        if (isAmountSpentOperators(operator.toString())) {
            setInnerOperator(operator as AmountSpentOperators)
            onUpdateTrigger(id, {operator: operator as AmountSpentOperators})
        }
    }

    const handleChangeValue = (value: string) => {
        if (!isAllowedToEdit) return

        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            value: innerValue,
        })
    }

    const currencySymbol = getShopifyMoneySymbol(
        shopifyIntegration?.meta?.currency ?? 'USD',
        true
    )

    useEffect(() => {
        setInnerOperator(trigger.operator as AmountSpentOperators)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Total spent"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Total spent
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={AMOUNT_SPENT_OPERATORS}
            />
            <div
                data-testid="total-spent-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    prefix={currencySymbol}
                    value={innerValue}
                    type="number"
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
