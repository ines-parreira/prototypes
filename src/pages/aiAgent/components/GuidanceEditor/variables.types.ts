import { ReactNode } from 'react'

type Category = 'customer' | 'fulfillment' | 'order'

export type BaseGuidanceVariable<T extends Category> = {
    name: string
    value: string
    category: T
}

type ShopifyCustomerVariable = BaseGuidanceVariable<'customer'>
type ShopifyFulfillmentVariable = BaseGuidanceVariable<'fulfillment'>
type ShopifyOrderVariable = BaseGuidanceVariable<'order'>

export type GuidanceVariable =
    | ShopifyCustomerVariable
    | ShopifyFulfillmentVariable
    | ShopifyOrderVariable

export type GuidanceVariableGroup = {
    name: string
    variables: (GuidanceVariable | GuidanceVariableGroup)[]
    icon?: ReactNode
}

export type GuidanceVariableList = (GuidanceVariable | GuidanceVariableGroup)[]
