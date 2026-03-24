import { PlanName } from '@repo/billing'
import { ulid } from 'ulidx'

import { CampaignStatus } from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import { CampaignTriggerBusinessHoursValuesEnum } from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { createTriggerRule } from 'pages/convert/campaigns/utils/createTriggerRule'
import { assetsUrl } from 'utils'

import { CampaignConfigurationBuilder } from '../constructor'
import type { CampaignConfiguration, CampaignTemplate } from '../types'
import { CampaignTemplateLabelType } from '../types'

export const CART_ABANDONMENT: CampaignTemplate = {
    slug: 'offer-help-on-cart-abandonment',
    name: 'Offer help to save the high-value carts',
    estimation: {
        [PlanName.Starter]: '$400/month',
        [PlanName.Basic]: '$1,000/month',
        [PlanName.Pro]: '$4,000/month',
        [PlanName.Advanced]: '$11,000/month',
        [PlanName.Enterprise]: '$22,000/month',
    },
    label: CampaignTemplateLabelType.PreventCartAbandonment,
    onboarding: true,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): Promise<CampaignConfiguration> => {
        const triggers = [
            {
                id: ulid(),
                type: CampaignTriggerType.BusinessHours,
                operator: CampaignTriggerOperator.Eq,
                value: CampaignTriggerBusinessHoursValuesEnum.During,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.SessionTime,
                operator: CampaignTriggerOperator.Gt,
                value: 10,
            },
            {
                id: ulid(),
                type: CampaignTriggerType.CartValue,
                operator: CampaignTriggerOperator.Gt,
                value: 100,
            },
        ]

        const builder = new CampaignConfigurationBuilder(CART_ABANDONMENT, {
            name: CART_ABANDONMENT.name,
            template_id: CART_ABANDONMENT.slug,
            message_text: `👋 Do you have any questions? I'm online and ready to help you 🙂`,
            message_html: `<div>👋 Do you have any questions? <em>I&#x27;m online </em>and <strong>ready to help you</strong> 🙂</div>`,
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
        })

        return Promise.resolve(builder.build())
    },
}
