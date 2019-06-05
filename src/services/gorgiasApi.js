import axios from 'axios'

import {fromJS} from 'immutable'

export default class GorgiasApi {
    constructor({requestsCancellation: requestsCancellation = true} = {}) {
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
}
