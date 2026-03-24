import { PlanName } from '@repo/billing'
import type { Map } from 'immutable'
import { ulid } from 'ulidx'

import type { WizardConfiguration } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { TooltipActionType } from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import { CampaignStepsKeys } from 'pages/convert/campaigns/types/CampaignSteps'
import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { CampaignTriggerBusinessHoursValuesEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerDeviceTypeValueEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerDeviceTypeValue.enum'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTriggerRule } from 'pages/convert/campaigns/utils/createTriggerRule'
import { assetsUrl } from 'utils'

import { CampaignConfigurationBuilder } from '../constructor'
import type { CampaignConfiguration, CampaignTemplate } from '../types'
import { CampaignTemplateLabelType } from '../types'

export const PRODUCT_CARD_SHOWCASE: CampaignTemplate = {
    slug: 'product-card-showcase',
    name: 'Showcase products to cross-sell',
    estimation: {
        [PlanName.Starter]: '$400/month',
        [PlanName.Basic]: '$1,000/month',
        [PlanName.Pro]: '$4,000/month',
        [PlanName.Advanced]: '$11,000/month',
        [PlanName.Enterprise]: '$22,000/month',
    },
    label: CampaignTemplateLabelType.IncreaseAOV,
    onboarding: true,
    preview: assetsUrl('img/campaigns/preview/product-card.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
            toolbarConfiguration: {
                [TooltipActionType.Product]: {
                    tooltipContent: 'Add up to 5 products',
                },
            },
        }
    },
    getConfiguration: async (
        storeIntegration: Map<string, any>,
    ): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.Anytime,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.SessionTime,
                operator: CampaignTriggerOperator.Gt,
                value: 15,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Gt,
                value: 50,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.DeviceType,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerDeviceTypeValueEnum.Desktop,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            PRODUCT_CARD_SHOWCASE,
            {
                name: PRODUCT_CARD_SHOWCASE.name,
                template_id: PRODUCT_CARD_SHOWCASE.slug,
                message_text: `You've got great taste! Check out our fan-favorite selection 😍`,
                message_html: `<div>You&#x27;ve got great taste! Check out <strong>our fan-favorite selection</strong> 😍</div>`,
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
                meta: {
                    noReply: true,
                },
            },
        )

        await builder.attachProductCards(storeIntegration, 3)

        return builder.build()
    },
}
