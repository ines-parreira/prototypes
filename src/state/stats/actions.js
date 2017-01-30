import axios from 'axios'
import {fromJS} from 'immutable'
import * as types from './constants'
import _merge from 'lodash/merge'
import {timesFromPeriod} from '../../pages/stats/common/utils'

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

export function fetchStats(newMeta = {}, newFilters = {}) {
    return (dispatch, getState) => {
        const statsState = getState().stats

        // get current meta
        const meta = statsState.getIn(['_internal', 'meta'], fromJS({}))

        // get current filters
        const filters = statsState.getIn(['_internal', 'filters'], fromJS({})).merge(newFilters)

        // merge with passed meta
        const params = meta.merge(newMeta).toJS()

        // if there is only a period set but no dates, let's add them
        if (params.period && (!params.start_datetime || !params.end_datetime)) {
            const {startDatetime, endDatetime} = timesFromPeriod(params.period)
            _merge(params, {
                start_datetime: startDatetime.format(),
                end_datetime: endDatetime.format(),
            })
        }

        // update stats meta to match what is asked to server
        dispatch(setMeta(params))

        params.filters = filters.toJS()

        dispatch({
            type: types.FETCH_STATS_START
        })

        return axios.get(`/api/stats/?${$.param(params)}`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_STATS_SUCCESS,
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
