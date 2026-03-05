import type { ShopifyMetafield } from '@gorgias/helpdesk-types'

type BaseMetafield = { namespace?: string; key: string }

export type CustomerReferenceMetafield = BaseMetafield & {
    type: 'customer_reference'
    value: string
}

export type CompanyReferenceMetafield = BaseMetafield & {
    type: 'company_reference'
    value: string
}

export type IdMetafield = BaseMetafield & {
    type: 'id'
    value: string
}

export type LinkMetafield = BaseMetafield & {
    type: 'link'
    value: { text: string; url: string }
}

export type CustomerReferenceListMetafield = BaseMetafield & {
    type: 'list.customer_reference'
    value: string[]
}

export type CompanyReferenceListMetafield = BaseMetafield & {
    type: 'list.company_reference'
    value: string[]
}

export type LinkListMetafield = BaseMetafield & {
    type: 'list.link'
    value: Array<{ text: string; url: string }>
}

export type ExtendedMetafieldTypes =
    | CustomerReferenceMetafield
    | CompanyReferenceMetafield
    | IdMetafield
    | LinkMetafield
    | CustomerReferenceListMetafield
    | CompanyReferenceListMetafield
    | LinkListMetafield

export type FullShopifyMetafield = ShopifyMetafield | ExtendedMetafieldTypes
