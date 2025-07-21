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

export const CSM_PRESALE_LANDING_PAGE: CampaignTemplate = {
    slug: 'csm-presale-landing-page',
    name: '[Capture and manage leads] Presale landing page',
    onboarding: false,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: 'anytime',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.VisitCount,
                operator: CampaignTriggerOperator.Gt,
                value: 2,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CurrentUrl,
                operator: CampaignTriggerOperator.Contains,
                value: ['/presale'],
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            CSM_PRESALE_LANDING_PAGE,
            {
                name: CSM_PRESALE_LANDING_PAGE.name,
                template_id: CSM_PRESALE_LANDING_PAGE.slug,
                message_text: `Want to be the first to get your hands on the drop? 

Comment "Me first" below and we'll send you an early access code a week before the launch.

link to rules for subsequent automation:
1. Capture Lead
2. AI Agent Followup`,
                message_html: `<div><strong>Want to be the first to get your hands on the drop? </strong></div><div><br></div><div>Comment &quot;Me first&quot; below and we&#x27;ll send you an early access code a week before the launch.</div><div><br></div><div>link to rules for subsequent automation:</div><div><a href="https://automationnation.gorgias.com/app/settings/rules/104113?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=%5BCapture%20and%20manage%20leads%5D-%20Presale%20landing%20page" target="_blank">1. Capture Lead</a></div><div><a href="https://automationnation.gorgias.com/app/settings/rules/104183?utm_source=Gorgias&utm_medium=ChatCampaign&utm_campaign=%5BCapture%20and%20manage%20leads%5D-%20Presale%20landing%20page" target="_blank">2. AI Agent Followup</a></div>`,
                meta: { delay: 0 },
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                attachments: [],
            },
        )

        return Promise.resolve(builder.build())
    },
}
