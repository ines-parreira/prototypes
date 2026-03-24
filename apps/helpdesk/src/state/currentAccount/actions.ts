import type { SelectedPlans } from '@repo/billing'
import type { AxiosError } from 'axios'
import type { Map } from 'immutable'
import _capitalize from 'lodash/capitalize'

import { AgentAvailabilityTableViews } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { AgentsTableViews } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { ChannelsTableViews } from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ProductInsightsTableViews } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import type {
    AgentAvailabilityTableColumn,
    AgentsTableColumn,
    AgentsTableRow,
    ChannelsTableColumns,
    ProductInsightsTableColumns,
    TableView,
} from 'domains/reporting/state/ui/stats/types'
import { getAccountSettings } from 'models/account/resources'
import client from 'models/api/resources'
import type { GorgiasApiError } from 'models/api/types'
import { isGorgiasApiError } from 'models/api/types'
import GorgiasApi from 'services/gorgiasApi'
import type { ProductToPlanId, Subscription } from 'state/billing/types'
import * as constants from 'state/currentAccount/constants'
import {
    getAgentAvailabilityTableConfigSettingsJS,
    getAgentsTableConfigSettingsJS,
    getChannelsTableConfigSettingsJS,
    getProductInsightsTableConfigSettingsJS,
} from 'state/currentAccount/selectors'
import type { Account, AccountSetting } from 'state/currentAccount/types'
import { AccountSettingType } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'

export const updateAccount =
    (values: Account) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({ type: constants.UPDATE_ACCOUNT_START })

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
                        }),
                    )
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_ACCOUNT_ERROR,
                        error,
                        reason: 'Failed to update account settings',
                    })
                },
            )
    }

export function submitSettingSuccess(
    setting: AccountSetting,
    isUpdate: boolean,
) {
    return {
        type: constants.UPDATE_ACCOUNT_SETTING,
        isUpdate,
        setting,
    }
}

const isAccountSettingWithId = (
    setting: Omit<AccountSetting, 'id'> & { id?: number },
): setting is AccountSetting => {
    return 'id' in setting && setting.id !== undefined
}

export function submitSetting(
    setting: Omit<AccountSetting, 'id'> & { id?: number },
    notification?: string,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const promise = isAccountSettingWithId(setting)
            ? client.put<AccountSetting>(
                  `/api/account/settings/${setting.id}/`,
                  setting,
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
                        }),
                    )

                    return dispatch(
                        submitSettingSuccess(
                            setting,
                            isAccountSettingWithId(setting),
                        ),
                    )
                },
                (error) => {
                    return dispatch({
                        type: constants.UPDATE_ACCOUNT_SETTING_ERROR,
                        error,
                        reason: `Failed to update ${setting.type} settings`,
                    })
                },
            )
    }
}

export function submitAgentTableConfigView(
    activeView: TableView<AgentsTableColumn, AgentsTableRow>,
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const settings = getAgentsTableConfigSettingsJS(getState())
        const currentSettings = settings ? settings.data : AgentsTableViews
        return dispatch(
            submitSetting({
                id: settings?.id,
                type: AccountSettingType.AgentsTableConfig,
                data: {
                    active_view: activeView.id,
                    views: currentSettings.views.find(
                        (view) => view.id === activeView.id,
                    )
                        ? currentSettings.views.map((view) =>
                              view.id === activeView.id ? activeView : view,
                          )
                        : [...currentSettings.views, activeView],
                },
            }),
        )
    }
}

export function submitAgentAvailabilityTableConfigView(
    activeView: TableView<AgentAvailabilityTableColumn, AgentsTableRow>,
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const settings = getAgentAvailabilityTableConfigSettingsJS(getState())
        const currentSettings = settings
            ? settings.data
            : AgentAvailabilityTableViews
        return dispatch(
            submitSetting({
                id: settings?.id,
                type: AccountSettingType.AgentAvailabilityTableConfig,
                data: {
                    active_view: activeView.id,
                    views: currentSettings.views.find(
                        (
                            view: TableView<
                                AgentAvailabilityTableColumn,
                                AgentsTableRow
                            >,
                        ) => view.id === activeView.id,
                    )
                        ? currentSettings.views.map(
                              (
                                  view: TableView<
                                      AgentAvailabilityTableColumn,
                                      AgentsTableRow
                                  >,
                              ) =>
                                  view.id === activeView.id ? activeView : view,
                          )
                        : [...currentSettings.views, activeView],
                },
            }),
        )
    }
}

