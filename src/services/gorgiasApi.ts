import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    CancelTokenSource,
} from 'axios'
import {fromJS, List, Map} from 'immutable'

import {IntegrationDataItemType} from '../models/integration/types'
import {ApiListResponsePagination} from '../models/api/types'
import type {
    PollingConfig,
    Refund,
} from '../constants/integrations/types/shopify'
import {AuditLogEvent} from '../models/event/types'

type GorgiasApiOptions = {
    requestsCancellation?: boolean
}

export type SearchResultType = {
    id: number
}

export default class GorgiasApi {
    _api: AxiosInstance
    //@ts-ignore ts(2564)
    _requestCanceller: CancelTokenSource

    static _getDraftOrderPollingConfig(
        responseData: PollingConfig
    ): Maybe<PollingConfig> {
        let pollingConfig: Maybe<PollingConfig> = null

        if (responseData.retry_after) {
            pollingConfig = {
                location: responseData.location,
                retry_after: parseInt(responseData.retry_after as any, 10),
            }
        }

        return pollingConfig
    }

    constructor({requestsCancellation = true}: GorgiasApiOptions = {}) {
        this._api = axios.create()

        if (requestsCancellation) {
            this._refreshCancellationToken()
        }
    }

    _refreshCancellationToken() {
        this._requestCanceller = axios.CancelToken.source()
        this._api.defaults.cancelToken = this._requestCanceller.token
    }

    /**
     * Cancel all pending requests
     */
    cancelPendingRequests(refreshToken = false) {
        if (!this._requestCanceller) {
            throw new Error(
                'Cannot call `.cancelPendingRequests()` on this instance ' +
                    'because it was not created with this ability.'
            )
        }

        this._requestCanceller.cancel()

        if (refreshToken) {
            this._refreshCancellationToken()
        }
    }

    /**
     * Yield each page of requested items until last page is reached
     */
    async *paginate<T>(
        url: string,
        config?: AxiosRequestConfig
    ): AsyncGenerator<Array<T>, void, void> {
        let path: Maybe<string> = url

        while (path) {
            const response: AxiosResponse<ApiListResponsePagination<
                T[]
            >> = await this._api.get(path, config)
            const {
                data: {data, meta},
            } = response
            yield data
            path = meta.next_page
        }
    }

    /**
     * Fetch a statistic
     */
    async getStatistic(name: string, data: Map<any, any>) {
        const config = {timeout: 60000 * 3}
        const resp = await this._api.post(
            `/api/stats/${name}/`,
            data.toJS(),
            config
        )
        return fromJS(resp.data) as Map<any, any>
    }

    /**
     * Download a statistic
     */
    async downloadStatistic(name: string, data: Map<any, any>) {
        const params = {
            ...data.toJS(),
        }
        const config = {timeout: 60000 * 3}
        const resp = await this._api.post(
            `/api/stats/${name}/download`,
            params,
            config
        )
        const reFilename = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/
        const contentDisposition =
            ((resp.headers as Record<string, unknown>)[
                'content-disposition'
            ] as string) || ''
        //eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        const matches = contentDisposition.match(reFilename) as RegExpMatchArray
        const filename = matches.length ? matches.pop() : `${name}.csv`
        return fromJS({
            name: filename,
            contentType: (resp.headers as Record<string, unknown>)[
                'content-type'
            ],
            data: resp.data,
        }) as Map<any, any>
    }

    /**
     * Create a new subscription with no trial period or end the trial period of an existing subscription.
     */
    async startSubscription() {
        const resp = await this._api.put('/api/billing/subscription/start/', {})
        return fromJS(resp.data) as Map<any, any>
    }

    /**
     * Pay an invoice.
     */
    async payInvoice(invoiceId: string) {
        const resp = await this._api.put(
            `/api/billing/invoices/${invoiceId}/pay/`,
            {}
        )
        return fromJS(resp.data) as Map<any, any>
    }

    /**
     * Confirm the payment of an invoice.
     */
    async confirmInvoicePayment(invoiceId: string) {
        const resp = await this._api.put(
            `/api/billing/invoices/${invoiceId}/confirm-payment/`,
            {}
        )
        return fromJS(resp.data) as Map<any, any>
    }

    /**
     * Update the credit card of the current account.
     */
    async updateCreditCard(data: Map<any, any>) {
        const resp = await this._api.put(
            '/api/billing/credit-card/',
            data.toJS()
        )
        return fromJS(resp.data) as Map<any, any>
    }

    /**
     * Yield each page of events until last page is reached
     */
    async *getTicketEvents(
        ticketId: number
    ): AsyncGenerator<List<any>, void, Array<AuditLogEvent>> {
        const pages = this.paginate(`/api/tickets/${ticketId}/events/`)

        for await (const events of pages) {
            yield fromJS(events)
        }
    }

    async resendAccountVerificationEmail() {
        await this._api.post('/api/account/send-verification-email')
    }

