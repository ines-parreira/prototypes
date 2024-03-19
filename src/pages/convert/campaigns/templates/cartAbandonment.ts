import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from './types'
import {CampaignConfigurationBuilder} from './constructor'

export const CART_ABANDONMENT: CampaignTemplate = {
    slug: 'offer-help-on-cart-abandonment',
    name: 'Offer help to save the high-value carts',
    estimation: '$100/month',
    label: CampaignTemplateLabelType.PreventCartAbandonment,
    onboarding: true,
    preview: assetsUrl('img/campaigns/preview/ready-to-help.png'),
    getConfiguration: (): CampaignConfiguration => {
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

        const b = new CampaignConfigurationBuilder(CART_ABANDONMENT, {
            name: CART_ABANDONMENT.name,
            template_id: CART_ABANDONMENT.slug,
            message_text: `👋 Do you have any questions? I'm online and ready to help you 🙂`,
            message_html: `<div>👋 Do you have any questions? <em>I&#x27;m online </em>and <strong>ready to help you</strong> 🙂</div>`,
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
        })

        return b.build()
    },
}
