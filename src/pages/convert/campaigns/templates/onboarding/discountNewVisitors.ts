import {ulid} from 'ulidx'
import {Map} from 'immutable'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {PlanName} from 'utils/paywalls'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {
    TooltipActionType,
    WizardConfiguration,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from '../types'
import {CampaignConfigurationBuilder} from '../constructor'

export const DISCOUNT_NEW_VISITORS: CampaignTemplate = {
    slug: 'discount-new-visitors',
    name: 'Give 10% off for new visitors about to leave',
    estimation: {
        [PlanName.Starter]: '$3,000/month',
        [PlanName.Basic]: '$9,000/month',
        [PlanName.Pro]: '$14,000/month',
        [PlanName.Advanced]: '$24,000/month',
        [PlanName.Enterprise]: '$50,000/month',
    },
    label: CampaignTemplateLabelType.IncreaseConversions,
    onboarding: true,
    preview: assetsUrl('img/campaigns/preview/discount-new-visitors.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
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
                'LUCKYGC10',
                0.1
            )
        const shopName = storeIntegration.getIn([
            'meta',
            'shop_domain',
        ]) as string

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
                value: 20,
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
                operator: CampaignTriggerOperator.Lt,
                value: 3,
            },
        ]

        const builder = new CampaignConfigurationBuilder(
            DISCOUNT_NEW_VISITORS,
            {
                name: DISCOUNT_NEW_VISITORS.name,
                template_id: DISCOUNT_NEW_VISITORS.slug,
                message_text: `Hold on! Get 10% off your first order with code ${discountCode} 😉`,
                message_html: `<div>Hold on! Get <strong>10% off your first order</strong> with code <strong><a data-discount-code="${discountCode}" href="https://${shopName}/discount/${discountCode}" target="_blank" rel="noreferrer">${discountCode}</a> </strong>😉</div>`,
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
