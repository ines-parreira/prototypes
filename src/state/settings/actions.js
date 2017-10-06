// @flow
import axios from 'axios'
import * as constants from './constants'

import type {dispatchType} from '../types'

export function fetchSettings() {
    return (dispatch: dispatchType): Promise<dispatchType> => {
        dispatch({
            type: constants.FETCH_SETTINGS_START
        })

        return axios.get('/api/settings/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: constants.FETCH_SETTINGS_SUCCESS,
                    resp
                })
            }, error => {
                return dispatch({
                    type: constants.FETCH_SETTINGS_ERROR,
                    error,
                    reason: 'Failed to fetch settings'
                })
            })
    }
}
