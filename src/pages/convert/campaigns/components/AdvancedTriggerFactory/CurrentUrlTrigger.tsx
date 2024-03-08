import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import {convertTriggerOperatorsToSelectOptions} from '../../utils/convertTriggerOperatorsToSelectOptions'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CurrentUrlTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (value: string) => {
        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            ...trigger,
            value: innerValue,
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button intent="secondary" className="btn-frozen">
                    Current URL
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <div
                data-testid="current-url-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    value={innerValue}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
