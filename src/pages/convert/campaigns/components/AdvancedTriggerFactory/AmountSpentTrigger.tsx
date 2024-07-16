import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'
import {getMoneySymbol} from 'utils/getMoneySymbol'

import {convertTriggerOperatorsToSelectOptions} from 'pages/convert/campaigns/utils/convertTriggerOperatorsToSelectOptions'
import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import {isTriggerValueNonNegative} from '../../utils/isTriggerValueNonNegative'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const AmountSpentTrigger = ({
    id,
    isAllowedToEdit = false,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )
    const {shopifyIntegration} = useIntegrationContext()

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (value: string) => {
        if (!isAllowedToEdit) return
        if (value !== '' && !isTriggerValueNonNegative(value)) return

        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            ...trigger,
            value: innerValue,
        })
    }

    const currencySymbol = getMoneySymbol(
        shopifyIntegration?.meta?.currency ?? 'USD',
        true
    )

    useEffect(() => {
        setInnerOperator(trigger.operator)
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
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
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
                    min={0}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
