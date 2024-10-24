import React from 'react'

import CampaignIncognitoVisitorsSwitch from 'pages/convert/campaigns/components/CampaignIncognitoVisitorsSwitch'
import {CampaignWithNoReply} from 'pages/convert/campaigns/components/CampaignWithNoReply'
import {CampaignTriggerMap} from 'pages/convert/campaigns/types/CampaignTriggerMap'

import css from './CampaignPreferences.less'

type Props = {
    isNoReply: boolean
    triggers: CampaignTriggerMap
    onChangeNoReply: (value: boolean) => void
    onChangeIncognitoVisitor: (
        triggerId: string,
        value: boolean | undefined
    ) => void
}

export const CampaignPreferences = ({
    isNoReply,
    triggers,
    onChangeNoReply,
    onChangeIncognitoVisitor,
}: Props) => {
    return (
        <>
            <div className={css.items}>
                <CampaignWithNoReply
                    value={isNoReply}
                    onChange={onChangeNoReply}
                />
                <CampaignIncognitoVisitorsSwitch
                    triggers={triggers}
                    onChange={onChangeIncognitoVisitor}
                />
            </div>
        </>
    )
}
