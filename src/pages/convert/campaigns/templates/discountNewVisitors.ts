import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from './types'
import {CampaignConfigurationBuilder} from './constructor'

export const DISCOUNT_NEW_VISITORS: CampaignTemplate = {
    slug: 'discount-new-visitors',
    name: 'Give 10% off for new visitors about to leave',
    label: CampaignTemplateLabelType.IncreaseConversions,
    preview: assetsUrl('img/campaigns/preview/discount-new-visitors.png'),
    getConfiguration: (): CampaignConfiguration => {
        const b = new CampaignConfigurationBuilder(DISCOUNT_NEW_VISITORS, {
            name: 'test',
        } as CampaignConfiguration)

        return b.build()
    },
}
