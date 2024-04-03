// Link to a valuable resource outside of business hours

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

export const LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS: CampaignTemplate = {
    slug: 'link-valuable-resource-to-help-visitors',
    name: 'Link valuable resources to help visitors while your team is offline',
    description: 'Guide your shoppers, even outside of your business hours',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/link-valuable-resource-to-help-visitors.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Before activating the campaign, <strong>add the URL of a relevant resource</strong> in your message.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Link]: {
                    tooltipContent: 'Add links',
                },
            },
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Outside,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.SessionTime,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS,
            {
                name: LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS.name,
                template_id: LINK_VALUABLE_RESOURCES_TO_HELP_VISITORS.slug,
                message_html:
                    '<div>Need help with <strong>last-minute purchase</strong>? Leave us a message or check out our guide on <strong>custom express orders</strong> 🚚</div><div><br></div><div>We&#x27;ll be back at <strong>9AM tomorrow</strong> for you. </div>',
                message_text:
                    "Need help with last-minute purchase? Leave us a message or check out our guide on custom express orders 🚚\n\nWe'll be back at 9AM tomorrow for you. ",
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
            }
        )

        return Promise.resolve(builder.build())
    },
}
