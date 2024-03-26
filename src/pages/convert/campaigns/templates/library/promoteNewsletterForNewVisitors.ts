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
                        type: BannerType.Info,
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

        const b = new CampaignConfigurationBuilder(
            PROMOTE_NEWSLETTER_FOR_NEW_VISITORS,
            {
                name: PROMOTE_NEWSLETTER_FOR_NEW_VISITORS.name,
                template_id: PROMOTE_NEWSLETTER_FOR_NEW_VISITORS.slug,
                message_text: `🌟 Save $25 OFF your order over $75 when you join our email list or sign up for SMS alerts!\n\n(if you haven't already) 😉`,
                message_html: `<div>🌟 Save <strong>$25 OFF</strong> your order over <strong>$75</strong> when you <strong><a href=\"\" target=\"_blank\">join our email list</a></strong> or <strong><a href=\"\" target=\"_blank\">sign up for SMS alerts</a></strong>!</div><div><br></div><div>(if you haven&#x27;t already) 😉</div>`,
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                meta: {
                    noReply: true,
                },
            }
        )

        return Promise.resolve(b.build())
    },
}
