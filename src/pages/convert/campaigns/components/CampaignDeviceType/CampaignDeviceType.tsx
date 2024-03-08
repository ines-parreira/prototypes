import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import {CampaignTrigger} from '../../types/CampaignTrigger'
import {DEVICE_TYPE_VALUES} from '../../constants/triggerValueLabels'
import {TRIGGERS_CONFIG} from '../../constants/triggers'
import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'

type Props = {
    trigger?: CampaignTrigger
    onChange: (value: string) => void
}

export const CampaignDeviceType = ({trigger, onChange}: Props): JSX.Element => {
    const defaultValue =
        TRIGGERS_CONFIG[CampaignTriggerType.DeviceType].defaults.value

    return (
        <>
            <h5>Device type</h5>
            <RadioFieldSet
                selectedValue={trigger?.value ?? defaultValue}
                options={DEVICE_TYPE_VALUES}
                onChange={onChange}
            />
        </>
    )
}
