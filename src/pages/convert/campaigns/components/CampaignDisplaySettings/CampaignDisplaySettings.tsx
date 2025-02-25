import React, { useMemo } from 'react'

import { CampaignDelay } from 'pages/convert/campaigns/components/CampaignDelay'
import { CampaignDeviceType } from 'pages/convert/campaigns/components/CampaignDeviceType'
import { CampaignPreferences } from 'pages/convert/campaigns/components/CampaignPreferences/CampaignPreferences'
import { WithRevenuePaywall } from 'pages/convert/campaigns/components/WithRevenuePaywall'
import { CampaignTriggerMap } from 'pages/convert/campaigns/types/CampaignTriggerMap'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import useIsCampaignProritizationEnabled from 'pages/convert/common/hooks/useIsCampaignProritizationEnabled'

import css from './CampaignDisplaySettings.less'

type Props = {
    isConvertSubscriber?: boolean
    delay?: number
    isNoReply: boolean
    triggers: CampaignTriggerMap
    onChangeDelay: (value: number) => void
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
    onChangeDelay,
    onChangeDeviceType,
    onChangeIncognitoVisitor,
}: Props): JSX.Element => {
    const deviceTypeId = getTriggerIdByKey(
        triggers,
        CampaignTriggerType.DeviceType,
    )

    const shouldRenderSettings = isConvertSubscriber || deviceTypeId || delay
    const isCampaignProritizationEnabled = useIsCampaignProritizationEnabled()
    const deviceTypeTrigger = useMemo(() => {
        return triggers[deviceTypeId] ?? null
    }, [deviceTypeId, triggers])

    const handleChangeDeviceType = (value: string) =>
        onChangeDeviceType(deviceTypeId, value)

    if (!shouldRenderSettings) {
        return <></>
    }

    if (isCampaignProritizationEnabled) {
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

    return (
        <WithRevenuePaywall showPaywall={!isConvertSubscriber}>
            <h3 style={{ marginTop: 32 }}>Display</h3>
            <div className={css.settingsContainer}>
                <div className={css.sectionItem}>
                    <CampaignDelay
                        delay={delay}
                        onChangeDelay={onChangeDelay}
                    />
                </div>
                <div className={css.sectionItem}>
                    <CampaignDeviceType
                        trigger={deviceTypeTrigger}
                        onChange={handleChangeDeviceType}
                    />
                </div>
                <div className={css.sectionItem}>
                    <h5>Campaign preferences</h5>
                    <CampaignPreferences
                        triggers={triggers}
                        isNoReply={isNoReply}
                        onChangeNoReply={onChangeNoReply}
                        onChangeIncognitoVisitor={onChangeIncognitoVisitor}
                    />
                </div>
            </div>
        </WithRevenuePaywall>
    )
}
