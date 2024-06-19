import {IntegrationType} from '../constants'
import {ShopifyIntegration} from './shopify'
import {Magento2Integration} from './magento2'
import {BigCommerceIntegration} from './bigcommerce'
import {Integration} from './index'

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
    T extends IntegrationType.Facebook
        ? {
              max_account_ads: number
          }
        : T extends IntegrationType.GorgiasChat
        ? {
              bundleUrl: string
              chatUrl: string
              wsUrl: string
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
}

export type ProductCardDetails = {
    fullProductTitle: string
    imageUrl: string
    link: string
    variantTitle?: string
    price?: string
    productTitle?: string
    productId: number
    variantId: number
    currency?: string
}

export type IntegrationFromType<T extends Integration['type']> = Extract<
    Integration,
    {type: T}
>

export type StoreIntegration =
    | ShopifyIntegration
    | Magento2Integration
    | BigCommerceIntegration
