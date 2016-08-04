import axios from 'axios'
import * as types from '../constants/settings'

export function fetchSettings() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_SETTINGS_START
        })

        axios.get('/api/settings/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_SETTINGS_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_SETTINGS_ERROR,
                    error,
                    reason: 'Failed to fetch settings'
                })
            })
    }
}
