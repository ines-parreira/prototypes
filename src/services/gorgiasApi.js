// @flow

import axios from 'axios'
import {fromJS} from 'immutable'

import type {AxiosInstance, CancelTokenSource} from 'axios'
import type {Map} from 'immutable'

type GorgiasApiOptions = {
    requestsCancellation: boolean,
}

export default class GorgiasApi {
    _api: AxiosInstance
    _requestCanceller: CancelTokenSource

    constructor({requestsCancellation: requestsCancellation = true}: GorgiasApiOptions = {}) {
        this._api = axios.create()

        if (requestsCancellation) {
            this._requestCanceller = axios.CancelToken.source()
            this._api.defaults.cancelToken = this._requestCanceller.token
        }
    }

    /**
     * Cancel all pending requests
     */
    cancelPendingRequests() {
        if (!this._requestCanceller) {
            throw new Error('Cannot call `.cancelPendingRequests()` on this instance ' +
                'because it was not created with this ability.')
        }

        this._requestCanceller.cancel()
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
}
