import type { List, Map } from 'immutable'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

import type { Tag } from '@gorgias/helpdesk-queries'

import type { TicketMessageSourceType, TicketVia } from 'business/types/ticket'
import type { StatsState } from 'domains/reporting/state/stats/statsSlice'
import type { LegacyPaginationMeta, OrderDirection } from 'models/api/types'
import type { Customer } from 'models/customer/types'
import type {
    EcommerceStore,
    Shopper,
    ShopperAddress,
    ShopperOrder,
} from 'models/customerEcommerceData/types'
import type { CustomerExternalData } from 'models/customerExternalData/types'
import type { DiscountCode } from 'models/discountCodes/types'
import type {
    EmailDomain,
    EmailMigrationBannerStatus,
    EmailMigrationInboundVerification,
    EmailMigrationInboundVerificationStatus,
    GorgiasChatStatusEnum,
    Integration,
    IntegrationType,
} from 'models/integration/types'
import type { TicketEvent } from 'models/ticket/types'
import type { EntityType, ViewType } from 'models/view/types'
import type { InTicketSuggestionState } from 'state/entities/rules/types'
import type { TopRankMacroState } from 'state/newMessage/ticketReplyCache'

import type { BillingContact } from './billing/types'
import type { AccountSetting } from './currentAccount/types'
import type { CurrentCompanyState } from './currentCompany/types'
import type { AuditLogEventsAction } from './entities/auditLogEvents/types'
import type { MacrosAction } from './entities/macros/types'
import type { EntitiesState } from './entities/reducers'
import type { InfobarActionsState } from './infobarActions/types'
import type { Message } from './newMessage/types'
import type { Notification } from './notifications/types'
import type { QueriesState } from './queries/types'
import type rootReducer from './reducers'
import type { Rule, RuleOperation, RulePriority } from './rules/types'
import type { UIState } from './ui/reducers'
import type { Widget, WidgetEnvironment, WidgetType } from './widgets/types'

export type StoreState = {
    agents: Map<any, any>
    auths: List<any>
    billing: Map<any, any>
    chats: Map<any, any>
    currentAccount: Map<any, any>
    currentCompany: CurrentCompanyState
    currentUser: Map<any, any>
    customers: Map<any, any>
    entities: EntitiesState
    facebookAds: Map<any, any>
    infobar: Map<any, any>
    infobarActions: InfobarActionsState
    integrations: Map<any, any>
    layout: Map<any, any>
    macros: Map<any, any>
    newMessage: Map<any, any>
    notifications: Notification[]
    schemas: Map<any, any>
    stats: StatsState
    tags: Map<any, any>
    teams: Map<any, any>
    ticket: Map<any, any>
    tickets: Map<any, any>
    ui: UIState
    usersAudit: Map<any, any>
    views: Map<any, any>
    widgets: Map<any, any>
    queries: QueriesState
}
export type StoreAction = MacrosAction | AuditLogEventsAction | GorgiasAction

export type GorgiasAction = {
    type: string
    resp?: unknown
    roles?: unknown
    id?: string | number
    fetched?: { data: unknown[]; meta?: Record<string, unknown> }
    data?: unknown
    invoice?: Map<any, any>
    creditCard?: Map<any, any>
    billingContact?: BillingContact
    tickets?: List<any>
    ticket?: Map<any, any>
    ticketId?: number | string
    ticketVia?: TicketVia
    events?: TicketEvent[] | List<TicketEvent>
    userId?: number
    subscription?: Record<string, unknown>
    setting?: AccountSetting
    isUpdate?: boolean
    settingType?: string
    status?: boolean
    viewType?: ViewType
    customerId?: number
    ids?: number[]
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
    emailMigrationBannerStatus?: EmailMigrationBannerStatus
    emailMigrations?: EmailMigrationInboundVerification[]
    emailMigrationVerificationStatus?: EmailMigrationInboundVerificationStatus
    emailForwardingAddress?: string
    response?: Record<string, any>
    integrationId?: number
    appId?: string
    integrationType?: IntegrationType
    forceOverride?: boolean
    panelName?: string
    args?: Map<any, any>
    index?: number
    macro?: Map<any, any>
    topRankMacroState?: TopRankMacroState | null
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
    inTicketSuggestionState?: InTicketSuggestionState
    priorities?: RulePriority[]
    rules?: Rule[]
    path?: List<any>
    value?: string
    operation?: RuleOperation
    schemas?: Map<any, any>
    ruleId?: number
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
    state?: Map<any, any> | boolean
    messagesDifference?: boolean
    customer?: Customer
    cursor?: string
    meta?: LegacyPaginationMeta
    viewId?: number
    viewIds?: number[]
    view?: Map<any, any>
    edit?: boolean
    name?: string
    fieldPath?: string
    direction?: OrderDirection
    filter?: Record<string, unknown>
    operator?: string
    configName?: EntityType
    currentViewId?: string
    discreet?: boolean
    counts?: Record<string, unknown>
    items?: Widget[]
    context?: WidgetEnvironment
    group?: string
    eventType?: 'add' | 'update'
    key?: string
    toIndex?: number
    fromIndex?: number
    targetParentTemplatePath?: string
    source?: Map<any, any>
    widgetType?: WidgetType
    templatePath?: string
    absolutePath?: string[]
    item?: Map<any, any>
    attachments?: List<any>
    externalData?: CustomerExternalData
    chatStatus?: GorgiasChatStatusEnum
    hasError?: boolean
    discountCode?: DiscountCode
    transactions?: List<Map<any, any>>
    queryKey?: string
    store?: EcommerceStore
    storeUUID?: EcommerceStore['uuid']
    shopper?: Shopper
    shopperAddress?: ShopperAddress
    shopperOrder?: ShopperOrder
    withHighlight?: boolean
    shouldStoreFieldConfig?: boolean
    accountSettings?: AccountSetting[]
    customFieldId?: number
    customFieldOperator?: string
    qaScoreDimension?: string
}

export type CurrentUser = Map<any, any>
export type CurrentAccount = Map<any, any>

export type StoreDispatch = ThunkDispatch<StoreState, void, AnyAction>
export type ConnectedAction<
    T extends (
        ...args: any
    ) => (dispatch: StoreDispatch, getState: () => RootState) => any,
> = (...args: ArgumentsOf<T>) => ReturnType<ReturnType<T>>

export type RootState = ReturnType<typeof rootReducer>
