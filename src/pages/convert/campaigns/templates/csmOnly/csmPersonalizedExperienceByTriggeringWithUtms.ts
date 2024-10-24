import {ulid} from 'ulidx'

import {CampaignConfigurationBuilder} from 'pages/convert/campaigns/templates/constructor'
import {
    CampaignConfiguration,
    CampaignTemplate,
} from 'pages/convert/campaigns/templates/types'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {assetsUrl} from 'utils'

export const CSM_PERSONALIZED_EXPERIENCE_BY_TRIGGERING_WITH_UTMS: CampaignTemplate =
    {
        slug: 'csm-personalized-experience-by-triggering-with-utms',
        name: '[Increase Conversion] Personalized experience by triggering with UTMs',
        onboarding: false,
        preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
        getConfiguration: (): Promise<CampaignConfiguration> => {
            const triggers = [
                {
                    id: ulid(),
                    type: CampaignTriggerType.VisitCount,
                    operator: CampaignTriggerOperator.Lt,
                    value: 2,
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.TimeSpentOnPage,
                    operator: CampaignTriggerOperator.Gt,
                    value: 11,
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
                    value: ['/UTM_from_social_ad'],
                },
            ]

            const builder = new CampaignConfigurationBuilder(
                CSM_PERSONALIZED_EXPERIENCE_BY_TRIGGERING_WITH_UTMS,
                {
                    name: CSM_PERSONALIZED_EXPERIENCE_BY_TRIGGERING_WITH_UTMS.name,
                    template_id:
                        CSM_PERSONALIZED_EXPERIENCE_BY_TRIGGERING_WITH_UTMS.slug,
                    message_text: `Here's the collection you just saw on Instagram.

You can get a special $15 off any product in the range `,
                    message_html: `<div><a href="http://collection.com/?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=%5BIncrease%20Conversion%5D%20Personalized%20experience%20by%20triggering%20with%20UTMs" target="_blank">Here&#x27;s the collection</a> you just saw on Instagram.</div><div><br></div><div>You can get a special $15 off any product in the range </div>`,
                    status: CampaignStatus.Inactive,
                    triggers: triggers,
                    trigger_rule: createTriggerRule(triggers),
                    attachments: [],
                }
            )

            return Promise.resolve(builder.build())
        },
    }
