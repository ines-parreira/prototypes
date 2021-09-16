import {
    Product as IntegrationProduct,
    Variant as IntegrationVariant,
} from '../../constants/integrations/types/shopify'
import {ContentType, HttpMethod} from '../api/types'
import {AuditLogEventType} from '../event/types'

export enum IntegrationType {
    EmailIntegrationType = 'email',
    GmailIntegrationType = 'gmail',
    OutlookIntegrationType = 'outlook',
    AircallIntegrationType = 'aircall',
    GorgiasChatIntegrationType = 'gorgias_chat',
    SmoochIntegrationType = 'smooch',
    SmoochInsideIntegrationType = 'smooch_inside',
    FacebookIntegrationType = 'facebook',
    HttpIntegrationType = 'http',
    ShopifyIntegrationType = 'shopify',
    RechargeIntegrationType = 'recharge',
    SmileIntegrationType = 'smile',
    Magento2IntegrationType = 'magento2',
    ZendeskIntegrationType = 'zendesk',
    YotpoIntegrationType = 'yotpo',
    KlaviyoIntegrationType = 'klaviyo',
    PhoneIntegrationType = 'phone',
    TwitterIntegrationType = 'twitter',
}

export enum IntegrationDataItemType {
    IntegrationDataItemTypeProduct = 'product',
}

export type Product = IntegrationProduct
export type Variant = IntegrationVariant

export type IntegrationDataItem<T> = {
    id: number
    integration_id: number
    integration_type: IntegrationType
    external_id: string
    item_type: IntegrationDataItemType
    search: string
    data: T
    created_datetime: string
    updated_datetime: string
    deleted_datetime: Maybe<string>
}

export type IntegrationDecoration = {
    avatar_team_picture_url: Maybe<string>
    avatar_type: string
    conversation_color: string
    introduction_text: string
    main_color: string
    offline_introduction_text: string
}

type IntegrationFacebook = {
    about: Maybe<string>
    callback_url: Maybe<string>
    category: string
    id: number
    name: string
    page_id: string
    picture: Maybe<{
        data: {
            height: number
            is_silhouette: boolean
            url: string
            width: number
        }
    }>
    settings: {
        import_history_enabled: boolean
        instagram_ads_enabled: boolean
        instagram_comments_enabled: boolean
        messenger_enabled: boolean
        posts_enabled: boolean
        mentions_enabled: boolean
    }
}

type IntegrationHttp = {
    execution_oder: number
    form: Maybe<unknown>
    headers: {
        'Content-Type'?: ContentType
        'content-type'?: ContentType
    }
    id: number
    method: HttpMethod
    request_content_type: ContentType
    response_content_type: ContentType
    triggers: {
        [key in typeof AuditLogEventType[keyof typeof AuditLogEventType]]?: boolean
    }
    url: string
}

export type Integration = {
    created_datetime: string
    deactivated_datetime: Maybe<string>
    decoration: Maybe<IntegrationDecoration>
    deleted_datetime: Maybe<string>
    description: Maybe<string>
    facebook: Maybe<IntegrationFacebook>
    http: Maybe<IntegrationHttp>
    id: number
    locked_datetime: Maybe<string>
    mappings: Maybe<{id: number}[]>
    meta: IntegrationMeta
    name: string
    type: IntegrationType
    updated_datetime: string
    uri: string
    user: {
        id: number
    }
}

type IntegrationMeta = {
    [key: string]: unknown
    app_id?: string
    campaigns?: Campaign[]
    language?: string
    preferences?: Record<string, unknown>
    shopify_integration_ids?: string[]
}

type Campaign = {
    id: string
    message: {
        author?: {
            avatar_url: string
            email: string
            name: string
        }
        html: string
        text: string
    }
    name: string
    triggers: Record<string, unknown>
}

export type DomainDNSRecord = {
    verified: boolean
    record_type: string
    host: string
    value: string
    current_values: Array<string>
}

export type EmailDomain = {
    name: string
    verified: boolean
    data: {
        sending_dns_records: Array<DomainDNSRecord>
    }
}

export type IntegrationAuthentication<
    T extends IntegrationType
> = T extends IntegrationType.AircallIntegrationType
    ? {
          webhook_url: string
      }
    : T extends IntegrationType.EmailIntegrationType
    ? {
          forwarding_email_address: string
      }
    : {
          redirect_url: string
      }

export type IntegrationExtra<
    T extends IntegrationType
> = T extends IntegrationType.FacebookIntegrationType
    ? {
          max_account_ads: number
      }
    : T extends IntegrationType.GorgiasChatIntegrationType
    ? {
          bundleUrl: string
          chatUrl: string
          wsUrl: string
      }
    : never
