import { ulid } from 'ulidx'

import { CampaignConfigurationBuilder } from 'pages/convert/campaigns/templates/constructor'
import {
    CampaignConfiguration,
    CampaignTemplate,
} from 'pages/convert/campaigns/templates/types'
import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTriggerRule } from 'pages/convert/campaigns/utils/createTriggerRule'
import { assetsUrl } from 'utils'

export const CSM_CROSS_SELL_COMPLIMENTARY_ITEM: CampaignTemplate = {
    slug: 'csm-cross-sell-complimentary-item',
    name: '[Increase AOV] Cross Sell complimentary item',
    onboarding: false,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.ProductTags,
                operator: CampaignTriggerOperator.NotContains,
                value: 'complimentary product',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.ProductTags,
                operator: CampaignTriggerOperator.ContainsAll,
                value: 'product',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: 'anytime',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CurrentUrl,
                operator: CampaignTriggerOperator.Contains,
                value: '/',
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            CSM_CROSS_SELL_COMPLIMENTARY_ITEM,
            {
                name: CSM_CROSS_SELL_COMPLIMENTARY_ITEM.name,
                template_id: CSM_CROSS_SELL_COMPLIMENTARY_ITEM.slug,
                message_text: `Great choice! One of our favorites to go with: Complimentary product`,
                message_html: `<div><strong>Great choice!</strong> One of our favorites to go with: Complimentary product</div>`,
                meta: { delay: 5000 },
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                attachments: [],
            },
        )

        return Promise.resolve(builder.build())
    },
}
