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

export const CSM_HIGHLIGHT_PRODUCTS_FEATURED_IN_BLOG: CampaignTemplate = {
    slug: 'csm-highlight-products-featured-in-blog',
    name: '[Increase Conversion][Blog content] Highlight products featured in blog',
    onboarding: false,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 42,
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
                value: ['/blog'],
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            CSM_HIGHLIGHT_PRODUCTS_FEATURED_IN_BLOG,
            {
                name: CSM_HIGHLIGHT_PRODUCTS_FEATURED_IN_BLOG.name,
                template_id: CSM_HIGHLIGHT_PRODUCTS_FEATURED_IN_BLOG.slug,
                message_text: `Use product cards to highlight the specific products highlighted in or relevant to the blog post. 

Time spent is intentionally high to target folks who have a higher interest in the topic.`,
                message_html: `<div>Use product cards to highlight the specific products highlighted in or relevant to the blog post. </div><div><br></div><div>Time spent is intentionally high to target folks who have a higher interest in the topic.</div>`,
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                attachments: [],
            },
        )

        return Promise.resolve(builder.build())
    },
}
