import React from 'react'

import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import {TRIGGERS_CONFIG} from 'pages/convert/campaigns/constants/triggers'
import {DEVICE_TYPE_VALUES} from 'pages/convert/campaigns/constants/triggerValueLabels'
import {CampaignTrigger} from 'pages/convert/campaigns/types/CampaignTrigger'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import useIsCampaignProritizationEnabled from 'pages/convert/common/hooks/useIsCampaignProritizationEnabled'

import css from './CampaignDeviceType.less'

type Props = {
    trigger?: CampaignTrigger
    onChange: (value: string) => void
}

export const CampaignDeviceType = ({trigger, onChange}: Props): JSX.Element => {
    const defaultValue =
        TRIGGERS_CONFIG[CampaignTriggerType.DeviceType].defaults.value

    const isCampaignProritizationEnabled = useIsCampaignProritizationEnabled()

    const onSelectChange = (value: any) => {
        onChange(value as string)
    }

    if (isCampaignProritizationEnabled) {
        return (
            <>
                <h5 className={css.title}>Device type</h5>
                <div className={css.select}>
                    <SelectField
                        value={trigger?.value ?? defaultValue}
                        options={DEVICE_TYPE_VALUES}
                        onChange={onSelectChange}
                        fullWidth={false}
                        fixedWidth={true}
                    />
                </div>
            </>
        )
    }

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
