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

export const CSM_DRIVE_LOYALTY_PROGRAM_SIGNUPS: CampaignTemplate = {
    slug: 'csm-drive-loyalty-program-signups',
    name: '[Target Return Customers] Drive Loyalty program signups',
    onboarding: false,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CustomerTags,
                operator: CampaignTriggerOperator.NotContains,
                value: 'vip',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.IncognitoVisitor,
                operator: CampaignTriggerOperator.Eq,
                value: 'false',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.AmountSpent,
                operator: CampaignTriggerOperator.Gt,
                value: '0',
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
            CSM_DRIVE_LOYALTY_PROGRAM_SIGNUPS,
            {
                name: CSM_DRIVE_LOYALTY_PROGRAM_SIGNUPS.name,
                template_id: CSM_DRIVE_LOYALTY_PROGRAM_SIGNUPS.slug,
                message_text: `Welcome back! Don't forget you can save up to 15% on your orders by becoming a loyalty member. 

Already a member? Sign in`,
                message_html: `<div>Welcome back! <strong>Don&#x27;t forget you can save up to 15%</strong> on your orders by becoming a <a href="http://test.com/?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=%5BTarget%20Return%20Customers%5D-%20Drive%20Loyalty%20program%20signups?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=%5BTarget%20Return%20Customers%5D-%20Drive%20Loyalty%20program%20signups" target="_blank">loyalty member</a>. </div><div><br></div><div>Already a member? <a href="http://test.com/" target="_blank">Sign in</a></div>`,
                meta: {delay: 5000},
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                attachments: [],
            }
        )

        return Promise.resolve(builder.build())
    },
}
