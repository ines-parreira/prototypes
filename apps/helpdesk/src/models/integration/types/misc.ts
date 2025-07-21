import { IntegrationType } from '../constants'
import { Integration } from './index'

type AuthenticationStatus = 'pending' | 'success' | 'error' | ''

export type OAuth2 = {
    status: AuthenticationStatus
    error: string
    scope: string
}

export type AutoResponder = {
    enabled: boolean
    reply: string
}

export type IntegrationAuthentication<T extends IntegrationType> =
    T extends IntegrationType.Aircall
        ? {
              show_old_url: boolean
              webhook_url: string
              webhook_url_new: string
          }
        : T extends IntegrationType.Email
          ? {
                forwarding_email_address: string
            }
          : T extends IntegrationType.Facebook
            ? {
                  redirect_uri: string
                  redirect_uri_reconnect: string
              }
            : {
                  redirect_uri: string
              }

export type IntegrationExtra<T extends IntegrationType> =
    T extends IntegrationType.GorgiasChat
        ? {
              bundleUrl: string
              chatUrl: string
              wsUrl: string
              shopifyCheckoutChatBannerVisible: boolean
          }
        : never

export enum IntegrationDataItemType {
    IntegrationDataItemTypeProduct = 'product',
}

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
    additional_info?: Record<string, any>
}

export type ProductCardDetails = {
    fullProductTitle?: string
    imageUrl: string
    link: string
    variantTitle?: string
    price?: string
    compareAtPrice?: string
    productTitle?: string
    productId: number
    variantId: number
    currency?: string
}

export type IntegrationFromType<T extends Integration['type']> = Extract<
    Integration,
    { type: T }
>

export type StoreIntegration = IntegrationFromType<
    | IntegrationType.Shopify
    | IntegrationType.Magento2
    | IntegrationType.BigCommerce
>
