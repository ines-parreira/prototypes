// Schedule limited time offer for items that require liquidation

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

export const SCHEDULE_LIMITED_TIME_OFFER: CampaignTemplate = {
    slug: 'schedule-limited-time-offer',
    name: 'Schedule limited time offer for liquidated items ',
    description:
        'Showcase your products on sale on your collection pages, and give an extra discount code',
    onboarding: false,
    preview: assetsUrl('img/campaigns/library/schedule-limited-time-offer.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            stepConfiguration: {
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'Please <strong>remove or update the discount code</strong> to apply it only to your sales items.',
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
                'SAVE5',
                0.05
            )
        const shopName = storeIntegration.getIn([
            'meta',
            'shop_domain',
        ]) as string

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

        const b = new CampaignConfigurationBuilder(
            SCHEDULE_LIMITED_TIME_OFFER,
            {
                name: SCHEDULE_LIMITED_TIME_OFFER.name,
                template_id: SCHEDULE_LIMITED_TIME_OFFER.slug,
                message_html: `<div>👉 <strong>Limited time offer</strong> — all under $99! </div><div><em>Pss: 5% extra discount with code <strong><a data-discount-code="${discountCode}" href="https://${shopName}.myshopify.com/discount/${discountCode}" target="_blank" rel="noreferrer">${discountCode}</a> </strong>💸</em></div>`,
                message_text:
                    '👉 Limited time offer — all under $99! \nPss: 5% extra discount with code SAVE5 💸',

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
