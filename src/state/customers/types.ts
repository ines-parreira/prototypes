import {Map} from 'immutable'

import {Order} from '../../constants/integrations/types/shopify'
import {CustomerChannel} from '../../models/customerChannel/types'
import {IntegrationType} from '../../models/integration/types'
import {Subscription} from '../billing/types'

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

export type CustomerIntegration = {
    args: Record<string, unknown>
    headers: Record<string, unknown>
    origin: string
    url: string
    __integration_type__: IntegrationType
    orders?: Order[]
    subscriptions?: Subscription[]
    charges?: Record<string, unknown>[]
}

export type Customer = CustomerDraft & {
    active: boolean
    created_datetime: string
    customer: Maybe<CustomerInformation>
    data: CustomerInformation
    email: string
    external_id: Maybe<string>
    firstname: string
    id: number
    integrations: {
        [key: string]: CustomerIntegration
    }
    language: string
    lastname: string
    meta: unknown
    timezone: string
    updated_datetime: string
}

export type CustomersState = Map<any, any>

export type CustomerExternalData = {[key: string]: Record<string, any>}
