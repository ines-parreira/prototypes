import {
    Product as IntegrationProduct,
    Variant as IntegrationVariant,
} from '../../constants/integrations/types/shopify'

export enum IntegrationType {
    EmailIntegrationType = 'email',
    GmailIntegrationType = 'gmail',
    OutlookIntegrationType = 'outlook',
    AircallIntegrationType = 'aircall',
    SmoochIntegrationType = 'smooch',
    SmoochInsideIntegrationType = 'smooch_inside',
    FacebookIntegrationType = 'facebook',
    HttpIntegrationType = 'http',
    ShopifyIntegrationType = 'shopify',
    RechargeIntegrationType = 'recharge',
    SmileIntegrationType = 'smile',
    ZendeskIntegrationType = 'zendesk',
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
