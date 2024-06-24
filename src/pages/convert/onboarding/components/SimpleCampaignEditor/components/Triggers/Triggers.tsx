import React from 'react'

import {TRIGGERS_CONFIG} from 'pages/convert/campaigns/constants/triggers'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerDeviceTypeValueEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerDeviceTypeValue.enum'
import {CampaignTrigger} from 'pages/convert/campaigns/types/CampaignTrigger'

import css from './Triggers.less'

type Props = {
    triggers?: CampaignTrigger[]
    campaignMeta?: Record<string, any>
}

const getTriggerLabel = (trigger: CampaignTrigger): string => {
    if (trigger.type === CampaignTriggerType.DeviceType) {
        return getDesktopTriggerLabel(trigger)
    }

    return TRIGGERS_CONFIG[trigger.type].label
}

const getDesktopTriggerLabel = (trigger: CampaignTrigger): string => {
    switch (trigger.value) {
        case CampaignTriggerDeviceTypeValueEnum.Desktop:
            return 'Desktop only'
        case CampaignTriggerDeviceTypeValueEnum.Mobile:
            return 'Mobile only'
        default:
            return 'Desktop and mobile'
    }
}

const Triggers: React.FC<Props> = ({triggers, campaignMeta}) => {
    return (
        <ul className={css.triggersList}>
            {triggers &&
                triggers.map((trigger) => {
                    return (
                        <li key={trigger.id} className={css.triggerItem}>
                            {getTriggerLabel(trigger)}
                        </li>
                    )
                })}
            {Boolean(campaignMeta?.noReply) && (
                <li className={css.triggerItem}>
                    Customers cannot reply to campaign
                </li>
            )}
        </ul>
    )
}

export default Triggers
