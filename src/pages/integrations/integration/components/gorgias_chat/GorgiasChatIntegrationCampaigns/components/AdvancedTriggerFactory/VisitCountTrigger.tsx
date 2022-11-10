import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {VISIT_COUNT_OPERATORS} from '../../constants/operators'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    VisitCountOperators,
    isVisitCountOperators,
} from '../../types/enums/VisitCountOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const VisitCountTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<VisitCountOperators>(
        trigger.operator as VisitCountOperators
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) => {
        if (isVisitCountOperators(operator.toString())) {
            setInnerOperator(operator as VisitCountOperators)
            onUpdateTrigger(id, {operator: operator as VisitCountOperators})
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
        setInnerOperator(trigger.operator as VisitCountOperators)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Number of visits"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Number Of Visits
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={VISIT_COUNT_OPERATORS}
            />
            <div
                data-testid="visit-count-value"
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
