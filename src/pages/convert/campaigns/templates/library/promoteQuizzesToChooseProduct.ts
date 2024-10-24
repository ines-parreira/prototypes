// Promote quizzes that help customers choose their first purchase

import {ulid} from 'ulidx'

import {
    WizardConfiguration,
    BannerType,
    TooltipActionType,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {assetsUrl} from 'utils'

import {CampaignConfigurationBuilder} from '../constructor'
import {CampaignConfiguration, CampaignTemplate} from '../types'

export const PROMOTE_QUIZZES_TO_HELP_VISIOTOR: CampaignTemplate = {
    slug: 'promote-quizzes-to-help-choose-products',
    name: 'Promote educational content that help visitors choose their products',
    description:
        'Direct your new visitors to your quiz or gift finder, to help them in their first purchase',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/promote-quizzes-to-help-choose-products.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Before activating the campaign, <strong>add the correct URL link to your quizz</strong> in your message.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Link]: {
                    tooltipContent: 'Add quizz link',
                },
            },
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.VisitCount,
                operator: CampaignTriggerOperator.Lt,
                value: 4,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            PROMOTE_QUIZZES_TO_HELP_VISIOTOR,
            {
                name: PROMOTE_QUIZZES_TO_HELP_VISIOTOR.name,
                template_id: PROMOTE_QUIZZES_TO_HELP_VISIOTOR.slug,
                message_html:
                    '<div>💡 Not sure which style to choose?</div><div><br></div><div><strong>Take our quiz</strong> or chat with our leather artisans now! 👇</div>',
                message_text:
                    '💡 Not sure which style to choose?\n\nTake our quiz or chat with our leather artisans now! 👇',

                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
            }
        )

        return Promise.resolve(builder.build())
    },
}
