// Connect customers on your cart page with your team

import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignStepsKeys} from 'pages/convert/campaigns/types/CampaignSteps'
import {WizardConfiguration} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

import {CampaignConfiguration, CampaignTemplate} from '../types'
import {CampaignConfigurationBuilder} from '../constructor'

export const CONNECT_CUSTOMER_ON_CART_WITH_TEAM: CampaignTemplate = {
    slug: 'connect-customer-on-cart-with-team',
    name: 'Engage with customers on the cart page',
    description:
        'Prevent cart abandonment by reassuring your shoppers before checkout',
    onboarding: false,
    preview: assetsUrl('img/campaigns/library/connect-customer-with-team.png'),
    getWizardConfiguration: (): WizardConfiguration => {
        return {
            defaultStepOpened: CampaignStepsKeys.Message,
        }
    },
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.CurrentUrl,
                operator: CampaignTriggerOperator.Contains,
                value: '/cart',
            },
            {
                id: ulid(),
                type: CampaignTriggerType.TimeSpentOnPage,
                operator: CampaignTriggerOperator.Gt,
                value: 8,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.During,
            },
        ]

        const b = new CampaignConfigurationBuilder(
            CONNECT_CUSTOMER_ON_CART_WITH_TEAM,
            {
                name: CONNECT_CUSTOMER_ON_CART_WITH_TEAM.name,
                template_id: CONNECT_CUSTOMER_ON_CART_WITH_TEAM.slug,
                message_html:
                    '<div><strong>Great choice!</strong> 🛒</div><div><br></div><div>Can we <strong>help you</strong> with anything else before checkout?</div>',
                message_text:
                    'Great choice! 🛒\n\nCan we help you with anything else before checkout?',
                status: CampaignStatus.Inactive,
                triggers: triggers,
                trigger_rule: createTriggerRule(triggers),
            }
        )

        return Promise.resolve(b.build())
    },
}
