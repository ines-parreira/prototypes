// Suggest bundles when a single item is in cart
import { ulid } from 'ulidx'

import type { WizardConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {
    BannerType,
    TooltipActionType,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { CampaignStepsKeys } from 'pages/convert/campaigns/types/CampaignSteps'
import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { CampaignTriggerBusinessHoursValuesEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTriggerRule } from 'pages/convert/campaigns/utils/createTriggerRule'
import { assetsUrl } from 'utils'

import { CampaignConfigurationBuilder } from '../constructor'
import type { CampaignConfiguration, CampaignTemplate } from '../types'

export const SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD: CampaignTemplate = {
    slug: 'suggest-bundles-when-single-item',
    name: 'Suggest bundles when a single item is in cart',
    description:
        'Promote your bundle offer and highlight the saved amount, to increase your shoppers’ cart value',
    onboarding: false,
    preview: assetsUrl(
        'img/campaigns/library/suggest-bundles-when-single-item.png',
    ),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Audience,
            stepConfiguration: {
                [CampaignStepsKeys.Audience]: {
                    banner: {
                        type: BannerType.Warning,
                        content:
                            'To target shoppers with a certain item in cart, <strong>please insert one of the Shopify product tag</strong> of the item to identify it.',
                    },
                },
                [CampaignStepsKeys.Message]: {
                    banner: {
                        type: BannerType.Info,
                        content:
                            'Please <strong>select the bundle</strong> you want to recommend from your Shopify catalog.',
                    },
                },
            },
            toolbarConfiguration: {
                [TooltipActionType.Product]: {
                    tooltipContent: 'Select the bundle product',
                },
            },
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.ProductTags,
                operator: CampaignTriggerOperator.ContainsAny,
                value: 'INSERTYOURTAG',
            },
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
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD,
            {
                name: SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.name,
                template_id: SUGGEST_BUNDLES_WHEN_SINGLE_PRODUCT_IN_CARD.slug,
                message_html:
                    '<div> 👋 Interested in this item? Check out our bundle, and<strong> save $10 </strong>😍</div>',
                message_text:
                    ' 👋 Interested in this item? Check out our bundle, and save $10 😍',

                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                meta: {
                    delay: 5000,
                    noReply: true,
                },
            },
        )

        return Promise.resolve(builder.build())
    },
}
