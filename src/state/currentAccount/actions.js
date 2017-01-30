import axios from 'axios'
import * as types from './constants'
import {notify} from '../notifications/actions'

export const updateAccount = (values) => (dispatch => {
    dispatch({type: types.UPDATE_ACCOUNT_START})

    return axios.put('/api/account/', values)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.UPDATE_ACCOUNT_SUCCESS,
                resp
            })
            dispatch(notify({
                type: 'success',
                message: 'Account settings successfully updated!'
            }))
        }, error => {
            return dispatch({
                type: types.UPDATE_ACCOUNT_ERROR,
                error,
                reason: 'Failed to update account settings'
            })
        })
})
