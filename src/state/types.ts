import {Map, List} from 'immutable'
import {Action} from 'redux'
import {ThunkDispatch} from 'redux-thunk'

import {Integration, IntegrationType} from '../models/integration/types'

import {BillingContactResponse, Subscription} from './billing/types'
import {AccountSetting} from './currentAccount/types'
import {MacrosAction} from './entities/macros/types'
import {EntitiesState} from './entities/reducers'
import {InfobarActionsState} from './infobarActions/types'
import rootReducer from './reducers'
import {HTTPIntegrationEvent} from './HTTPIntegrationEvents/types'

export type StoreState = {
    activity: Map<any, any>
    agents: Map<any, any>
    auths: List<any>
    billing: Map<any, any>
    currentAccount: Map<any, any>
    currentUser: Map<any, any>
    customers: Map<any, any>
    entities: EntitiesState
    facebookAds: Map<any, any>
    HTTPIntegrationEvents: Map<any, any>
    infobar: Map<any, any>
    infobarActions: InfobarActionsState
    integrations: Map<any, any>
    layout: Map<any, any>
    macros: Map<any, any>
    newMessage: Map<any, any>
    notifications: Map<any, any>
    rules: Map<any, any>
    schemas: Map<any, any>
    stats: Map<any, any>
    tags: Map<any, any>
    ticket: Map<any, any>
    tickets: Map<any, any>
    usersAudit: Map<any, any>
    views: Map<any, any>
    widgets: Map<any, any>
}
export type StoreAction = MacrosAction | GorgiasAction

export type GorgiasAction = {
    type: string
    resp?: unknown
    roles?: unknown
    id?: string | number
    data?: unknown
    planId?: string
    invoice?: Map<any, any>
    creditCard?: Map<any, any>
    billingContact?: BillingContactResponse
    tickets?: List<any>
    ticket?: Map<any, any>
    ticketId?: number
    userId?: number
    subscription?: Subscription
    setting?: AccountSetting
    isUpdate?: boolean
    settingType?: string
    status?: boolean
    viewType?: string
    customerId?: number
    shouldDisplayHistoryOnNextPage?: boolean
    ids?: number[]
    events?: HTTPIntegrationEvent[]
    event?: HTTPIntegrationEvent
    callback?: (arg: unknown) => void
    loading?: boolean
    message?: string
    orderId?: number
    payload?: unknown
    lineItems?: List<any>
    refund?: Map<any, any>
    amount?: number
    restock?: boolean
    draftOrder?: Map<any, any>
    products?: Map<any, any>
    defaultShippingLine?: string
    integration?: Integration | Map<any, any>
    response?: Record<string, any>
    integrationId?: number
    integrationType?: IntegrationType
    forceOverride?: boolean
    panelName?: string
}

export type CurrentUser = Map<any, any>
export type CurrentAccount = Map<any, any>

export type StoreDispatch = ThunkDispatch<StoreState, undefined, Action>

export type RootState = ReturnType<typeof rootReducer>
