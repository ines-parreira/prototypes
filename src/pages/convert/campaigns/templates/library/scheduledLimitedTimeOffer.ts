// Schedule limited time offer for items that require liquidation

import {Map} from 'immutable'
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

export const DISCOUNT_CODE = 'SAVE5'

export const SCHEDULE_LIMITED_TIME_OFFER: CampaignTemplate = {
    slug: 'schedule-limited-time-offer',
    name: 'Schedule limited time offer for liquidated items',
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
    postSave: async (storeIntegration: Map<string, any>): Promise<boolean> => {
        try {
            await CampaignConfigurationBuilder.getOrCreateDiscountCode(
                storeIntegration,
                'percentage',
                DISCOUNT_CODE,
                0.05
            )
        } catch (e) {
            return Promise.resolve(false)
        }

        return Promise.resolve(true)
    },
    getConfiguration: async (
        storeIntegration: Map<string, any>
    ): Promise<CampaignConfiguration> => {
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

        const builder = new CampaignConfigurationBuilder(
            SCHEDULE_LIMITED_TIME_OFFER,
            {
                name: SCHEDULE_LIMITED_TIME_OFFER.name,
                template_id: SCHEDULE_LIMITED_TIME_OFFER.slug,
                message_html: `<div>👉 <strong>Limited time offer</strong> — all under $99! </div><div><em>Pss: 5% extra discount with code <strong><a data-discount-code="${DISCOUNT_CODE}" href="https://${shopName}/discount/${DISCOUNT_CODE}" target="_blank" rel="noreferrer">${DISCOUNT_CODE}</a> </strong>💸</em></div>`,
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

        return Promise.resolve(builder.build())
    },
}
