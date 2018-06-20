// @flow
import axios from 'axios'
import * as constants from './constants'
import type {dispatchType} from '../types'


export const fetchCurrentAuths = () => (dispatch: dispatchType): Promise<dispatchType> => {
    return axios.get('/api/users/0/auths/')
        .then((json = {}) => json.data.data)
        .then((resp) => {
            return dispatch({
                type: constants.FETCH_USER_AUTHS_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: constants.FETCH_USER_AUTHS_ERROR,
                error,
                reason: 'Unable to get current authentification tokens.'
            })
        })
}
