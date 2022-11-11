import {
    EmailIntegration,
    GmailIntegration,
    Integration,
    IntegrationType,
    OutlookIntegration,
} from '../models/integration/types'

//$TsFixMe fallback values for js, use IntegrationType enum instead
export const AIRCALL_INTEGRATION_TYPE = 'aircall'
export const BIGCOMMERCE_INTEGRATION_TYPE = 'bigcommerce'
export const SMOOCH_INTEGRATION_TYPE = 'smooch'
export const SMOOCH_INSIDE_INTEGRATION_TYPE = 'smooch_inside'
export const FACEBOOK_INTEGRATION_TYPE = 'facebook'
export const EMAIL_INTEGRATION_TYPE = 'email'
export const GMAIL_INTEGRATION_TYPE = 'gmail'
export const OUTLOOK_INTEGRATION_TYPE = 'outlook'
export const GORGIAS_CHAT_INTEGRATION_TYPE = 'gorgias_chat'
export const HTTP_INTEGRATION_TYPE = 'http'
export const MAGENTO2_INTEGRATION_TYPE = 'magento2'
export const RECHARGE_INTEGRATION_TYPE = 'recharge'
export const SHOPIFY_INTEGRATION_TYPE = 'shopify'
export const SMILE_INTEGRATION_TYPE = 'smile'
export const ZENDESK_INTEGRATION_TYPE = 'zendesk'
export const YOTPO_INTEGRATION_TYPE = 'yotpo'
export const KLAVIYO_INTEGRATION_TYPE = 'klaviyo'
export const PHONE_INTEGRATION_TYPE = 'phone'
export const TWITTER_INTEGRATION_TYPE = 'twitter'

// $TsFixMe replace with proper enum once no more js files use the constant
export const EMAIL_INTEGRATION_TYPES = Object.freeze([
    EMAIL_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
]) as [IntegrationType.Email, IntegrationType.Gmail, IntegrationType.Outlook]

export const INTEGRATION_TYPES_MAP = Object.freeze({
    EMAIL_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
    AIRCALL_INTEGRATION_TYPE,
    BIGCOMMERCE_INTEGRATION_TYPE,
    SMOOCH_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
    FACEBOOK_INTEGRATION_TYPE,
    HTTP_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SMILE_INTEGRATION_TYPE,
    ZENDESK_INTEGRATION_TYPE,
    YOTPO_INTEGRATION_TYPE,
    PHONE_INTEGRATION_TYPE,
    TWITTER_INTEGRATION_TYPE,
})

export const INTEGRATION_TYPES = Object.freeze(
    Object.values(INTEGRATION_TYPES_MAP)
)

export const EMAIL_INTEGRATION_NAME_FORBIDDEN_CHARS = Object.freeze([
    '@',
    ',',
    ';',
    '<',
    '>',
    '\\[',
    '\\]',
])

export const PENDING_AUTHENTICATION_STATUS = 'pending'
export const SUCCESS_AUTHENTICATION_STATUS = 'success'
export const ERROR_AUTHENTICATION_STATUS = 'error'
export const AUTHENTICATION_STATUS = [
    PENDING_AUTHENTICATION_STATUS,
    SUCCESS_AUTHENTICATION_STATUS,
    ERROR_AUTHENTICATION_STATUS,
]

export const INTEGRATION_DATA_ITEM_TYPE_PRODUCT = 'product'

export const INTEGRATION_DATA_ITEM_TYPES_MAP = Object.freeze({
    INTEGRATION_DATA_ITEM_TYPE_PRODUCT,
})

export const INTEGRATION_DATA_ITEM_TYPES = Object.freeze(
    Object.values(INTEGRATION_DATA_ITEM_TYPES_MAP)
)

export const PRODUCTS_PER_PAGE = 30

export const isGenericEmailIntegration = (
    integration: Integration
): integration is EmailIntegration | GmailIntegration | OutlookIntegration => {
    return (EMAIL_INTEGRATION_TYPES as IntegrationType[]).includes(
        integration.type
    )
}

export const getIsBaseEmailAddress = (emailAddress: string) => {
    return emailAddress.endsWith(window.EMAIL_FORWARDING_DOMAIN)
}

export const getIsBaseEmailIntegration = (
    emailIntegration: EmailIntegration | GmailIntegration | OutlookIntegration
): emailIntegration is EmailIntegration => {
    return getIsBaseEmailAddress(emailIntegration.meta.address)
}
