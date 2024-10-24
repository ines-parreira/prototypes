// Suggest similar items for sold-out or back-ordered items

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

export const SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT: CampaignTemplate = {
    slug: 'suggest-similar-products-for-sold-out',
    name: 'Suggest similar items for sold-out or back-ordered items',
    description:
        'Offer several alternatives when a shopper is visiting the product of a sold-out item',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/suggest-similar-products-for-sold-out.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Audience,
            stepConfiguration: {
                [CampaignStepsKeys.Audience]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Please <strong>update the URL trigger</strong> to target visitors on the product page of an out-of-stock product',
                    },
                },
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Info,
                        content:
                            'Please <strong>select the similar products</strong> you want to recommend from your Shopify catalog.',
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
                value: '/products/ADDYOURURL',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 5,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT,
            {
                name: SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT.name,
                template_id: SUGGEST_SIMILAR_PRODUCTS_FOR_SOLD_OUT.slug,
                message_html:
                    '<div>This one is sold out, but we have<strong> similar styles ready for you </strong>✨</div>',
                message_text:
                    'This one is sold out, but we have similar styles ready for you ✨',
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
