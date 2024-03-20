// Promote newsletter or SMS sign-up page for new visitors about to leave

import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from '../types'
import {CampaignConfigurationBuilder} from '../constructor'

export const PROMOTE_NEWSLETTER_FOR_NEW_VISITORS: CampaignTemplate = {
    slug: 'promote-newsletter-for-new-visitors',
    name: 'Promote newsletter sign-up for new visitors about to leave',
    description:
        'Increase first-time purchases by reminding your specific offers for new shoppers',
    onboarding: false,
    label: CampaignTemplateLabelType.PreventCartAbandonment,
    preview: assetsUrl('img/campaigns/library/promote-newsletter.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const b = new CampaignConfigurationBuilder(
            PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
            {
                name: 'test',
            } as CampaignConfiguration
        )

        return Promise.resolve(b.build())
    },
}
