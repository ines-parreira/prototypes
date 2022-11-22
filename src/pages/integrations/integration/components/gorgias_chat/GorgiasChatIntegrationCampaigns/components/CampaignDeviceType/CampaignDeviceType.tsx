import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import {DEVICE_TYPE_OPERATORS} from '../../constants/operators'
import {CampaignTrigger} from '../../types/CampaignTrigger'

type Props = {
    trigger?: CampaignTrigger
    onChange: (value: string) => void
}

export const CampaignDeviceType = ({trigger, onChange}: Props): JSX.Element => {
    const defaultValue = DEVICE_TYPE_OPERATORS[0].value

    return (
        <>
            <h5>Device type</h5>
            <RadioFieldSet
                selectedValue={trigger?.operator ?? defaultValue}
                options={DEVICE_TYPE_OPERATORS}
                onChange={onChange}
            />
        </>
    )
}
