import axios from 'axios'
import * as types from './constants'

export function fetchStats(startDatetime, endDatetime) {
    let url = '/api/stats/?'
    if (startDatetime) {
        url += `start=${startDatetime}&`
    }
    if (endDatetime) {
        url += `end=${endDatetime}`
    }
    return (dispatch) => {
        dispatch(dispatch({
            type: types.FETCH_STATS_START
        }))

        return axios.get(url)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_STATS_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: 'ERROR',
                    error,
                    reason: 'Unable to receive stats'
                })
            })
    }
}
