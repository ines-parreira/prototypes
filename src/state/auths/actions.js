// @flow
import axios from 'axios'

import type {Dispatch} from '../types'

import * as constants from './constants'

export const fetchCurrentAuths = () => (
    dispatch: Dispatch
): Promise<Dispatch> => {
    return axios
        .get('/api/users/0/auths/')
        .then((json = {}) => json.data.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.FETCH_USER_AUTHS_SUCCESS,
                    resp,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.FETCH_USER_AUTHS_ERROR,
                    error,
                    reason: 'Unable to get current authentification tokens.',
                })
            }
        )
}

export const resetApiKey = () => (dispatch: Dispatch): Promise<Dispatch> => {
    return axios
        .post('/api/users/0/reset-key/')
        .then((json = {}) => json.data)
        .then(
            (resp) => {
                return dispatch({
                    type: constants.RESET_API_KEY_SUCCESS,
                    resp,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.RESET_API_KEY_ERROR,
                    error,
                    reason: 'Unable to reset the API key.',
                })
            }
        )
}
