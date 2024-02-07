import React, {useEffect, useState} from 'react'

import toInteger from 'lodash/toInteger'
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

import {isTriggerValueNonNegative} from '../../utils/isTriggerValueNonNegative'
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
    const [innerValue, setInnerValue] = useState<number | undefined>(
        toInteger(trigger.value)
    )

    const handleChangeOperator = (operator: Value) => {
        if (isVisitCountOperators(operator.toString())) {
            setInnerOperator(operator as VisitCountOperators)
            onUpdateTrigger(id, {operator: operator as VisitCountOperators})
        }
    }

    const handleChangeValue = (value: string) => {
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
        setInnerOperator(trigger.operator as VisitCountOperators)
        setInnerValue(toInteger(trigger.value))
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
                    type="number"
                    min={0}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
