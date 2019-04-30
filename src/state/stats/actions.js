// @flow
import axios from 'axios'

import type {dispatchType, actionType} from '../types'
import {saveFileAsDownloaded} from '../../utils/file'
import {getHashOfObj} from '../../utils'

import * as constants from './constants'


export function setFilters(filters: Object): actionType {
    return {
        type: constants.SET_STATS_FILTERS,
        filters
    }
}

export function resetFilters(): actionType {
    return {type: constants.RESET_STATS_FILTERS}
}


/**
 * Fetch a statistic
 *
 * @param {String} name - the name of the statistic to fetch
 * @param {Object} filters - the filters to apply on the statistics
 * @param {String} label - the key under which the statistic will be saved in the reducer
 * @returns {Promise}
 */
export function fetchStat(name: string, filters: Object = {}, label?: string) {
    // Statistics fetched with labels are meant to be used outside the statistics section
    // Of course, the filters used to fetch them do not match the current filters
    // so we don't require the filters to match to save the data fetched.
    const shouldMatchCurrentFilters = !label
    return (dispatch: dispatchType) => {
        const config = {timeout: 60000 * 3}
        return axios.post(`/api/stats/${name}/`, {filters}, config)
            .then((resp) =>resp.data)
            .then((stat) => {
                dispatch({
                    type: constants.FETCH_STATS_SUCCESS,
                    name: label || name,
                    shouldMatchCurrentFilters,
                    filtersHash: shouldMatchCurrentFilters ? getHashOfObj(filters) : null,
                    stat
                })
            }, (error) => {
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
 * @param {Object} filters - the filters to apply on the statistics
 * @returns {Promise}
 */
export function downloadStatistic(name: string, filters: Object = {}) {
    return (dispatch: dispatchType) => {
        const params = {
            responseType: 'blob',
            filters,
        }
        const config = {timeout: 60000 * 3}
        return axios.post(`/api/stats/${name}/download`, params, config)
            .then((resp) => {
                const reFilename =/filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/
                const contentDisposition = resp.headers['content-disposition'] || ''
                const matches = contentDisposition.match(reFilename)
                //$FlowFixMe
                const filename = matches.length ? matches.pop() : `${name}.csv`
                saveFileAsDownloaded(resp.data, filename, resp.headers['content-type'])

                return {
                    contentType: resp.headers['content-type'],
                    data: resp.data,
                    name: filename
                }
            })

            .catch((error) => {
                return dispatch({
                    type: constants.FETCH_STATS_ERROR,
                    error,
                    reason: 'Failed to download statistics'
                })
            })
    }
}

