import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from './types'
import {CampaignConfigurationBuilder} from './constructor'

export const PRODUCT_CARD_SHOWCASE: CampaignTemplate = {
    slug: 'product-card-showcase',
    name: 'Showcase products to cross-sell',
    label: CampaignTemplateLabelType.IncreaseAOV,
    preview: assetsUrl('img/campaigns/preview/product-card.png'),
    getConfiguration: (): CampaignConfiguration => {
        const b = new CampaignConfigurationBuilder(PRODUCT_CARD_SHOWCASE, {
            name: 'test',
        } as CampaignConfiguration)

        return b.build()
    },
}
