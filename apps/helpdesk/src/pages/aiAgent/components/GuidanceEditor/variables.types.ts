import type { ReactNode } from 'react'

type Category = 'customer' | 'order' | 'ticket'

export type BaseGuidanceVariable<T extends Category> = {
    name: string
    value: string
    category: T
}

type ShopifyCustomerVariable = BaseGuidanceVariable<'customer'>
type ShopifyOrderVariable = BaseGuidanceVariable<'order'>
type TicketVariable = BaseGuidanceVariable<'ticket'>

export type GuidanceVariable =
    | ShopifyCustomerVariable
    | ShopifyOrderVariable
    | TicketVariable

export type GuidanceVariableGroup = {
    name: string
    variables: (GuidanceVariable | GuidanceVariableGroup)[]
    icon?: ReactNode
}

export type GuidanceVariableList = (GuidanceVariable | GuidanceVariableGroup)[]
