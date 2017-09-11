import axios from 'axios'
import {fromJS} from 'immutable'
import * as types from './constants'

export function setMeta(meta = {}) {
    return {
        type: types.SET_STATS_META,
        meta
    }
}

export function setFilter(filterName, values) {
    return {
        type: types.SET_STATS_FILTER,
        name: filterName,
        values,
    }
}

export function fetchStat(name, newMeta = {}, newFilters = {}) {
    return (dispatch, getState) => {
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
            type: types.FETCH_STATS_START
        })

        return axios.post(`/api/stats/${name}/`, params)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_STATS_SUCCESS,
                    name,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.FETCH_STATS_ERROR,
                    error,
                    reason: 'Unable to receive stats'
                })
            })
    }
}
