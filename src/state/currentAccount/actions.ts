import {AxiosError} from 'axios'
import _capitalize from 'lodash/capitalize'
import {Map} from 'immutable'

import {ProductData, Subscription} from '../billing/types'
import GorgiasApi from '../../services/gorgiasApi'
import {notify} from '../notifications/actions'
import {Notification, NotificationStatus} from '../notifications/types'
import {StoreDispatch} from '../types'
import client from '../../models/api/resources'

import {GorgiasApiError, isGorgiasApiError} from '../../models/api/types'
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

const isAccountSettingWithId = (
    setting: Omit<AccountSetting, 'id'> & {id?: number}
): setting is AccountSetting => {
    return 'id' in setting && setting.id !== undefined
}

export function submitSetting(
    setting: Omit<AccountSetting, 'id'> & {id?: number},
    notification?: string
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const promise = isAccountSettingWithId(setting)
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

                    return dispatch(
                        submitSettingSuccess(
                            setting,
                            isAccountSettingWithId(setting)
                        )
                    )
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
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .put<Record<string, string>>(
                '/api/billing/subscription/',
                subscription
            )
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

export function updateSubscriptionsForPlans(
    products: ProductData,
    notifications: Notification[]
) {
    return async (dispatch: StoreDispatch): Promise<void> => {
        await client.put<Record<string, string>>('/api/billing/subscription/', {
            prices: Object.values(products),
        })

        dispatch({
            type: constants.UPDATE_SUBSCRIPTION_PRODUCTS,
            products,
        })

        notifications.forEach((notification) => {
            void dispatch(notify(notification))
        })
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

export function cancelHelpdeskAutoRenewal() {
    return (dispatch: StoreDispatch): Promise<boolean> => {
        return client
            .put<Record<string, string>>('/api/billing/subscription/', {
                cancel_at_the_end_of_current_period: true,
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch({
                        type: constants.UPDATE_SUBSCRIPTION_SUCCESS,
                        subscription: {
                            scheduled_to_cancel_at: resp.scheduled_to_cancel_at,
                        },
                    })
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message:
                                'Your Helpdesk auto-renewal has been cancelled.',
                        })
                    )

                    return true
                },
                (error: GorgiasApiError) => {
                    const message = isGorgiasApiError(error)
                        ? error.response.data.error.msg
                        : `Failed to cancel Helpdesk auto-renewal. If the problem persists, 
                           please contact our billing team via chat or at 
                           <a href="mailto:support@gorgias.com">support@gorgias.com</a> to make this change.`

                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: message,
                            allowHTML: true,
                        })
                    )
                    return false
                }
            )
    }
}
