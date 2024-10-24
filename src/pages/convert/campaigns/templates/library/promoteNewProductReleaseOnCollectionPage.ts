// Announce new releases during the first few weeks

import {ulid} from 'ulidx'

import {
    WizardConfiguration,
    BannerType,
    TooltipActionType,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {assetsUrl} from 'utils'

import {CampaignConfigurationBuilder} from '../constructor'
import {CampaignConfiguration, CampaignTemplate} from '../types'

export const PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE: CampaignTemplate = {
    slug: 'promote-new-produt-on-collection-pages',
    name: 'Promote new product releases on collection pages',
    description:
        'Direct your visitors’ attention towards your new launches, to increase awareness',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/promote-new-produt-on-collection-pages.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Please <strong>select the new products</strong> you want to recommend from your Shopify catalog.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Product]: {
                    tooltipContent: 'Add up to 5 product cards',
                },
            },
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CurrentUrl,
                operator: CampaignTriggerOperator.Contains,
                value: '/collections',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 10,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE,
            {
                name: PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE.name,
                template_id: PROMOTE_NEW_PRODUCT_ON_COLLECTION_PAGE.slug,
                message_html:
                    '<div><strong>JUST IN! </strong>✨ Check out our brand-new launch! </div>',
                message_text: 'JUST IN! ✨ Check out our brand-new launch! ',

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
