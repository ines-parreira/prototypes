import { Map } from 'immutable'

import Badge from 'gorgias-design-system/Badge/Badge'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import { chatIsShopifyStore } from 'pages/convert/campaigns/utils/chatIsShopifyStore'

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
    const isShopifyStore = chatIsShopifyStore(integration)

    if (!campaign.is_light || !isShopifyStore) {
        return null
    }

    return <Badge label={'light'} color="accessoryBlue" className={className} />
}

export default LightCampaignBadge
