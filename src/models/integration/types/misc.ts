import {IntegrationType} from '../constants'
import {
    Product as IntegrationProduct,
    Variant as IntegrationVariant,
} from '../../../constants/integrations/types/shopify'

export type OAuth2 = {
    status: string
    error: string
    scope: string
}

export type AutoResponder = {
    enabled: boolean
    reply: string
}

export type IntegrationAuthentication<
    T extends IntegrationType
> = T extends IntegrationType.Aircall
    ? {
          webhook_url: string
      }
    : T extends IntegrationType.Email
    ? {
          forwarding_email_address: string
      }
    : {
          redirect_url: string
      }

export type IntegrationExtra<
    T extends IntegrationType
> = T extends IntegrationType.Facebook
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

export type ProductCardDetails = {
    fullProductTitle: string
    imageUrl: string
    link: string
    variantTitle?: string
    price?: string
    productTitle?: string
    currency?: string
}
