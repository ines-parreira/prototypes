import {AxiosError} from 'axios'
import _capitalize from 'lodash/capitalize'
import {Map} from 'immutable'

import {getPricesByPlanId} from 'models/billing/utils'
import {BillingState, Subscription} from '../billing/types'
import GorgiasApi from '../../services/gorgiasApi'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import {RootState, StoreDispatch} from '../types'
import client from '../../models/api/resources'

import * as constants from './constants'
import {Account, AccountSetting} from './types'

export const updateAccount =
    (values: Account) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({type: constants.UPDATE_ACCOUNT_START})

        return client
            .put<Account>('/api/account/', values)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.UPDATE_ACCOUNT_SUCCESS,
                        resp,
                    })
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Account settings successfully updated!',
                        })
                    )
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_ACCOUNT_ERROR,
                        error,
                        reason: 'Failed to update account settings',
                    })
                }
            )
    }

export function submitSettingSuccess(
    setting: AccountSetting,
    isUpdate: boolean
) {
    return {
        type: constants.UPDATE_ACCOUNT_SETTING,
        isUpdate,
        setting,
    }
}

export function submitSetting(setting: AccountSetting, notification?: string) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = !!setting.id
        const promise = isUpdate
            ? client.put<AccountSetting>(
                  `/api/account/settings/${setting.id}/`,
                  setting
              )
            : client.post<AccountSetting>('/api/account/settings/', setting)

        return promise
            .then((json) => json?.data)
            .then(
                (setting) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message:
                                notification ??
                                `${_capitalize(setting.type)} settings saved`,
                        })
                    )

                    return dispatch(submitSettingSuccess(setting, isUpdate))
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_ACCOUNT_SETTING_ERROR,
                        error,
                        reason: `Failed to update ${setting.type} settings`,
                    })
                }
            )
    }
}

export function updateSubscription(subscription: Subscription) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const products = (state.billing.toJS() as BillingState).products
        const prices = getPricesByPlanId(products, subscription.plan)
        return client
            .put<Record<string, string>>('/api/billing/subscription/', prices)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Your subscription was updated.',
                        })
                    )
                    return dispatch({
                        type: constants.UPDATE_SUBSCRIPTION_SUCCESS,
                        subscription: resp,
                    })
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_SUBSCRIPTION_ERROR,
                        error,
                        reason: 'Failed to update the current subscription.',
                    })
                }
            )
    }
}

/**
 * Set the subscription of the current account.
 */
export const setCurrentSubscription = (subscription: Map<any, any>) => {
    return {
        type: constants.SET_CURRENT_SUBSCRIPTION,
        subscription,
    }
}

/**
 * Transfer the current account ownership to a user
 */
export const updateAccountOwner =
    (userId: number) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client.put('/api/account/owner/', {id: userId}).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'The account owner was successfully​ changed.',
                    })
                )
                return dispatch({
                    type: constants.UPDATE_ACCOUNT_OWNER_SUCCESS,
                    userId,
                })
            },
            (error) => {
                return dispatch({
                    type: constants.UPDATE_ACCOUNT_OWNER_ERROR,
                    error,
                    reason: 'Failed to change the account owner. Please try again in a few seconds.',
                })
            }
        )
    }

export const resendVerificationEmail =
    () =>
    async (dispatch: StoreDispatch): Promise<void> => {
        const gorgiasApi = new GorgiasApi()

        try {
            await gorgiasApi.resendAccountVerificationEmail()
            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'The verification email has been resent!',
                })
            )
        } catch (exc) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: (exc as AxiosError<{error: {msg: string}}>)
                        .response?.data.error.msg,
                })
            )
        }
    }
