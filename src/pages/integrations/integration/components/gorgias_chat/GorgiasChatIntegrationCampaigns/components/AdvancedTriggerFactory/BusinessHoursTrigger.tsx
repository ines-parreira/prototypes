import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    BusinessHoursOperators,
    isBusinessHoursOperator,
} from '../../types/enums/BusinessHoursOperators.enum'

import {BUSINESS_HOURS_OPERATORS} from '../../constants/operators'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const BusinessHoursTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<BusinessHoursOperators>(
        trigger.operator as BusinessHoursOperators
    )

    const handleChangeOperator = (operator: Value) => {
        if (isBusinessHoursOperator(operator.toString())) {
            setInnerOperator(operator as BusinessHoursOperators)
            onUpdateTrigger(id, {operator: operator as BusinessHoursOperators})
        }
    }

    useEffect(() => {
        if (trigger.operator) {
            setInnerOperator(trigger.operator as BusinessHoursOperators)
        }
    }, [trigger.operator])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Business hours"
                    className="btn-frozen"
                >
                    Business Hours
                </Button>
            </div>
            <div className={css.fixedOperator}>is equal to</div>
            <SelectField
                className={css.fullWidth}
                value={innerOperator}
                onChange={handleChangeOperator}
                options={BUSINESS_HOURS_OPERATORS}
            />
        </>
    )
}
