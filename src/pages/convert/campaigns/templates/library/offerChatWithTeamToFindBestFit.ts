//Offer a chat with your team to find the best fit

import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {WizardConfiguration} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import {CampaignConfiguration, CampaignTemplate} from '../types'
import {CampaignConfigurationBuilder} from '../constructor'

export const OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT: CampaignTemplate = {
    slug: 'offer-chat-with-team-to-find-best-fit',
    name: 'Drive conversations with your visitors to find the right product',
    description:
        'Remove purchase objections from visitors who are hesitating more than 15 seconds on a product page',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/offer-chat-with-team-to-find-best-fit.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CurrentUrl,
                operator: CampaignTriggerOperator.Contains,
                value: 'products',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT,
            {
                name: OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT.name,
                template_id: OFFER_CHAT_WITH_TEAM_TO_FIND_BEST_FIT.slug,
                message_html:
                    '<div>🔍 I can help you<strong> find the best fit for you</strong>! What are you looking for?</div>',
                message_text:
                    '🔍 I can help you find the best fit for you! What are you looking for?',

                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
            }
        )

        return Promise.resolve(builder.build())
    },
}
