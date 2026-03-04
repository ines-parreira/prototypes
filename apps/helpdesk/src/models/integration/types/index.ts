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
export {
    AutoResponder,
    IntegrationAuthentication,
    IntegrationDataItem,
    IntegrationDataItemType,
    IntegrationExtra,
    IntegrationFromType,
    isStoreIntegration,
    OAuth2,
    ProductCardDetails,
    StoreIntegration,
} from './misc'
export {
    DNSRecordType,
    DomainDNSRecord,
    EmailDomain,
    EmailIntegration,
    EmailIntegrationMeta,
    EmailMigrationBannerStatus,
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
    EmailMigrationOutboundVerification,
    EmailMigrationOutboundVerificationStatus,
    EmailMigrationSenderVerificationIntegration,
    EmailMigrationStatus,
    EmailSignature,
    isEmailIntegration,
    MigrationIntegration,
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from './email'
export {
    GmailIntegration,
    GmailIntegrationMeta,
    isGmailIntegration,
} from './gmail'
export {
    isOutlookIntegration,
    OutlookIntegration,
    OutlookIntegrationMeta,
} from './outlook'
export { AircallIntegration, isAircallIntegration } from './aircall'
export {
    GetApplicationsResponse,
    GetInstallationSnippetParams,
    GetInstallationSnippetResponse,
    GorgiasChatApplicationBaseInfo,
    GorgiasChatAutoResponderReply,
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatCreationWizardInstallationMethod,
    GorgiasChatCreationWizardStatus,
    GorgiasChatCreationWizardSteps,
    GorgiasChatEmailCaptureType,
    GorgiasChatInstallationMethod,
    GorgiasChatInstallationVisibility,
    GorgiasChatInstallationVisibilityCondition,
    GorgiasChatInstallationVisibilityConditionOperator,
    GorgiasChatInstallationVisibilityMatchConditions,
    GorgiasChatInstallationVisibilityMethod,
    GorgiasChatIntegration,
    GorgiasChatIntegrationMeta,
    GorgiasChatLauncherType,
    GorgiasChatMetaInstallation,
    GorgiasChatMinimumSnippetVersion,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatStatusEnum,
    isGorgiasChatIntegration,
    latestSnippetVersion,
    SelfServiceConfiguration,
} from './gorgiasChat'
export {
    FacebokIntegrationPreferences,
    FacebookIntegration,
    FacebookIntegrationMeta,
    FacebookIntegrationSettings,
    isFacebookIntegration,
} from './facebook'
export {
    HTTPForm,
    HttpIntegration,
    HTTPIntegrationEvent,
    HttpIntegrationMeta,
    isHttpIntegration,
} from './http'
export {
    isShopifyIntegration,
    ShopifyCollection,
    ShopifyCollectionResponse,
    ShopifyCustomerSegment,
    ShopifyCustomerTags,
    ShopifyIntegration,
    ShopifyIntegrationMeta,
    ShopifyOrderTags,
    ShopifySegmentResponse,
    ShopifyTags,
} from './shopify'
export {
    isRechargeIntegration,
    RechargeIntegration,
    RechargeIntegrationMeta,
} from './recharge'
export {
    isSmileIntegration,
    SmileIntegration,
    SmileIntegrationMeta,
} from './smile'
export {
    isMagento2Integration,
    Magento2Integration,
    Magento2IntegrationMeta,
} from './magento2'
export {
    isZendeskIntegration,
    ZendeskIntegration,
    ZendeskIntegrationMeta,
} from './zendesk'
export {
    isYotpoIntegration,
    YotpoIntegration,
    YotpoIntegrationMeta,
} from './yotpo'
export {
    isKlaviyoIntegration,
    KlaviyoIntegration,
    KlaviyoIntegrationMeta,
} from './klaviyo'
export {
    isPhoneIntegration,
    isStandardPhoneIntegration,
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
    PhoneRingingBehaviour,
    VoiceMessage,
    VoiceMessageNone,
    VoiceMessageRecording,
    VoiceMessageTextToSpeech,
} from './phone'
export { isSmsIntegration, SmsIntegration, SmsIntegrationMeta } from './sms'
export {
    isTwitterIntegration,
    TwitterIntegration,
    TwitterIntegrationMeta,
} from './twitter'
export {
    BigCommerceActionType,
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
    BigCommerceCouponError,
    BigCommerceCouponErrorMessage,
    BigCommerceCreateConsignmentPayload,
    BigCommerceCustomAddress,
    BigCommerceCustomCartLineItem,
    BigCommerceCustomer,
    BigCommerceCustomerAddress,
    BigCommerceCustomerAddressType,
    BigCommerceCustomProduct,
    BigCommerceDiscount,
    BigCommerceDuplicateOrderErrorResponse,
    BigCommerceDuplicateOrderResponse,
    BigCommerceErrorList,
    BigCommerceGeneralError,
    BigCommerceGeneralErrorMessage,
    BigCommerceIntegration,
    BigCommerceIntegrationMeta,
    BigCommerceLineItemError,
    BigCommerceLineItemErrorMessage,
    BigCommerceNestedCart,
    BigCommerceNestedCartResponse,
    BigCommerceNestedCheckout,
    BigCommerceNestedCheckoutResponse,
    BigCommerceOrder,
    BigCommerceOrderProduct,
    BigCommerceOrderShipping,
    BigCommerceProduct,
    BigCommerceProductCheckboxModifier,
    bigCommerceProductCheckboxModifierTypes,
    BigCommerceProductModifiers,
    BigCommerceProductModifiersBase,
    BigCommerceProductSelectModifier,
    bigCommerceProductSelectModifierTypes,
    BigCommerceProductsListType,
    BigCommerceProductSwatchModifier,
    bigCommerceProductSwatchModifierTypes,
    BigCommerceProductVariant,
    BigCommerceRefundableItemType,
    BigCommerceRefundItemsPayload,
    BigCommerceRefundItemsPayloadComponent,
    BigCommerceRefundMethod,
    BigCommerceRefundMethodComponent,
    BigCommerceRefundOrderPayload,
    BigCommerceRefundOrderState,
    BigCommerceRefundType,
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
    isBigCommerceIntegration,
    OrderLevelRefundData,
    OrderPaymentMethodType,
    OrderStatusIDType,
    OrderStatusList,
    ProductItemRefundData,
    ProductModifiersChangedError,
    ShippingItemRefundData,
} from './bigcommerce'
export {
    isWhatsAppIntegration,
    WhatsAppCodeVerificationMethod,
    WhatsAppIntegration,
    WhatsAppIntegrationMeta,
    WhatsAppMigrationProgress,
    WhatsAppPhoneNumberStatus,
    WhatsAppPhoneNumberVerificationStatus,
} from './whatsapp'
export {
    AppData,
    AppDetail,
    AppErrorLog,
    AppIntegration,
    AppIntegrationMeta,
    AppListData,
    AppListItem,
    Category,
    DisconnectResponse,
    isAppDetail,
    isAppIntegration,
    isAppListItem,
    isCategory,
    PricingPlan,
    TrialPeriod,
} from './app'
export { EcommerceIntegration, EcommerceIntegrationMeta } from './ecommerce'
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