    /**
     * Call the given API endpoint with the given filter parameter, and return results
     */
    async search(endpoint: string, filter: string) {
        const params = filter.length ? {filter} : {}
        const response = await this._api.get(endpoint, {params})

        return (response.data as {data: SearchResultType[]}).data
    }

    /**
     * Yield integration data items that match given IDs
     */
    async *getIntegrationDataItems(
        integrationId: number,
        integrationDataItemType: IntegrationDataItemType,
        externalIds: Array<string | number>
    ) {
        const pages = this.paginate(
            `/api/integrations/${integrationId}/${integrationDataItemType}`,
            {
                params: {
                    external_ids: externalIds.join(','),
                },
            }
        )

        for await (const items of pages) {
            yield fromJS(items) as List<any>
        }
    }

    async _upsertDraftOder(
        integrationId: number,
        payload: Map<any, any>,
        {
            draftOrderId,
            params = {},
        }: {draftOrderId?: Maybe<number>; params?: Record<string, unknown>} = {}
    ): Promise<[Map<any, any>, Maybe<PollingConfig>]> {
        let method
        let url

        if (draftOrderId) {
            //eslint-disable-next-line @typescript-eslint/unbound-method
            method = this._api.put
            url = `/integrations/shopify/order/draft/${draftOrderId}/`
        } else {
            //eslint-disable-next-line @typescript-eslint/unbound-method
            method = this._api.post
            url = '/integrations/shopify/order/draft/'
        }

        const response = await method(url, payload.toJS(), {
            params: {
                ...params,
                integration_id: integrationId,
            },
        })

        return [
            fromJS((response.data as {draft_order: Map<any, any>}).draft_order),
            GorgiasApi._getDraftOrderPollingConfig(response.data),
        ]
    }

    async createDraftOrder(
        integrationId: number,
        payload: Map<any, any>,
        orderId?: Maybe<number>
    ): Promise<[Map<any, any>, Maybe<PollingConfig>]> {
        const params = orderId ? {order_id: orderId} : {}
        return await this._upsertDraftOder(integrationId, payload, {params})
    }

    async upsertDraftOrder(
        integrationId: number,
        payload: Map<any, any>,
        draftOrderId: Maybe<number>
    ): Promise<[Map<any, any>, Maybe<PollingConfig>]> {
        // TODO(@samy): remove warning if it never happens
        const variantIds = (payload.get('line_items', []) as List<any>)
            .map(
                (lineItem: Map<any, any>) =>
                    lineItem.get('variant_id') as number
            )
            .filter((variantId) => !!variantId)

        const uniqueVariantIds = new Set(variantIds as any)

        if (variantIds.size !== uniqueVariantIds.size) {
            console.warn(
                '[SHOPIFY][duplicate-order] Updating draft order with duplicated rows',
                payload.toJS()
            )
        }

        return await this._upsertDraftOder(integrationId, payload, {
            draftOrderId,
        })
    }

    async getDraftOrder(
        integrationId: number,
        draftOrderId: number
    ): Promise<[Map<any, any>, Maybe<PollingConfig>]> {
        const response = await this._api.get(
            `/integrations/shopify/order/draft/${draftOrderId}/`,
            {
                params: {
                    integration_id: integrationId,
                },
            }
        )

        return [
            fromJS((response.data as {draft_order: Map<any, any>}).draft_order),
            GorgiasApi._getDraftOrderPollingConfig(response.data),
        ]
    }

    async deleteDraftOrder(
        integrationId: number,
        draftOrderId: string | number
    ): Promise<void> {
        await this._api.delete(
            `/integrations/shopify/order/draft/${draftOrderId}/`,
            {
                params: {
                    integration_id: integrationId,
                },
            }
        )
    }

    async emailDraftOrderInvoice(
        integrationId: number,
        draftOrderId: number,
        invoicePayload: Map<any, any>
    ): Promise<void> {
        await this._api.post(
            `/integrations/shopify/order/draft/${draftOrderId}/send-invoice/`,
            invoicePayload.toJS(),
            {
                params: {
                    integration_id: integrationId,
                },
            }
        )
    }

    async calculateRefund(
        integrationId: number,
        orderId: number,
        payload: Map<any, any>
    ) {
        const response = await this._api.post(
            `/integrations/shopify/order/${orderId}/refunds/calculate/`,
            payload.toJS(),
            {
                params: {
                    integration_id: integrationId,
                },
            }
        )

        return fromJS((response.data as {refund: Refund}).refund) as Map<
            any,
            any
        >
    }

    async getViewSharing(viewId: number) {
        const response = await this._api.get(`/api/views/${viewId}`)
        return fromJS(response.data) as Map<any, any>
    }

    async setViewSharing(
        viewId: number,
        visibility: string,
        teams: List<any>,
        users: List<any>
    ) {
        await this._api.put(`/api/views/${viewId}`, {
            visibility,
            shared_with_teams: teams.map(
                (team: Map<any, any>) => team.get('id') as number
            ),
            shared_with_users: users.map(
                (user: Map<any, any>) => user.get('id') as number
            ),
        })
    }
}
