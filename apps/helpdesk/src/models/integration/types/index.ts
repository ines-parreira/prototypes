import type { AircallIntegration } from './aircall'
import type { AlloyIntegration } from './alloy'
import type { AppIntegration } from './app'
import type { BigCommerceIntegration } from './bigcommerce'
import type { EcommerceIntegration } from './ecommerce'
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
export { IntegrationDataItemType, isStoreIntegration } from './misc'
export type {
    AutoResponder,
    IntegrationAuthentication,
    IntegrationDataItem,
    IntegrationExtra,
    IntegrationFromType,
    OAuth2,
    ProductCardDetails,
    StoreIntegration,
} from './misc'
export {
    DNSRecordType,
    EmailMigrationInboundVerificationStatus,
    EmailMigrationOutboundVerificationStatus,
    EmailMigrationStatus,
    isEmailIntegration,
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from './email'
export type {
    DomainDNSRecord,
    EmailDomain,
    EmailIntegration,
    EmailIntegrationMeta,
    EmailMigrationBannerStatus,
    EmailMigrationInboundVerification,
    EmailMigrationOutboundVerification,
    EmailMigrationSenderVerificationIntegration,
    EmailSignature,
    MigrationIntegration,
} from './email'
export { isGmailIntegration } from './gmail'
export type { GmailIntegration, GmailIntegrationMeta } from './gmail'
export { isOutlookIntegration } from './outlook'
export type { OutlookIntegration, OutlookIntegrationMeta } from './outlook'
export { isAircallIntegration } from './aircall'
export type { AircallIntegration } from './aircall'
export {
    GorgiasChatAutoResponderReply,
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatEmailCaptureType,
    GorgiasChatInstallationMethod,
    GorgiasChatInstallationVisibilityConditionOperator,
    GorgiasChatInstallationVisibilityMatchConditions,
    GorgiasChatInstallationVisibilityMethod,
    GorgiasChatLauncherType,
    GorgiasChatMinimumSnippetVersion,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatStatusEnum,
    isGorgiasChatIntegration,
    latestSnippetVersion,
} from './gorgiasChat'
export type {
    GetApplicationsResponse,
    GetInstallationSnippetParams,
    GetInstallationSnippetResponse,
    GorgiasChatApplicationBaseInfo,
    GorgiasChatAvatarSettings,
    GorgiasChatInstallationVisibility,
    GorgiasChatInstallationVisibilityCondition,
    GorgiasChatIntegration,
    GorgiasChatIntegrationMeta,
    GorgiasChatMetaInstallation,
    GorgiasChatPosition,
    GorgiasChatPreviewApplicationSettings,
    SelfServiceConfiguration,
} from './gorgiasChat'
export { isFacebookIntegration } from './facebook'
export type {
    FacebokIntegrationPreferences,
    FacebookIntegration,
    FacebookIntegrationMeta,
    FacebookIntegrationSettings,
} from './facebook'
export {
    isHttpIntegration,
    OAuth2TokenLocation,
    OAUTH2_SECRET_SENTINEL,
} from './http'
export type {
    HTTPForm,
    HttpIntegration,
    HTTPIntegrationEvent,
    HttpIntegrationMeta,
    OAuth2Config,
} from './http'
export { isShopifyIntegration, ShopifyTags } from './shopify'
export type {
    ShopifyCollection,
    ShopifyCollectionResponse,
    ShopifyCustomerSegment,
    ShopifyCustomerTags,
    ShopifyIntegration,
    ShopifyIntegrationMeta,
    ShopifyOrderTags,
    ShopifySegmentResponse,
} from './shopify'
export { isRechargeIntegration } from './recharge'
export type { RechargeIntegration, RechargeIntegrationMeta } from './recharge'
export { isSmileIntegration } from './smile'
export type { SmileIntegration, SmileIntegrationMeta } from './smile'
export { isMagento2Integration } from './magento2'
export type { Magento2Integration, Magento2IntegrationMeta } from './magento2'
export { isZendeskIntegration } from './zendesk'
export type { ZendeskIntegration, ZendeskIntegrationMeta } from './zendesk'
export { isYotpoIntegration } from './yotpo'
export type { YotpoIntegration, YotpoIntegrationMeta } from './yotpo'
export { isKlaviyoIntegration } from './klaviyo'
export type { KlaviyoIntegration, KlaviyoIntegrationMeta } from './klaviyo'
export {
    isPhoneIntegration,
    isStandardPhoneIntegration,
    PhoneRingingBehaviour,
} from './phone'
export type {
    IvrForwardCall,
    IvrForwardCallMenuAction,
    IvrMenuAction,
    IvrPlayVoiceMessageAction,
    IvrSendToSmsMenuAction,
    IvrSmsDeflection,
    LocalWaitMusicCustomRecording,
    LocalWaitMusicPreferences,
    PhoneIntegration,
    PhoneIntegrationIvrSettings,
    PhoneIntegrationMeta,
    PhoneIntegrationPreferences,
    PhoneIntegrationVoicemailOutsideBusinessHoursSettings,
    PhoneIntegrationVoicemailSettings,
    VoiceMessage,
    VoiceMessageNone,
    VoiceMessageRecording,
    VoiceMessageTextToSpeech,
} from './phone'
export { isSmsIntegration } from './sms'
export type { SmsIntegration, SmsIntegrationMeta } from './sms'
export { isTwitterIntegration } from './twitter'
export type { TwitterIntegration, TwitterIntegrationMeta } from './twitter'
export {
    BigCommerceActionType,
    BigCommerceCouponError,
    BigCommerceCouponErrorMessage,
    BigCommerceCustomerAddressType,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceLineItemError,
    BigCommerceLineItemErrorMessage,
    bigCommerceProductCheckboxModifierTypes,
    bigCommerceProductSelectModifierTypes,
    bigCommerceProductSwatchModifierTypes,
    BigCommerceRefundableItemType,
    BigCommerceRefundType,
    isBigCommerceIntegration,
    OrderPaymentMethodType,
    OrderStatusIDType,
    OrderStatusList,
    ProductModifiersChangedError,
} from './bigcommerce'
export type {
    BigCommerceAddressResponse,
    BigCommerceAvailablePaymentOptionsData,
    BigCommerceBillingAddress,
    BigCommerceCart,
    BigCommerceCartErrorResponse,
    BigCommerceCartLineItem,
    BigCommerceCartLineItems,
    BigCommerceCartRedirect,
    BigCommerceCartResponse,
    BigCommerceCheckout,
    BigCommerceCheckoutErrorResponse,
    BigCommerceCheckoutResponse,
    BigCommerceConsignment,
    BigCommerceCoupon,
    BigCommerceCreateConsignmentPayload,
    BigCommerceCustomAddress,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceCustomProduct,
    BigCommerceDiscount,
    BigCommerceDuplicateOrderErrorResponse,
    BigCommerceDuplicateOrderResponse,
    BigCommerceErrorList,
    BigCommerceIntegration,
    BigCommerceIntegrationMeta,
    BigCommerceNestedCart,
    BigCommerceNestedCartResponse,
    BigCommerceNestedCheckout,
    BigCommerceNestedCheckoutResponse,
    BigCommerceOrder,
    BigCommerceOrderProduct,
    BigCommerceOrderShipping,
    BigCommerceProduct,
    BigCommerceProductCheckboxModifier,
    BigCommerceProductModifiers,
    BigCommerceProductModifiersBase,
    BigCommerceProductSelectModifier,
    BigCommerceProductsListType,
    BigCommerceProductSwatchModifier,
    BigCommerceProductVariant,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundItemsPayloadComponent,
    BigCommerceRefundMethod,
    BigCommerceRefundMethodComponent,
    BigCommerceRefundOrderPayload,
    BigCommerceRefundOrderState,
    BigCommerceShippingOption,
    BigCommerceTaxCheckout,
    BigCommerceUpsertConsignmentPayload,
    BigCommerceWebhook,
    CalculateOrderRefundDataErrorResponse,
    CalculateOrderRefundDataNestedResponse,
    CalculateOrderRefundDataResponse,
    CalculateOrderRefundQuotesDataErrorResponse,
    CalculateOrderRefundQuotesDataResponse,
    CreateOrderValidationResult,
    GiftWrappingItemRefundData,
    HandlingItemRefundData,
    IndividualItemsLevelRefundData,
    OrderLevelRefundData,
    ProductItemRefundData,
    ShippingItemRefundData,
} from './bigcommerce'
export {
    isWhatsAppIntegration,
    WhatsAppCodeVerificationMethod,
    WhatsAppPhoneNumberStatus,
    WhatsAppPhoneNumberVerificationStatus,
} from './whatsapp'
export type {
    WhatsAppIntegration,
    WhatsAppIntegrationMeta,
    WhatsAppMigrationProgress,
} from './whatsapp'
export {
    Category,
    isAppDetail,
    isAppIntegration,
    isAppListItem,
    isCategory,
    PricingPlan,
    TrialPeriod,
} from './app'
export type {
    AppData,
    AppDetail,
    AppErrorLog,
    AppIntegration,
    AppIntegrationMeta,
    AppListData,
    AppListItem,
    DisconnectResponse,
} from './app'
export type {
    EcommerceIntegration,
    EcommerceIntegrationMeta,
} from './ecommerce'
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
