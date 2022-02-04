import {Map, List} from 'immutable'
import {AnyAction} from 'redux'
import {ThunkDispatch} from 'redux-thunk'

import {TicketMessageSourceType, TicketVia} from '../business/types/ticket'
import {
    EmailDomain,
    Integration,
    IntegrationType,
} from '../models/integration/types'
import {PaginationMeta, OrderDirection} from '../models/api/types'

import {BillingContact, Subscription} from './billing/types'
import {AccountSetting} from './currentAccount/types'
import {MacrosAction} from './entities/macros/types'
import {AuditLogEventsAction} from './entities/auditLogEvents/types'
import {EntitiesState} from './entities/reducers'
import {InfobarActionsState} from './infobarActions/types'
import {Message} from './newMessage/types'
import rootReducer from './reducers'
import {HelpCenterState} from './helpCenter'
import {HTTPIntegrationEvent} from './HTTPIntegrationEvents/types'
import {Rule, RulePriority, RuleOperation} from './rules/types'
import {Tag} from './tags/types'
import {Customer} from './customers/types'
import {UIState} from './ui/reducers'
import {Widget, WidgetContextType} from './widgets/types'
import {TwilioState} from './twilio/types'
import {Notification} from './notifications/types'

export type StoreState = {
    agents: Map<any, any>
    auths: List<any>
    billing: Map<any, any>
    chats: Map<any, any>
    currentAccount: Map<any, any>
    currentUser: Map<any, any>
    customers: Map<any, any>
    entities: EntitiesState
    facebookAds: Map<any, any>
    helpCenter: HelpCenterState
    HTTPIntegrationEvents: Map<any, any>
    infobar: Map<any, any>
    infobarActions: InfobarActionsState
    integrations: Map<any, any>
    layout: Map<any, any>
    macros: Map<any, any>
    newMessage: Map<any, any>
    notifications: Notification[]
    schemas: Map<any, any>
    stats: Map<any, any>
    tags: Map<any, any>
    teams: Map<any, any>
    ticket: Map<any, any>
    tickets: Map<any, any>
    twilio: TwilioState
    ui: UIState
    usersAudit: Map<any, any>
    views: Map<any, any>
    widgets: Map<any, any>
}
export type StoreAction = MacrosAction | AuditLogEventsAction | GorgiasAction

export type GorgiasAction = {
    type: string
    resp?: unknown
    roles?: unknown
    id?: string | number
    data?: unknown
    planId?: string
    invoice?: Map<any, any>
    creditCard?: Map<any, any>
    billingContact?: BillingContact
    tickets?: List<any>
    ticket?: Map<any, any>
    ticketId?: number | string
    ticketVia?: TicketVia
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
    message?: string | null
    orderId?: number
    payload?: unknown
    addresses?: List<Map<any, any>>
    lineItems?: List<any>
    refund?: Map<any, any>
    amount?: number | string
    restock?: boolean
    calculatedDraftOrder?: Map<any, any>
    calculatedOrderId?: string
    calculatedEditOrder?: Map<any, any>
    products?: Map<any, any>
    defaultShippingLine?: string
    integration?: Integration | Map<any, any>
    emailDomain?: EmailDomain | Map<any, any>
    response?: Record<string, any>
    integrationId?: number
    integrationType?: IntegrationType
    forceOverride?: boolean
    panelName?: string
    args?: Map<any, any>
    index?: number
    macro?: Map<any, any>
    messages?: Message[]
    resetMessage?: boolean
    sourceType?: TicketMessageSourceType
    extra?: Record<string, unknown>
    appliedMacro?: Map<any, any>
    forceFocus?: boolean
    forceUpdate?: boolean
    signature?: Map<any, any>
    contentState?: Map<any, any>
    sender?: Map<any, any>
    subject?: string
    receivers?: List<any>
    replaceAll?: boolean
    rule?: Rule
    priorities?: RulePriority[]
    rules?: Rule[]
    path?: List<any>
    value?: string
    operation?: RuleOperation
    schemas?: Map<any, any>
    ruleId?: number
    filters?: Map<any, any>
    tags?: Tag[]
    tag?: Tag
    page?: number
    retry?: boolean
    messageId?: number
    requestId?: number
    spam?: boolean
    trashed_datetime?: string
    snooze_datetime?: string
    actionIndex?: number
    dirty?: boolean
    state?: Map<any, any>
    messagesDifference?: boolean
    customer?: Customer
    cursor?: string
    meta?: PaginationMeta
    viewId?: number
    viewIds?: number[]
    view?: Map<any, any>
    edit?: boolean
    name?: string
    fieldPath?: string
    direction?: OrderDirection
    filter?: Record<string, unknown>
    operator?: string
    configName?: string
    currentViewId?: string
    discreet?: boolean
    counts?: Record<string, unknown>
    items?: Widget[]
    context?: WidgetContextType
    group?: string
    eventType?: 'add' | 'update'
    key?: string
    toIndex?: number
    fromIndex?: number
    targetParentTemplatePath?: string
    source?: Map<any, any>
    widgetType?: Maybe<IntegrationType | 'custom'>
    templatePath?: string
    absolutePath?: string[]
    item?: Map<any, any>
}

export type CurrentUser = Map<any, any>
export type CurrentAccount = Map<any, any>

export type StoreDispatch = ThunkDispatch<StoreState, void, AnyAction>
export type ConnectedAction<
    T extends (
        ...args: any
    ) => (dispatch: StoreDispatch, getState: () => RootState) => any
> = (...args: ArgumentsOf<T>) => ReturnType<ReturnType<T>>

export type RootState = ReturnType<typeof rootReducer>
