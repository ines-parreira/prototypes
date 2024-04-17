import React from 'react'
import {Map} from 'immutable'
import Badge from 'gorgias-design-system/Badge/Badge'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {useAreConvertLightCampaignsEnabled} from 'pages/convert/common/hooks/useAreConvertLightCampaignsEnabled'
import {isLightCampaign} from 'pages/convert/campaigns/utils/isLightCampaign'

export interface LightCampaignBadgeProps
    extends React.HTMLAttributes<HTMLElement> {
    campaign: Campaign
    integration: Map<any, any>
}

const LightCampaignBadge = ({
    campaign,
    integration,
    className,
}: LightCampaignBadgeProps) => {
    const areLightCampaignsEnabled = useAreConvertLightCampaignsEnabled()

    if (!areLightCampaignsEnabled || !isLightCampaign(campaign, integration)) {
        return null
    }

    return <Badge label={'light'} color="accessoryGrey" className={className} />
}

export default LightCampaignBadge
