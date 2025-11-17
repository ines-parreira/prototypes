import type { ReactNode } from 'react'

type Category = 'customer' | 'order'

export type BaseGuidanceVariable<T extends Category> = {
    name: string
    value: string
    category: T
}

type ShopifyCustomerVariable = BaseGuidanceVariable<'customer'>
type ShopifyOrderVariable = BaseGuidanceVariable<'order'>

export type GuidanceVariable = ShopifyCustomerVariable | ShopifyOrderVariable

export type GuidanceVariableGroup = {
    name: string
    variables: (GuidanceVariable | GuidanceVariableGroup)[]
    icon?: ReactNode
}

export type GuidanceVariableList = (GuidanceVariable | GuidanceVariableGroup)[]
