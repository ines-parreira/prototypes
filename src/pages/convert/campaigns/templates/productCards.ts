import {ulid} from 'ulidx'
import {assetsUrl} from 'utils'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import {CampaignTriggerType} from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import {createTriggerRule} from 'pages/convert/campaigns/utils/createTriggerRule'
import {CampaignTriggerBusinessHoursValuesEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerBusinessHoursValues.enum'
import {CampaignAttachment} from 'pages/convert/campaigns/types/CampaignAttachment'
import {CampaignTriggerDeviceTypeValueEnum} from 'pages/convert/campaigns/types/enums/CampaignTriggerDeviceTypeValue.enum'
import {
    CampaignConfiguration,
    CampaignTemplate,
    CampaignTemplateLabelType,
} from './types'
import {CampaignConfigurationBuilder} from './constructor'

export const PRODUCT_CARD_SHOWCASE: CampaignTemplate = {
    slug: 'product-card-showcase',
    name: 'Showcase products to cross-sell',
    estimation: '$100/month',
    label: CampaignTemplateLabelType.IncreaseAOV,
    onboarding: true,
    preview: assetsUrl('img/campaigns/preview/product-card.png'),
    getConfiguration: (): CampaignConfiguration => {
        // TODO: Add attachments from the backend
        const attachments = [] as CampaignAttachment[]

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

        const b = new CampaignConfigurationBuilder(PRODUCT_CARD_SHOWCASE, {
            name: PRODUCT_CARD_SHOWCASE.name,
            template_id: PRODUCT_CARD_SHOWCASE.slug,
            message_text: `You've got great taste! Check out our fan-favorite selection 😍`,
            message_html: `<div>You&#x27;ve got great taste! Check out <strong>our fan-favorite selection</strong> 😍</div>`,
            status: CampaignStatus.Inactive,
            triggers: triggers,
            trigger_rule: createTriggerRule(triggers),
            attachments,
        })

        return b.build()
    },
}
