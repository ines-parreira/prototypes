import {Map} from 'immutable'

import {Order} from '../../constants/integrations/types/shopify'
import {CustomerChannel} from '../../models/customerChannel/types'

type CustomerInformation = {
    city: string
    created: string
    email: string
    firstOrderDate: string
    ltv: number
    name: string
    orderCount: number
    orders: Order[]
    points: number
    _shopify?: {customer: {id: number}}
}

export type CustomerDraft = {
    channels: CustomerChannel[]
    name: string
    note: string
}

export type Customer = CustomerDraft & {
    active: boolean
    created_datetime: string
    customer: CustomerInformation
    data: CustomerInformation
    email: string
    external_id: string
    firstname: string
    id: number
    integration: unknown
    language: string
    lastname: string
    meta: unknown
    timezone: string
    updated_datetime: string
}

export type CustomersState = Map<any, any>
