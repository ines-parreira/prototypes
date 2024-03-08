import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import {BUSINESS_HOURS_VALUES} from '../../constants/triggerValueLabels'
import {TRIGGERS_CONFIG} from '../../constants/triggers'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'
import {isBusinessHoursValue} from '../../types/enums/CampaignTriggerBusinessHoursValues.enum'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const BusinessHoursTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const defaultValue =
        trigger.value ??
        TRIGGERS_CONFIG[CampaignTriggerType.BusinessHours].defaults.value
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
