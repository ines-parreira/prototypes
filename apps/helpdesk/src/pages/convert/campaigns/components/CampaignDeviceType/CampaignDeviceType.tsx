import SelectField from 'pages/common/forms/SelectField/SelectField'
import { TRIGGERS_CONFIG } from 'pages/convert/campaigns/constants/triggers'
import { DEVICE_TYPE_VALUES } from 'pages/convert/campaigns/constants/triggerValueLabels'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import css from './CampaignDeviceType.less'

type Props = {
    trigger?: CampaignTrigger
    onChange: (value: string) => void
}

export const CampaignDeviceType = ({
    trigger,
    onChange,
}: Props): JSX.Element => {
    const defaultValue =
        TRIGGERS_CONFIG[CampaignTriggerType.DeviceType].defaults.value

    const onSelectChange = (value: any) => {
        onChange(value as string)
    }

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
