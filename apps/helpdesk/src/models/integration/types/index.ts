import type { AircallIntegration } from './aircall'
import type { AlloyIntegration } from './alloy'
import type { AppIntegration } from './app'
import type { BigCommerceIntegration } from './bigcommerce'
import { EcommerceIntegration } from './ecommerce'
import type { EmailIntegration } from './email'
import type { FacebookIntegration } from './facebook'
import type { GmailIntegration } from './gmail'
import type { GorgiasChatIntegration } from './gorgiasChat'
import type { HttpIntegration } from './http'
import type { KlaviyoIntegration } from './klaviyo'
import type { Magento2Integration } from './magento2'
import type { OutlookIntegration } from './outlook'
import type { PhoneIntegration } from './phone'
import type { RechargeIntegration } from './recharge'
import type { ShopifyIntegration } from './shopify'
import type { SmileIntegration } from './smile'
import type { SmsIntegration } from './sms'
import type { TwitterIntegration } from './twitter'
import type { WhatsAppIntegration } from './whatsapp'
import type { YotpoIntegration } from './yotpo'
import type { ZendeskIntegration } from './zendesk'

export type { IntegrationDecoration } from './base'

export {
    IntegrationType,
    VoiceMessageType,
    IvrMenuActionType,
    AddressType,
} from '../constants'

export * from './misc'
export * from './email'
export * from './gmail'
export * from './outlook'
export * from './aircall'
export * from './gorgiasChat'
export * from './facebook'
export * from './http'
export * from './shopify'
export * from './recharge'
export * from './smile'
export * from './magento2'
export * from './zendesk'
export * from './yotpo'
export * from './klaviyo'
export * from './phone'
export * from './sms'
export * from './twitter'
export * from './bigcommerce'
export * from './whatsapp'
export * from './app'
export * from './ecommerce'

export type Integration =
    | EmailIntegration
    | GmailIntegration
    | OutlookIntegration
    | AircallIntegration
    | AlloyIntegration
    | GorgiasChatIntegration
    | FacebookIntegration
    | HttpIntegration
    | ShopifyIntegration
    | RechargeIntegration
    | SmileIntegration
    | Magento2Integration
    | ZendeskIntegration
    | YotpoIntegration
    | KlaviyoIntegration
    | PhoneIntegration
    | SmsIntegration
    | TwitterIntegration
    | BigCommerceIntegration
    | WhatsAppIntegration
    | AppIntegration
    | EcommerceIntegration

export type IntegrationRequest = {
    description: string
}
