import type {EmailIntegration} from './email'
import type {GmailIntegration} from './gmail'
import type {OutlookIntegration} from './outlook'
import type {AircallIntegration} from './aircall'
import type {GorgiasChatIntegration} from './gorgiasChat'
import type {SmoochIntegration} from './smooch'
import type {SmoochInsideIntegration} from './smoochInside'
import type {FacebookIntegration} from './facebook'
import type {HttpIntegration} from './http'
import type {ShopifyIntegration} from './shopify'
import type {RechargeIntegration} from './recharge'
import type {SmileIntegration} from './smile'
import type {Magento2Integration} from './magento2'
import type {ZendeskIntegration} from './zendesk'
import type {YotpoIntegration} from './yotpo'
import type {KlaviyoIntegration} from './klaviyo'
import type {PhoneIntegration} from './phone'
import type {TwitterIntegration} from './twitter'
import {SelfServiceIntegration} from './selfService'

export type {IntegrationDecoration} from './base'

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
export * from './smooch'
export * from './gorgiasChat'
export * from './smoochInside'
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
export * from './twitter'
export * from './selfService'

export type Integration =
    | EmailIntegration
    | GmailIntegration
    | OutlookIntegration
    | AircallIntegration
    | GorgiasChatIntegration
    | SmoochIntegration
    | SmoochInsideIntegration
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
    | TwitterIntegration
    | SelfServiceIntegration
