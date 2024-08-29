import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {
    CampaignConfiguration,
    CampaignTemplate,
} from 'pages/convert/campaigns/templates/types'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignConfigurationBuilder} from 'pages/convert/campaigns/templates/constructor'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'

export const CSM_TARGET_KNOWN_RETURN_REASONS_ON_PRODUCT_OUTSIDE_BUSINESS_HOURS: CampaignTemplate =
    {
        slug: 'csm-target-known-return-reasons-on-product-outside-business-hours',
        name: '[Prevent Returns] Target known return reasons on product (PDP triggered) outside of business hours',
        onboarding: false,
        preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
        getConfiguration: (): Promise<CampaignConfiguration> => {
            const triggers = [
                {
                    id: ulid(),
                    type: CampaignTriggerType.BusinessHours,
                    operator: CampaignTriggerOperator.Eq,
                    value: 'outside',
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.CurrentUrl,
                    operator: CampaignTriggerOperator.Contains,
                    value: ['/specificproduct'],
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.TimeSpentOnPage,
                    operator: CampaignTriggerOperator.Gt,
                    value: 10,
                },
                {
                    id: ulid(),
                    type: CampaignTriggerType.VisitCount,
                    operator: CampaignTriggerOperator.Gt,
                    value: 2,
                },
            ]

            const builder = new CampaignConfigurationBuilder(
                CSM_TARGET_KNOWN_RETURN_REASONS_ON_PRODUCT_OUTSIDE_BUSINESS_HOURS,
                {
                    name: CSM_TARGET_KNOWN_RETURN_REASONS_ON_PRODUCT_OUTSIDE_BUSINESS_HOURS.name,
                    template_id:
                        CSM_TARGET_KNOWN_RETURN_REASONS_ON_PRODUCT_OUTSIDE_BUSINESS_HOURS.slug,
                    message_text: `Unsure on [insert return reason here- i.e. sizing mismatch]? 

Check out our [insert educational content here]`,
                    message_html: `<div>Unsure on [insert return reason here- i.e. sizing mismatch]? </div><div><br></div><div>Check out our [insert educational content here]</div>`,
                    status: CampaignStatus.Inactive,
                    triggers: triggers,
                    trigger_rule: createTriggerRule(triggers),
                    attachments: [],
                }
            )

            return Promise.resolve(builder.build())
        },
    }