export function submitChannelsTableConfigView(
    activeView: TableView<ChannelsTableColumns, never>,
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const settings = getChannelsTableConfigSettingsJS(getState())
        const currentSettings = settings ? settings.data : ChannelsTableViews
        return dispatch(
            submitSetting({
                id: settings?.id,
                type: AccountSettingType.ChannelsTableConfig,
                data: {
                    active_view: activeView.id,
                    views: currentSettings.views.find(
                        (view) => view.id === activeView.id,
                    )
                        ? currentSettings.views.map((view) =>
                              view.id === activeView.id ? activeView : view,
                          )
                        : [...currentSettings.views, activeView],
                },
            }),
        )
    }
}

export function submitProductInsightsTableConfigView(
    activeView: TableView<ProductInsightsTableColumns, never>,
) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const settings = getProductInsightsTableConfigSettingsJS(getState())
        const currentSettings = settings
            ? settings.data
            : ProductInsightsTableViews
        return dispatch(
            submitSetting(
                {
                    id: settings?.id,
                    type: AccountSettingType.ProductInsightsTableConfig,
                    data: {
                        active_view: activeView.id,
                        views: currentSettings.views.find(
                            (view) => view.id === activeView.id,
                        )
                            ? currentSettings.views.map((view) =>
                                  view.id === activeView.id ? activeView : view,
                              )
                            : [...currentSettings.views, activeView],
                    },
                },
                'Product centric insights table settings saved',
            ),
        )
    }
}

type SubscriptionUpdateResponse = {
    products: ProductToPlanId
}

export function updateSubscription(subscription: Subscription) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .put<SubscriptionUpdateResponse>(
                '/api/billing/subscription/',
                subscription,
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Your subscription was updated.',
                        }),
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
                },
            )
    }
}

export function updateSubscriptionsForPlans(
    products: ProductToPlanId,
    notifications: Notification[],
) {
    return async (dispatch: StoreDispatch): Promise<void> => {
        const response = await client.put<SubscriptionUpdateResponse>(
            '/api/billing/subscription/',
            {
                prices: Object.values(products),
            },
        )

        dispatch({
            type: constants.UPDATE_SUBSCRIPTION_PRODUCTS,
            products: response.data.products,
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
        return client.put('/api/account/owner/', { id: userId }).then(
            () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'The account owner was successfully​ changed.',
                    }),
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
            },
        )
    }

export const fetchAccountSettings =
    (type?: string | null) =>
    async (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({ type: constants.FETCH_ACCOUNT_SETTINGS_START })
        try {
            const accountSettings = await getAccountSettings(type)
            return dispatch({
                type: constants.FETCH_ACCOUNT_SETTINGS_SUCCESS,
                accountSettings,
            })
        } catch (error) {
            return dispatch({
                type: constants.FETCH_ACCOUNT_SETTINGS_ERROR,
                error,
                reason: 'Failed to fetch account settings',
            })
        }
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
                }),
            )
        } catch (exc) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: (exc as AxiosError<{ error: { msg: string } }>)
                        .response?.data.error.msg,
                }),
            )
        }
    }

export type cancelHelpdeskAutoRenewalResponse = {
    scheduled_to_cancel_at: string
}

export function cancelHelpdeskAutoRenewal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _selectedPlans?: SelectedPlans,
) {
    return (dispatch: StoreDispatch): Promise<boolean> => {
        return client
            .post<cancelHelpdeskAutoRenewalResponse>(
                '/api/billing/subscription/cancel/',
                {},
            )
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
                        }),
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
                        }),
                    )
                    return false
                },
            )
    }
}
