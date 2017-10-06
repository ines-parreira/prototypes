// @flow
import axios from 'axios'
import {fromJS} from 'immutable'
import * as constants from './constants'

import type {dispatchType, actionType, getStateType} from '../types'

export function setMeta(meta: {} = {}): actionType {
    return {
        type: constants.SET_STATS_META,
        meta
    }
}

export function setFilter(filterName: string, values: {}): actionType {
    return {
        type: constants.SET_STATS_FILTER,
        name: filterName,
        values,
    }
}

export function fetchStat(name: string, newMeta: {} = {}, newFilters: {} = {}) {
    return (dispatch: dispatchType, getState: getStateType) => {
        const statsState = getState().stats
        // get current meta
        const meta = statsState.getIn(['_internal', 'meta'], fromJS({}))
        // get current filters
        const filters = statsState.getIn(['_internal', 'filters'], fromJS({})).merge(newFilters)
        // merge with passed meta
        const params = meta.merge(newMeta).toJS()

        // update stats meta to match what is asked to server
        dispatch(setMeta(params))
        params.filters = filters.toJS()

        dispatch({
            type: constants.FETCH_STATS_START
        })

        return axios.post(`/api/stats/${name}/`, params)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: constants.FETCH_STATS_SUCCESS,
                    name,
                    resp
                })
            }, error => {
                return dispatch({
                    type: constants.FETCH_STATS_ERROR,
                    error,
                    reason: 'Unable to receive stats'
                })
            })
    }
}
