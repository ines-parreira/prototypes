import axios from 'axios'
import _capitalize from 'lodash/capitalize'
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

export function submitSetting(setting) {
    return (dispatch) => {
        const isUpdate = !!setting.id
        let promise

        if (isUpdate) {
            promise = axios.put(`/api/account/settings/${setting.id}/`, setting)
        } else {
            promise = axios.post('/api/account/settings/', setting)
        }

        return promise
            .then((json = {}) => json.data)
            .then(setting => {
                dispatch(notify({
                    type: 'success',
                    message: `${_capitalize(setting.type)} settings saved`
                }))

                return dispatch({
                    type: types.UPDATE_ACCOUNT_SETTING,
                    isUpdate,
                    setting
                })

            }, error => {
                return dispatch({
                    type: types.UPDATE_ACCOUNT_SETTING_ERROR,
                    error,
                    reason: `Failed to update ${setting.type} settings`
                })
            })
    }
}
