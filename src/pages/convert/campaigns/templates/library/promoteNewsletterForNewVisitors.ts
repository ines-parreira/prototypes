// Promote newsletter or SMS sign-up page for new visitors about to leave

import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {
    WizardConfiguration,
    BannerType,
    TooltipActionType,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import {CampaignConfiguration, CampaignTemplate} from '../types'
import {CampaignConfigurationBuilder} from '../constructor'

export const PROMOTE_NEWSLETTER_FOR_NEW_VISITORS: CampaignTemplate = {
    slug: 'promote-newsletter-for-new-visitors',
    name: 'Promote newsletter sign-up for new visitors about to leave',
    description:
        'Increase first-time purchases by reminding your specific offers for new shoppers',
    onboarding: false,
    preview: assetsUrl('img/campaigns/library/promote-newsletter.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Before activating the campaign, <strong>add the correct URL links to your newsletter/SMS sign-up pages</strong> in your message.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Link]: {
                    tooltipContent: 'Add sign-up links',
                },
            },
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.SessionTime,
                operator: CampaignTriggerOperator.Gt,
                value: 10,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 5,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.ExitIntent,
                operator: CampaignTriggerOperator.Eq,
                value: 'true',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.VisitCount,
                operator: CampaignTriggerOperator.Lt,
                value: 4,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
            {
                name: PROMOTE_NEWSLETTER_FOR_NEW_VISITORS.name,
                template_id: PROMOTE_NEWSLETTER_FOR_NEW_VISITORS.slug,
                message_text: `🌟 Save 10% OFF your order when you subscribe to our newsletter or our SMS alerts!`,
                message_html: `<div>🌟 Save <strong>10% OFF</strong> your order when you <strong>subscribe to our newsletter</strong> or <strong>our SMS alerts!</strong></div><div><br></div>`,
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                meta: {
                    noReply: true,
                },
            }
        )

        return Promise.resolve(builder.build())
    },
}
