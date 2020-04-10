// @flow

import axios, {type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type CancelTokenSource} from 'axios'
import {fromJS, type List, type Map, type Record} from 'immutable'

import type {IntegrationDataItem, IntegrationDataItemType} from '../models/integration'
import * as Shopify from '../constants/integrations/shopify'
import type {AuditLogEvent} from '../models/event'

export type GorgiasApiOptions = {
    requestsCancellation: boolean,
}

export type PaginatedResponse<T> = {
    data: Array<T>,
    object: string,
    uri: string,
    meta: {
        page: number,
        per_page: number,
        current_page: string,
        item_count: number,
        nb_pages: number,
        next_page?: string,
    },
}

export type SearchResultType = {
    id: number,
}

export default class GorgiasApi {
    _api: AxiosInstance
    _requestCanceller: CancelTokenSource

    static _getDraftOrderPollingConfig(responseData: Shopify.PollingConfig): ?Shopify.PollingConfig {
        let pollingConfig: ?Shopify.PollingConfig = null

        if (responseData.retry_after) {
            pollingConfig = {
                location: responseData.location,
                retry_after: parseInt(responseData.retry_after, 10),
            }
        }

        return pollingConfig
    }

    constructor({requestsCancellation: requestsCancellation = true}: GorgiasApiOptions = {}) {
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
    cancelPendingRequests(refreshToken: boolean = false) {
        if (!this._requestCanceller) {
            throw new Error('Cannot call `.cancelPendingRequests()` on this instance ' +
                'because it was not created with this ability.')
        }

        this._requestCanceller.cancel()

        if (refreshToken) {
            this._refreshCancellationToken()
        }
    }

    /**
     * Yield each page of requested items until last page is reached
     *
     * @param {string} url - URL of the endpoint to call
     * @param {AxiosRequestConfig} [config] Axios config
     * @returns {AsyncGenerator<Array<T>, void, void>}
     */
    async* paginate<T>(url: string, config?: AxiosRequestConfig): AsyncGenerator<Array<T>, void, void> {
        let path: ?string = url

        while (path) {
            const response: AxiosResponse<PaginatedResponse<T>> = await this._api.get(path, config)
            const {data: {data, meta}} = response
            yield data
            path = meta.next_page
        }
    }

    /**
     * Fetch a statistic
     *
     * @param {String} name - the name of the statistic to fetch
     * @param {Map} data - The data to sent. Available parameters:
     *  - {Map} filters: the filters to apply on the statistics
     * @returns {Promise}
     */
    async getStatistic(name: string, data: Map<*, *>) {
        const config = {timeout: 60000 * 3}
        const resp = await this._api.post(`/api/stats/${name}/`, data.toJS(), config)
        return fromJS(resp.data)
    }

    /**
     * Download a statistic
     *
     * @param {String} name - the name of the statistic to download
     * @param {Map} data - The data to sent. Available parameters:
     *  - {Map} filters: the filters to apply on the statistics
     * @returns {Promise}
     */
    async downloadStatistic(name: string, data: Map<*, *>) {
        const params = {
            responseType: 'blob',
            ...data.toJS()
        }
        const config = {timeout: 60000 * 3}
        const resp = await this._api.post(`/api/stats/${name}/download`, params, config)
        const reFilename = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/
        const contentDisposition = resp.headers['content-disposition'] || ''
        const matches = contentDisposition.match(reFilename)
        const filename = matches.length ? matches.pop() : `${name}.csv`
        return fromJS({
            name: filename,
            contentType: resp.headers['content-type'],
            data: resp.data
        })
    }

    /**
     * Create a new subscription with no trial period or end the trial period of an existing subscription.
     *
     * @return - A Gorgias Subscription and its last payment.
     */
    async startSubscription(): Map<*, *> {
        const resp = await this._api.put('/api/billing/subscription/start/', {})
        return fromJS(resp.data)
    }

    /**
     * Pay an invoice.
     *
     * @param {string} invoiceId - The ID of the invoice to pay.
     * @return - The invoice attempted to be paid.
     */
    async payInvoice(invoiceId: string): Map<*, *> {
        const resp = await this._api.put(`/api/billing/invoices/${invoiceId}/pay/`, {})
        return fromJS(resp.data)
    }

    /**
     * Confirm the payment of an invoice.
     *
     * @param {string} invoiceId - the ID of the invoice to confirm the payment for.
     * @return - The information related to the payment.
     */
    async confirmInvoicePayment(invoiceId: string): Map<*, *> {
        const resp = await this._api.put(`/api/billing/invoices/${invoiceId}/confirm-payment/`, {})
        return fromJS(resp.data)
    }

    /**
     * Update the credit card of the current account.
     *
     * @param {Map} data - The data to sent.
     * @return - A Stripe credit card.
     */
    async updateCreditCard(data: Map<*, *>): Map<*, *> {
        const resp = await this._api.put('/api/billing/credit-card/', data.toJS())
        return fromJS(resp.data)
    }

    /**
     * Yield each page of events until last page is reached
     *
     * @param {number} ticketId
     * @returns {AsyncGenerator<List<Record<AuditLogEvent>>, void, Array<AuditLogEvent>>}
     */
    async* getTicketEvents(ticketId: number): AsyncGenerator<List<Record<AuditLogEvent>>, void, Array<AuditLogEvent>> {
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
     *
     * @param {string} endpoint
     * @param {string} filter
     * @returns {Promise<Array<SearchResultType>>}
     */
    async search(endpoint: string, filter: string): Promise<Array<SearchResultType>> {
        const params = filter.length ? {filter} : {}
        const response = await this._api.get(endpoint, {params})

        return response.data.data
    }

    /**
     * Yield integration data items that match given IDs
     *
     * @param {number} integrationId
     * @param {IntegrationDataItemType} integrationDataItemType
     * @param {Array<string | number>} externalIds
     * @returns {AsyncGenerator<List<IntegrationDataItem<T>>, void, Array<IntegrationDataItem<T>>>}
     */
    async* getIntegrationDataItems<T>(
        integrationId: number,
        integrationDataItemType: IntegrationDataItemType,
        externalIds: Array<string | number>,
    ): AsyncGenerator<List<IntegrationDataItem<T>>, void, Array<IntegrationDataItem<T>>> {
        const pages = this.paginate(`/api/integrations/${integrationId}/${integrationDataItemType}`, {
            params: {
                external_ids: externalIds.join(','),
            },
        })

        for await (const items of pages) {
            yield fromJS(items)
        }
    }

    async _upsertDraftOder(
        integrationId: number,
        payload: Record<$Shape<Shopify.DraftOrder>>,
        {draftOrderId, params = {}}: {draftOrderId?: ?number, params?: Object} = {},
    ): Promise<[Record<Shopify.DraftOrder>, ?Shopify.PollingConfig]> {
        let method
        let url

        if (draftOrderId) {
            method = this._api.put
            url = `/integrations/shopify/order/draft/${draftOrderId}/`
        } else {
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
            fromJS(response.data.draft_order),
            GorgiasApi._getDraftOrderPollingConfig(response.data),
        ]
    }

    async createDraftOrder(
        integrationId: number,
        payload: Record<$Shape<Shopify.DraftOrder>>,
        orderId?: ?number,
    ): Promise<[Record<Shopify.DraftOrder>, ?Shopify.PollingConfig]> {
        const params = orderId ? {order_id: orderId} : {}
        return await this._upsertDraftOder(integrationId, payload, {params})
    }

    async upsertDraftOrder(
        integrationId: number,
        payload: Record<$Shape<Shopify.DraftOrder>>,
        draftOrderId: ?number,
    ): Promise<[Record<Shopify.DraftOrder>, ?Shopify.PollingConfig]> {
        // TODO(@samy): remove warning if it never happens
        const variantIds = payload.get('line_items', [])
            .map((lineItem) => lineItem.get('variant_id'))
            .filter((variantId) => !!variantId)

        const uniqueVariantIds = new Set(variantIds)

        if (variantIds.size !== uniqueVariantIds.size) {
            console.warn('[SHOPIFY][duplicate-order] Updating draft order with duplicated rows', payload.toJS())
        }

        return await this._upsertDraftOder(integrationId, payload, {draftOrderId})
    }

    async getDraftOrder(
        integrationId: number,
        draftOrderId: number,
    ): Promise<[Record<Shopify.DraftOrder>, ?Shopify.PollingConfig]> {
        const response = await this._api.get(`/integrations/shopify/order/draft/${draftOrderId}/`, {
            params: {
                integration_id: integrationId,
            },
        })

        return [
            fromJS(response.data.draft_order),
            GorgiasApi._getDraftOrderPollingConfig(response.data),
        ]
    }

    async deleteDraftOrder(integrationId: number, draftOrderId: number): Promise<void> {
        await this._api.delete(`/integrations/shopify/order/draft/${draftOrderId}/`, {
            params: {
                integration_id: integrationId,
            },
        })
    }

    async emailDraftOrderInvoice(
        integrationId: number,
        draftOrderId: number,
        invoicePayload: Record<Shopify.DraftOrderInvoice>,
    ): Promise<void> {
        await this._api.post(`/integrations/shopify/order/draft/${draftOrderId}/send-invoice/`, invoicePayload.toJS(), {
            params: {
                integration_id: integrationId,
            },
        })
    }

    async calculateRefund(
        integrationId: number,
        orderId: number,
        payload: Record<$Shape<Shopify.Refund>>
    ): Promise<Record<Shopify.Refund>> {
        const response = await this._api.post(
            `/integrations/shopify/order/${orderId}/refunds/calculate/`,
            payload.toJS(),
            {
                params: {
                    integration_id: integrationId,
                },
            },
        )

        return fromJS(response.data.refund)
    }
}
