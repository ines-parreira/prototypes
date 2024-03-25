// Offer 10% discount for visitors with high-value carts
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

export const DISCOUNT_HIGH_VALUE_CARTS: CampaignTemplate = {
    slug: 'offer-discount-for-high-value-cart',
    name: 'Offer 10% discount for visitors with high-value carts',
    description:
        'Push your shoppers with carts above your average order value to check out',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/offer-10-discount-high-value-carts.png'
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Audience,
            stepConfiguration: {
                [CampaignStepsKeys.Audience]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'You can <strong>update the cart values of Amount Added To Cart triggers</strong> to target shoppers with high cart values, depending on your store average order value.',
                    },
                },
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Info,
                        content:
                            'You can customize the discount code by using one of your existing one',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Discount]: {
                    tooltipContent: 'Select your own Shopify discount code',
                },
            },
        }
    },
    getConfiguration: async (
        storeIntegration: Map<string, any>
    ): Promise<CampaignConfiguration> => {
        const discountCode =
            await CampaignConfigurationBuilder.getOrCreateDiscountCode(
                storeIntegration,
                'percentage',
                'FORYOU10',
                0.1
            )
        const shopDomain = storeIntegration.getIn([
            'meta',
            'shop_domain',
        ]) as string

        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Gt,
                value: 100,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Lt,
                value: 150,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.SessionTime,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const b = new CampaignConfigurationBuilder(DISCOUNT_HIGH_VALUE_CARTS, {
            name: DISCOUNT_HIGH_VALUE_CARTS.name,
            template_id: DISCOUNT_HIGH_VALUE_CARTS.slug,
            message_html: `<div>🍀 You&#x27;re lucky today: <strong>10% off</strong> on your order over $150, with <strong>code <a data-discount-code="${discountCode}" href="https://${shopDomain}/discount/${discountCode}" target="_blank" rel="noreferrer">${discountCode}</a> </strong></div>`,
            message_text: `🍀 You're lucky today: 10% off on your order over $150, with code ${discountCode}`,
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
            meta: {
                delay: 15000,
                noReply: true,
            },
        })

        return Promise.resolve(b.build())
    },
}
