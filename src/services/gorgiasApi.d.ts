import {AxiosRequestConfig} from 'axios'
import {Map, List} from 'immutable'

import {PollingConfig} from '../constants/integrations/types/shopify'
import {AuditLogEvent} from '../models/event/types'
import {
    IntegrationDataItem,
    IntegrationDataItemType,
} from '../models/integration/types'

export = GorgiasApi

declare class GorgiasApi {
    constructor(options?: {requestsCancellation?: boolean})

    cancelPendingRequests: (refreshToken?: boolean) => void

    paginate: <T>(
        url: string,
        config?: AxiosRequestConfig
    ) => AsyncGenerator<T[], void, void>

    getStatistic: (name: string, data: Map<any, any>) => Promise<Map<any, any>>

    downloadStatistic: (
        name: string,
        data: Map<any, any>
    ) => Promise<Map<any, any>>

    startSubscription: () => Promise<Map<any, any>>

    payInvoice: (invoiceId: string) => Promise<Map<any, any>>

    confirmInvoicePayment: (invoiceId: string) => Promise<Map<any, any>>

    updateCreditCard: (data: Map<any, any>) => Promise<Map<any, any>>

    getTicketEvents: (
        ticketId: number
    ) => AsyncGenerator<List<any>, void, AuditLogEvent[]>

    resendAccountVerificationEmail: () => Promise<void>

    search: (endpoint: string, filter: string) => Promise<{id: number}[]>

    getIntegrationDataItems: <T>(
        integrationId: number,
        integrationDataItemType: IntegrationDataItemType,
        externalIds: (string | number)[]
    ) => AsyncGenerator<List<any>, void, Maybe<IntegrationDataItem<T>[]>>

    createDraftOrder: (
        integrationId: number,
        payload: Map<any, any>,
        orderId?: Maybe<number>
    ) => Promise<[Map<any, any>, Maybe<PollingConfig>]>

    upsertDraftOrder: (
        integrationId: number,
        payload: Map<any, any>,
        draftOrderId: Maybe<number>
    ) => Promise<[Map<any, any>, Maybe<PollingConfig>]>

    getDraftOrder: (
        integrationId: number,
        draftOrderId: number
    ) => Promise<[Map<any, any>, Maybe<PollingConfig>]>

    deleteDraftOrder: (
        integrationId: number,
        draftOrderId: number
    ) => Promise<void>

    emailDraftOrderInvoice: (
        integrationId: number,
        draftOrderId: number,
        invoicePayload: Map<any, any>
    ) => Promise<void>

    calculateRefund: (
        integrationId: number,
        orderId: number,
        payload: Map<any, any>
    ) => Promise<Map<any, any>>
}
