import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    CurrentUrlOperators,
    isCurrentUrlOperators,
} from '../../types/enums/CurrentUrlOperators.enum'

import {CURRENT_URL_OPERATORS} from '../../constants/operators'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CurrentUrlTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CurrentUrlOperators>(
        trigger.operator as CurrentUrlOperators
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) => {
        if (isCurrentUrlOperators(operator.toString())) {
            setInnerOperator(operator as CurrentUrlOperators)
            onUpdateTrigger(id, {operator: operator as CurrentUrlOperators})
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
        setInnerOperator(trigger.operator as CurrentUrlOperators)
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
                options={CURRENT_URL_OPERATORS}
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
