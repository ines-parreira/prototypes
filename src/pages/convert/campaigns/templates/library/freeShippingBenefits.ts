// Highlight free shipping benefit for customers near the threshold & offer accessories

import {ulid} from 'ulidx'
import {Map} from 'immutable'

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

export const FREE_SHIPPING_BENEFITS: CampaignTemplate = {
    slug: 'free-shipping-benefits-for-customers-near-threshold',
    name: 'Highlight free shipping benefit for customers near the threshold',
    description:
        'Suggest small items or accessories to complete the cart and reach the free shipping threshold',
    onboarding: false,
    preview: assetsUrl('img/campaigns/library/free-shipping-benefits.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Audience,
            stepConfiguration: {
                [CampaignStepsKeys.Audience]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'You can <strong>update the cart values of Amount Added To Cart triggers</strong> based on your free shipping threshold value.',
                    },
                },
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Info,
                        content:
                            'You can customise the product cards based on your Shopify product catalogue. We suggest to select small/accessory items.',
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
    getConfiguration: async (
        storeIntegration: Map<string, any>
    ): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Gt,
                value: 50,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Lt,
                value: 100,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const b = new CampaignConfigurationBuilder(FREE_SHIPPING_BENEFITS, {
            name: FREE_SHIPPING_BENEFITS.name,
            template_id: FREE_SHIPPING_BENEFITS.slug,
            message_html:
                '<div><strong>🚚 FREE SHIPPING for orders $100+</strong></div><div><br></div><div>You&#x27;re almost there! Add our accessories<strong> for only $25</strong>!</div>',
            message_text:
                "🚚 FREE SHIPPING for orders $100+\n\nYou're almost there! Add our accessories for only $25!",
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
            meta: {
                delay: 15000,
                noReply: true,
            },
        })

        await b.attachProductCards(storeIntegration, 3)

        return Promise.resolve(b.build())
    },
}
