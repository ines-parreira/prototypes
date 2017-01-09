import axios from 'axios'
import * as types from './constants'
import {notify} from '../notifications/actions'

export const changePassword = (oldPassword, newPassword) => (dispatch => {
    dispatch({type: types.CHANGE_PASSWORD_START})

    return axios.put('/api/users/0/', {
        old_password: oldPassword,
        new_password: newPassword,
    })
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.CHANGE_PASSWORD_SUCCESS,
                resp
            })
            dispatch(notify({
                type: 'success',
                message: 'Password successfully changed!'
            }))
        })
        .catch(error => {
            return dispatch({
                type: types.CHANGE_PASSWORD_ERROR,
                error,
                reason: 'Failed to modify your password'
            })
        })
})

export function submitSetting(data) {
    return (dispatch) => {
        const isUpdate = !!data.id
        let promise

        dispatch({
            type: types.SUBMIT_SETTING_START
        })

        if (isUpdate) {
            promise = axios.put(`/api/users/0/settings/${data.id}/`, data)
        } else {
            promise = axios.post('/api/users/0/settings/', data)
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.SUBMIT_SETTING_SUCCESS,
                    isUpdate,
                    resp
                })

                return resp
            })
            .catch(error => {
                return dispatch({
                    type: types.SUBMIT_SETTING_ERROR,
                    error,
                    reason: 'Failed to update settings'
                })
            })
    }
}
