import React, {useEffect, useState} from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'
import InputField from 'pages/common/forms/input/InputField'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

function ensureNumberType(value: any): number {
    return value * 1
}

export const SessionTimeTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerValue, setInnerValue] = useState<number>(
        ensureNumberType(trigger.value)
    )
    const handleChangeValue = (value: string) => {
        setInnerValue(ensureNumberType(value))
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            value: innerValue,
        })
    }

    useEffect(() => {
        ensureNumberType(trigger.value)
    }, [trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Time Spent Per Visit"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Time Spent Per Visit
                </Button>
            </div>
            <div className={css.fixedOperator}>is greater than</div>
            <InputField
                className={classnames([
                    css.fullWidth,
                    css.timeSpentOnPageInput,
                ])}
                aria-label="Time Spent Per Visit seconds"
                suffix="seconds"
                value={innerValue}
                onChange={handleChangeValue}
                onBlur={handleBlurValue}
            />
        </>
    )
}
