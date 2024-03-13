import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from './types'
import {CampaignConfigurationBuilder} from './constructor'

export const CART_ABANDONMENT: CampaignTemplate = {
    slug: 'offer-help-on-cart-abandonment',
    name: 'Offer help to save the high-value carts',
    label: CampaignTemplateLabelType.PreventCartAbandonment,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): CampaignConfiguration => {
        const b = new CampaignConfigurationBuilder(CART_ABANDONMENT, {
            name: 'test',
        } as CampaignConfiguration)

        return b.build()
    },
}
