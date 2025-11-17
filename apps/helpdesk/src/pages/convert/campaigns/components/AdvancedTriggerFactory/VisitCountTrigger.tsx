import React, { useEffect, useState } from 'react'

import toInteger from 'lodash/toInteger'

import { LegacyButton as Button } from '@gorgias/axiom'

import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'

import type { AdvancedTriggerBaseProps } from '../../types/AdvancedTriggerBaseProps'
import type { CampaignTriggerOperator } from '../../types/enums/CampaignTriggerOperator.enum'
import { convertTriggerOperatorsToSelectOptions } from '../../utils/convertTriggerOperatorsToSelectOptions'
import { handleTriggerOperatorChange } from '../../utils/handleTriggerOperatorChange'
import { isTriggerValueNonNegative } from '../../utils/isTriggerValueNonNegative'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const VisitCountTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator,
    )
    const [innerValue, setInnerValue] = useState<number | undefined>(
        toInteger(trigger.value),
    )

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger,
        )

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
            ...trigger,
            value: toInteger(innerValue),
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator)
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
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <div style={{ display: 'flex', flexGrow: 1 }}>
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
