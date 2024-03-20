// Promote your sale collection, for returning visitors about to leave

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
                            'Before activating the campaign, add the correct URL link to your sale collection page in your campaign message.',
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
                value: true,
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

        const b = new CampaignConfigurationBuilder(PROMOTE_SALE_COLLECTION, {
            name: PROMOTE_SALE_COLLECTION.name,
            template_id: PROMOTE_SALE_COLLECTION.slug,
            message_html:
                '<div>Before you go, check out our <strong>latest items on sale for <a href="https://northsidegeneralstore.myshopify.com/collections/sale?utm_source=Gorgias&amp%3Bamp%3Butm_medium=ChatCampaign&amp%3Bamp%3Butm_campaign=[Push+for+conversions]+exit+intent+for+returning+customers%2C+suggest+sale+collection&amp%3Butm_medium=ChatCampaign&amp%3Butm_campaign=[Push+for+conversions]+exit+intent+for+returning+customers%2C+suggest+sale+collection&utm_medium=ChatCampaign&utm_campaign=%5BCL%5D%5BIncrease%20Conversion%20Rate%5D%20Promote%20your%20sale%20collection%2C%20for%20returning%20visitors%20about%20to%20leave" target="_blank">up to 30% OFF</a>!</strong>💸</div>',
            message_text:
                'Before you go, check out our latest items on sale for up to 30% OFF!💸',
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
            meta: {
                noReply: true,
            },
        })

        return Promise.resolve(b.build())
    },
}
