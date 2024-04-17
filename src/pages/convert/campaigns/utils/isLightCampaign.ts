import {Map} from 'immutable'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {chatIsShopifyStore} from 'pages/convert/campaigns/utils/chatIsShopifyStore'

export const isLightCampaign = (
    campaign: Campaign,
    integration: Map<any, any>
) => {
    return campaign.is_light && chatIsShopifyStore(integration)
}
