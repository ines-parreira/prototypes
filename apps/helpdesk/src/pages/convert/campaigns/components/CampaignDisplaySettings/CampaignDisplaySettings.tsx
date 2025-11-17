import React, { useMemo } from 'react'

import { CampaignDeviceType } from 'pages/convert/campaigns/components/CampaignDeviceType'
import { CampaignPreferences } from 'pages/convert/campaigns/components/CampaignPreferences/CampaignPreferences'
import { WithRevenuePaywall } from 'pages/convert/campaigns/components/WithRevenuePaywall'
import type { CampaignTriggerMap } from 'pages/convert/campaigns/types/CampaignTriggerMap'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'

import css from './CampaignDisplaySettings.less'

type Props = {
    isConvertSubscriber?: boolean
    delay?: number
    isNoReply: boolean
    triggers: CampaignTriggerMap
    onChangeDeviceType: (triggerId: string, value: string) => void
    onChangeNoReply: (value: boolean) => void
    onChangeIncognitoVisitor: (
        triggerId: string,
        value: boolean | undefined,
    ) => void
}

function getTriggerIdByKey(
    triggers: CampaignTriggerMap,
    key: CampaignTriggerType,
): string {
    return (
        Object.entries(triggers).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([id, trigger]) => trigger.type === key,
        )?.[0] || ''
    )
}

export const CampaignDisplaySettings = ({
    isConvertSubscriber,
    delay,
    isNoReply,
    triggers,
    onChangeNoReply,
    onChangeDeviceType,
    onChangeIncognitoVisitor,
}: Props): JSX.Element => {
    const deviceTypeId = getTriggerIdByKey(
        triggers,
        CampaignTriggerType.DeviceType,
    )

    const shouldRenderSettings = isConvertSubscriber || deviceTypeId || delay
    const deviceTypeTrigger = useMemo(() => {
        return triggers[deviceTypeId] ?? null
    }, [deviceTypeId, triggers])

    const handleChangeDeviceType = (value: string) =>
        onChangeDeviceType(deviceTypeId, value)

    if (!shouldRenderSettings) {
        return <></>
    }

    return (
        <WithRevenuePaywall showPaywall={!isConvertSubscriber}>
            <div className={css.settingsContainer}>
                <div className={css.sectionItem}>
                    <CampaignPreferences
                        triggers={triggers}
                        isNoReply={isNoReply}
                        onChangeNoReply={onChangeNoReply}
                        onChangeIncognitoVisitor={onChangeIncognitoVisitor}
                    />
                </div>
                <div className={css.sectionItem}>
                    <CampaignDeviceType
                        trigger={deviceTypeTrigger}
                        onChange={handleChangeDeviceType}
                    />
                </div>
            </div>
        </WithRevenuePaywall>
    )
}
