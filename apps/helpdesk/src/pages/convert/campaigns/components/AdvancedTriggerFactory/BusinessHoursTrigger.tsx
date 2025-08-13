import React, { useState } from 'react'

import { Button } from '@gorgias/axiom'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import {
    CampaignTriggerBusinessHoursValuesEnum,
    isBusinessHoursValue,
} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'

import { TRIGGERS_CONFIG } from '../../constants/triggers'
import { BUSINESS_HOURS_VALUES } from '../../constants/triggerValueLabels'
import { AdvancedTriggerBaseProps } from '../../types/AdvancedTriggerBaseProps'
import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const BusinessHoursTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const defaultValue: CampaignTriggerBusinessHoursValuesEnum = trigger.value
        ? trigger.value.toString()
        : TRIGGERS_CONFIG[CampaignTriggerType.BusinessHours].defaults.value

    const [innerValue, setInnerValue] = useState<Value>(defaultValue)

    const handleChangeValue = (value: Value) => {
        if (isBusinessHoursValue(value.toString())) {
            setInnerValue(value)
            onUpdateTrigger(id, {
                ...trigger,
                value: value,
            })
        }
    }

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
                value={innerValue}
                onChange={handleChangeValue}
                options={BUSINESS_HOURS_VALUES}
            />
        </>
    )
}
