import React, {useMemo} from 'react'

import {CampaignCollisionForm} from '../../components/CampaignCollisionForm'

import {CampaignTriggerMap} from '../../types/CampaignTriggerMap'
import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {CampaignDelay} from '../CampaignDelay'
import {CampaignDeviceType} from '../CampaignDeviceType'
import {WithRevenuePaywall} from '../WithRevenuePaywall'

import css from './CampaignDisplaySettings.less'

type Props = {
    isRevenueBetaTester?: boolean
    delay?: number
    triggers: CampaignTriggerMap
    onChangeCollision: (triggerId: string, value: boolean) => void
    onChangeDelay: (value: number) => void
    onChangeDeviceType: (triggerId: string, value: string) => void
}

function getTriggerIdByKey(
    triggers: CampaignTriggerMap,
    key: CampaignTriggerKey
): string {
    return (
        Object.entries(triggers).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([id, trigger]) => trigger.key === key
        )?.[0] || ''
    )
}

export const CampaignDisplaySettings = ({
    isRevenueBetaTester,
    delay,
    triggers,
    onChangeCollision,
    onChangeDelay,
    onChangeDeviceType,
}: Props): JSX.Element => {
    const deviceTypeId = getTriggerIdByKey(
        triggers,
        CampaignTriggerKey.DeviceType
    )
    const singleInViewId = getTriggerIdByKey(
        triggers,
        CampaignTriggerKey.SingleInView
    )
    const shouldRenderSettings =
        isRevenueBetaTester || singleInViewId || deviceTypeId || delay

    const deviceTypeTrigger = useMemo(() => {
        return triggers[deviceTypeId] ?? null
    }, [deviceTypeId, triggers])

    const handleChangeDeviceType = (value: string) =>
        onChangeDeviceType(deviceTypeId, value)

    if (!shouldRenderSettings) {
        return <></>
    }

    return (
        <WithRevenuePaywall showPaywall={!isRevenueBetaTester}>
            <h3 style={{marginTop: 32}}>Display</h3>
            <div className={css.settingsContainer}>
                <div className="mb-4">
                    <CampaignDelay
                        delay={delay}
                        onChangeDelay={onChangeDelay}
                    />
                </div>
                <div className="mb-4">
                    <CampaignDeviceType
                        trigger={deviceTypeTrigger}
                        onChange={handleChangeDeviceType}
                    />
                </div>
                <div className="mb-4">
                    <CampaignCollisionForm
                        triggers={triggers}
                        onChange={onChangeCollision}
                    />
                </div>
            </div>
        </WithRevenuePaywall>
    )
}
