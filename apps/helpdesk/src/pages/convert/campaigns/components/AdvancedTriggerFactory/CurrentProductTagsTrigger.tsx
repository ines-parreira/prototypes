import React, { useEffect, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import InputField from 'pages/common/forms/input/InputField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'

import type { AdvancedTriggerBaseProps } from '../../types/AdvancedTriggerBaseProps'
import type { CampaignTriggerOperator } from '../../types/enums/CampaignTriggerOperator.enum'
import { convertTriggerOperatorsToSelectOptions } from '../../utils/convertTriggerOperatorsToSelectOptions'
import { handleTriggerOperatorChange } from '../../utils/handleTriggerOperatorChange'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CurrentProductTagsTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator,
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string,
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
                <Button
                    role="button"
                    aria-label="Currently visited product"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Currently visited product
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
                    suffix="tags"
                    caption="Separate tags with commas (Ex: backpack, shoes)"
                    value={innerValue}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
