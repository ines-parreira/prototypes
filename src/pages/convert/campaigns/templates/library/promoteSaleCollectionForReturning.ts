// Promote your sale collection, for returning visitors about to leave
import { ulid } from 'ulidx'

import {
    BannerType,
    TooltipActionType,
    WizardConfiguration,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { CampaignStepsKeys } from 'pages/convert/campaigns/types/CampaignSteps'
import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { CampaignTriggerBusinessHoursValuesEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTriggerRule } from 'pages/convert/campaigns/utils/createTriggerRule'
import { assetsUrl } from 'utils'

import { CampaignConfigurationBuilder } from '../constructor'
import { CampaignConfiguration, CampaignTemplate } from '../types'

export const PROMOTE_SALE_COLLECTION: CampaignTemplate = {
    slug: 'promote-sale-collection-for-visitors-about-to-leave',
    name: 'Promote your sale collection for visitors about to leave',
    description:
        'Keep the interest of your returning visitors by sharing your sale items before they exit',
    onboarding: false,
    preview: assetsUrl('img/campaigns/library/promote-sale-collection.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Before activating the campaign, <strong>add the correct URL link to your sale collection page</strong> in your message.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Link]: {
                    tooltipContent: 'Add sale collection link',
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
                operator: CampaignTriggerOperator.Gt,
                value: 3,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            PROMOTE_SALE_COLLECTION,
            {
                name: PROMOTE_SALE_COLLECTION.name,
                template_id: PROMOTE_SALE_COLLECTION.slug,
                message_html:
                    '<div>Before you go, check out our <strong>latest items on sale for up to 30% OFF!</strong>💸</div>',
                message_text:
                    'Before you go, check out our latest items on sale for up to 30% OFF!💸',
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                meta: {
                    noReply: true,
                },
            },
        )

        return Promise.resolve(builder.build())
    },
}
