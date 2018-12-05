// @flow
import axios from 'axios'
import * as constants from './constants'

import type {dispatchType, actionType} from '../types'
import {saveFileAsDownloaded} from '../../utils/file'

export function setMeta(meta: {} = {}): actionType {
    return {
        type: constants.SET_STATS_META,
        meta
    }
}

export function setFilters(filters: Object): actionType {
    return {
        type: constants.SET_STATS_FILTERS,
        filters
    }
}

/**
 * Fetch a statistic
 *
 * @param {String} name - the name of the statistic to fetch
 * @param {Object} meta - the period (datetimes)
 * @param {Object} filters - the filters to apply on the statistics
 * @param {String} label - the key under which the statistic will be saved in the reducer
 * @returns {Promise}
 */
export function fetchStat(name: string, meta: {} = {}, filters: {} = {}, label: string) {
    return (dispatch: dispatchType) => {
        const params = {
            ...meta,
            filters: filters,
        }
        const config = {timeout: 60000 * 3}

        return axios.post(`/api/stats/${name}/`, params, config)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: constants.FETCH_STATS_SUCCESS,
                    name: label || name,
                    resp
                })
            }, error => {
                return dispatch({
                    type: constants.FETCH_STATS_ERROR,
                    error,
                    reason: 'Failed to retrieve statistics'
                })
            })
    }
}

/**
 * Download a statistic
 *
 * @param {String} name - the name of the statistic to download
 * @param {Object} meta - the period (datetimes)
 * @param {Object} filters - the filters to apply on the statistics
 * @returns {Promise}
 */
export function downloadStatistic(name: string, meta: {} = {}, filters: {} = {}) {
    return (dispatch: dispatchType) => {
        const params = {
            responseType: 'blob',
            ...meta,
            filters: filters,
        }
        const config = {timeout: 60000 * 3}
        return axios.post(`/api/stats/${name}/download`, params, config)
            .then(resp => {
                const reFilename =/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/
                const contentDisposition = resp.headers['content-disposition'] || ''
                const matches = contentDisposition.match(reFilename)
                const filename = matches.length ? matches.pop() : `${name}.csv`
                saveFileAsDownloaded(resp.data, filename, resp.headers['content-type'])

                return {
                    contentType: resp.headers['content-type'],
                    data: resp.data,
                    name: filename
                }
            })

            .catch(error => {
                return dispatch({
                    type: constants.FETCH_STATS_ERROR,
                    error,
                    reason: 'Failed to download statistics'
                })
            })
    }
}

