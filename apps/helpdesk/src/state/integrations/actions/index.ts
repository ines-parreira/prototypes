import { history } from '@repo/routing'
import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _capitalize from 'lodash/capitalize'
import _sortBy from 'lodash/sortBy'
import moment from 'moment'

import { isChannel } from 'config'
import client from 'models/api/resources'
import type {
    ApiListResponseLegacyPagination,
    GorgiasApiError,
} from 'models/api/types'
import { fetchIntegrations as fetchIntegrationsResources } from 'models/integration/resources'
import type {
    GorgiasChatIntegration,
    Integration,
} from 'models/integration/types'
import {
    EmailMigrationInboundVerificationStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
} from 'models/integration/types'
import { getGorgiasChatProtectedApiClient } from 'rest_api/gorgias_chat_protected_api/client'
import type { AplicationAgentsResponse } from 'rest_api/gorgias_chat_protected_api/types'
import GorgiasApi from 'services/gorgiasApi'
import { fetchAccountSettings } from 'state/currentAccount/actions'
import { AccountSettingType } from 'state/currentAccount/types'
import * as constants from 'state/integrations/constants'
import * as integrationSelectors from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'

import * as helpers from '../helpers'
import { isWellKnownEcomIntegrationIdMisMatch } from '../helpers'
import {
    getApplicationTexts as getApplicationTextsAction,
    getInstallationStatus as getInstallationStatusAction,
    getInstallationStatuses as getInstallationStatusesAction,
    getTranslations as getTranslationsAction,
    updateApplicationTexts as updateApplicationTextsAction,
} from './gorgias-chat.actions'

export function fetchIntegrations() {
    return async (
        dispatch: StoreDispatch,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_INTEGRATIONS_START,
        })

        const client = new GorgiasApi()
        const generator = client.cursorPaginate(fetchIntegrationsResources)

        let result: Integration[] = []
        try {
            for await (const page of generator) {
                result = result.concat(page)
            }

            result = _sortBy(result, (integration) =>
                integration.name.toLowerCase(),
            )

            return dispatch({
                type: constants.FETCH_INTEGRATIONS_SUCCESS,
                resp: result,
            })
        } catch (error) {
            dispatch({
                type: constants.FETCH_INTEGRATIONS_ERROR,
                error,
                reason: 'Failed to fetch integrations',
            })
        }
    }
}

/**
 * Fetch deleted integrations which can be activated by the current agent.
 */
function fetchOnboardingIntegrations(
    page = 1,
    integrationType: string,
    forceOverride = true,
    filter = '',
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_ONBOARDING_INTEGRATIONS_START,
        })

        const params = filter ? { page, filter } : { page }

        return client
            .get<ApiListResponseLegacyPagination<Integration[]>>(
                `/integrations/${integrationType}/onboarding-integrations/`,
                {
                    params,
                },
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        integrationType,
                        resp,
                        forceOverride,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.FETCH_ONBOARDING_INTEGRATIONS_ERROR,
                        integrationType,
                        error,
                        reason: 'Failed to fetch onboarding integrations',
                    })
                },
            )
    }
}

/**
 * Fetch Facebook deleted integrations which can be activated by the current agent.
 */
export function fetchFacebookOnboardingIntegrations(
    page = 1,
    forceOverride = true,
) {
    return fetchOnboardingIntegrations(
        page,
        IntegrationType.Facebook,
        forceOverride,
    )
}

export function activateOnboardingIntegrations(
    data: Integration[],
    integrationType: IntegrationType,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_START,
        })

        return client
            .put<ApiListResponseLegacyPagination<Integration[]>>(
                `/integrations/${integrationType}/onboarding-integrations/`,
                data,
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const formattedType = `${_capitalize(
                        integrationType,
                    )} integration${data.length > 1 ? 's' : ''}`

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `${formattedType} successfully activated.`,
                        }),
                    )
                    return dispatch({
                        type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_ERROR,
                        error,
                        reason: `Failed to activate your ${_capitalize(
                            integrationType,
                        )} integration`,
                    })
                },
            )
    }
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully created.
 */
export function onCreateSuccess(
    dispatch: StoreDispatch,
    resp: Integration,
    disableRedirect = false,
    disableSuccessNotification?: boolean,
    message?: string,
) {
    dispatch({
        type: constants.CREATE_INTEGRATION_SUCCESS,
        resp,
    })

    void fetchIntegrations()(dispatch)

    if (!disableRedirect) {
        let nextStep = ''

        if (resp.type === IntegrationType.Email) {
            nextStep = '/forwarding'
        } else if (
            resp.type === IntegrationType.Phone ||
            resp.type === IntegrationType.Sms
        ) {
            nextStep = '/preferences'
        } else if (resp.type === IntegrationType.GorgiasChat) {
            nextStep = '/installation'
        }

        history.push(
            `/app/settings/${
                isChannel(resp.type) ? 'channels' : 'integrations'
            }/${resp.type}/${resp.id || ''}${nextStep}`,
        )
    }

    if (disableSuccessNotification) {
        return
    }

    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: message || 'Integration successfully added',
        }),
    )
}

export function triggerCreateSuccess(integration: Integration) {
    return (dispatch: StoreDispatch) => onCreateSuccess(dispatch, integration)
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully updated.
 */
export function onUpdateSuccess(
    dispatch: StoreDispatch,
    resp: Integration,
    notificationId: Maybe<string> = null,
    disableSuccessNotification?: boolean,
    message?: string,
): Promise<ReturnType<StoreDispatch>> {
    dispatch({
        type: constants.UPDATE_INTEGRATION_SUCCESS,
        resp,
    })

    void fetchIntegrations()(dispatch)

    if (disableSuccessNotification) {
        return Promise.resolve()
    }

    return dispatch(
        notify({
            id: notificationId,
            status: NotificationStatus.Success,
            message: message || 'Integration successfully updated',
        }),
    ) as Promise<Record<string, unknown>>
}

export function fetchIntegration(
    integrationId: string,
    integrationType: IntegrationType,
    waitingForAuthentication = false,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        if (!waitingForAuthentication) {
            dispatch({
                type: constants.FETCH_INTEGRATION_START,
                id: integrationId,
            })
        }

        return client
            .get<Integration>(`/api/integrations/${integrationId}`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    if (
                        //@TODO: [CRMECOM-101] Remove this function after a complete fix is implemented that validates the integration type for all integrations
                        // not just the top 3 ecom ones
                        isWellKnownEcomIntegrationIdMisMatch(
                            resp?.type,
                            integrationType,
                        )
                    ) {
                        history.replace(
                            `/app/settings/integrations/${integrationType}`,
                        )
                        return dispatch({
                            type: constants.FETCH_INTEGRATION_ERROR,
                            error: 'integration type mismatch',
                            reason: `Integration with ID ${integrationId} is not a valid ${integrationType} integration`,
                        })
                    }

                    dispatch({
                        type: constants.FETCH_INTEGRATION_SUCCESS,
                        integration: resp,
                    })

                    if (waitingForAuthentication) {
                        const isPending =
                            (fromJS(resp) as Map<any, any>).getIn(
                                ['meta', 'oauth', 'status'],
                                null,
                            ) === 'pending'

                        if (isPending) {
                            setTimeout(() => {
                                void dispatch(
                                    fetchIntegration(
                                        integrationId,
                                        integrationType,
                                        true,
                                    ),
                                )
                            }, 3000)
                        } else {
                            onCreateSuccess(dispatch, resp)
                        }
                    }
                },
                (error: AxiosError) => {
                    // We redirect to the integrations home page if we can't find the wanted integration on the server
                    history.replace(
                        `/app/settings/${
                            isChannel(integrationType)
                                ? 'channels'
                                : 'integrations'
                        }/${integrationType}`,
                    )
                    return dispatch({
                        type: constants.FETCH_INTEGRATION_ERROR,
                        error,
                        reason: 'Failed to fetch integration',
                    })
                },
            )
    }
}

export function deleteIntegration(integration: Map<any, any>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.DELETE_INTEGRATION_START,
            id: integration.get('id'),
        })

        return client
            .delete(`/api/integrations/${integration.get('id') as number}/`)
            .then(
                () => {
                    dispatch({
                        type: constants.DELETE_INTEGRATION_SUCCESS,
                        id: integration.get('id'),
                    })

                    void dispatch(
                        fetchAccountSettings(
                            AccountSettingType.DefaultIntegration,
                        ),
                    )

                    const currentUrl = window.location.pathname
                    const indexOfId = currentUrl.lastIndexOf(
                        integration.get('id'),
                    )

                    if (~indexOfId) {
                        const nextUrl = currentUrl.substr(0, indexOfId)
                        history.push(nextUrl)
                    }

                    return dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Integration successfully deleted',
                        }),
                    )
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.DELETE_INTEGRATION_ERROR,
                        reason: 'Failed to delete the integration',
                        verbose: true,
                        error,
                    })
                },
            )
    }
}

export function updateOrCreateIntegrationRequest(
    integration: Map<any, any>,
    action?: Record<string, unknown>,
    notificationId: Maybe<string> = null,
    disableRedirectOnCreateSuccess = false,
    onSuccess?: (resp: any) => void,
    disableSuccessNotification?: boolean,
    message?: string,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = integration.get('id') as number

        dispatch({
            type: isUpdate
                ? constants.UPDATE_INTEGRATION_START
                : constants.CREATE_INTEGRATION_START,
            integration,
        })

        let promise

        const params: { action?: Record<string, unknown> } = {}

        if (action) {
            params.action = action
        }

        if (isUpdate) {
            promise = client.put<Integration>(
                `/api/integrations/${integration.get('id') as number}/`,
                integration.toJS(),
                { params },
            )
        } else {
            promise = client.post<Integration>(
                '/api/integrations/',
                integration.toJS(),
            )
        }

        return promise
            .then((json) => json?.data)
            .then(
                (resp) => {
                    onSuccess && onSuccess(resp)

                    if (isUpdate) {
                        return onUpdateSuccess(
                            dispatch,
                            resp,
                            notificationId,
                            disableSuccessNotification,
                            message,
                        )
                    }

                    return onCreateSuccess(
                        dispatch,
                        resp,
                        disableRedirectOnCreateSuccess,
                        disableSuccessNotification,
                        message,
                    )
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: isUpdate
                            ? constants.UPDATE_INTEGRATION_ERROR
                            : constants.CREATE_INTEGRATION_ERROR,
                        error,
                        verbose: true,
                        reason: isUpdate
                            ? 'Failed to update connection'
                            : 'Failed to connect app',
                    })
                },
            )
    }
}

export function createImportIntegration(integration: Map<any, any>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = !!integration.get('id')

        dispatch({
            type: constants.CREATE_INTEGRATION_START,
            integration,
        })

        return client
            .post<Integration>('/api/integrations/', integration.toJS())
            .then((json) => json?.data)
            .then(
                (resp) => {
                    history.push('/app/settings/import-zendesk/')

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Import successfully started',
                        }),
                    )

                    return dispatch({
                        type: constants.CREATE_INTEGRATION_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: isUpdate
                            ? constants.UPDATE_INTEGRATION_ERROR
                            : constants.CREATE_INTEGRATION_ERROR,
                        error,
                        reason: isUpdate
                            ? 'Failed to update connection'
                            : 'Failed to connect app',
                        verbose: true,
                    })
                },
            )
    }
}

export function createGorgiasChatIntegration(
    integration: Map<any, any>,
    redirect: boolean = true,
    skipInstallation: boolean = false,
) {
    return async (
        dispatch: StoreDispatch,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.CREATE_INTEGRATION_START,
            integration,
        })

        let savedIntegration
        try {
            const response = await client.post<GorgiasChatIntegration>(
                '/api/integrations/',
                integration.toJS(),
            )

            savedIntegration = response.data
        } catch (error) {
            return dispatch({
                type: constants.CREATE_INTEGRATION_ERROR,
                error,
                reason: 'Failed to add integration',
                verbose: true,
            })
        }

        let successBannerText
        // Try to install the chat to shopify store
        const savedIntegrationId = savedIntegration.id || ''
        if (savedIntegration.meta.shop_integration_id && !skipInstallation) {
            try {
                await client.put<Integration>(
                    `/api/integrations/${savedIntegration.id}`,
                    {
                        id: savedIntegration.id,
                        type: savedIntegration.type,
                        meta: {
                            ...savedIntegration.meta,
                            shopify_integration_ids: [
                                savedIntegration.meta.shop_integration_id,
                            ],
                        },
                    },
                )
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Integration successfully added',
                    }),
                )
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: isAxiosError(error)
                            ? (error as GorgiasApiError).response?.data.error
                                  ?.msg
                            : 'Failed to install the chat to the store',
                    }),
                )
                dispatch({
                    type: constants.CREATE_INTEGRATION_SUCCESS,
                    resp: savedIntegration,
                })

                if (redirect) {
                    history.push(
                        `/app/settings/channels/gorgias_chat/${
                            savedIntegrationId
                        }/installation`,
                    )
                }

                return
            }

            if (redirect) {
                history.push(
                    `/app/settings/channels/gorgias_chat/${
                        savedIntegrationId
                    }/preferences`,
                )
            }

            successBannerText =
                'Integration successfully installed on your website'
        } else {
            if (redirect) {
                history.push(
                    `/app/settings/channels/gorgias_chat/${
                        savedIntegrationId
                    }/installation`,
                )
            }

            successBannerText = 'Integration successfully added'
        }

        dispatch({
            type: constants.CREATE_INTEGRATION_SUCCESS,
            resp: savedIntegration,
        })
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: successBannerText,
            }),
        )

        return savedIntegrationId
    }
}

export function deactivateIntegration(id: number) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        const integration = fromJS({
            id,
            deactivated_datetime: moment().format(),
        })

        return dispatch(
            updateOrCreateIntegrationRequest(integration, undefined),
        )
    }
}

export function activateIntegration(id: number) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        const integration = fromJS({
            id,
            deactivated_datetime: null,
        })

        return dispatch(
            updateOrCreateIntegrationRequest(integration, undefined),
        )
    }
}

/**
 * Called when we create an integration or when we edit the settings.
 */
export function updateOrCreateIntegration(
    integration: Map<any, any>,
    action?: Record<string, unknown>,
    disableRedirectOnCreateSuccess?: boolean,
    onSuccess?: (resp: any) => void,
    disableSuccessNotification?: boolean,
    message?: string,
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return dispatch(
            updateOrCreateIntegrationRequest(
                integration,
                action,
                null,
                disableRedirectOnCreateSuccess,
                onSuccess,
                disableSuccessNotification,
                message,
            ),
        )
    }
}

export function onVerify(
    dispatch: StoreDispatch,
    integrationId: number,
): ReturnType<StoreDispatch> {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: 'You can now receive emails using this integration',
        }),
    )
    return dispatch({
        type: constants.EMAIL_INTEGRATION_VERIFIED,
        integrationId,
    })
}

export function onVerifyMigrationForwarding(
    dispatch: StoreDispatch,
    integrationId: number,
    address: string,
): ReturnType<StoreDispatch> {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: `Forwarding verified for ${address}`,
        }),
    )
    return dispatch({
        type: constants.UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
        integrationId,
        emailMigrationVerificationStatus:
            EmailMigrationInboundVerificationStatus.InboundSuccess,
    })
}

export function onVerifyMigrationForwardingFailure(
    dispatch: StoreDispatch,
    integrationId: number,
    address: string,
): ReturnType<StoreDispatch> {
    void dispatch(
        notify({
            status: NotificationStatus.Error,
            message: `${address} could not be verified. Make sure forwarding it set up correctly and re-verify. `,
        }),
    )
    return dispatch({
        type: constants.UPDATE_EMAIL_MIGRATION_VERIFICATION_STATUS,
        integrationId,
        emailMigrationVerificationStatus:
            EmailMigrationInboundVerificationStatus.InboundFailed,
    })
}

export function onEmailForwardingActivated(
    dispatch: StoreDispatch,
    integrationId: number,
): ReturnType<StoreDispatch> {
    return dispatch({
        type: constants.EMAIL_FORWARDING_ACTIVATED,
        integrationId,
    })
}

export function verifyEmailIntegration(token: string) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return client
            .post<void>(
                `/api/integrations/${integration.get('id') as number}/verify/`,
                { token },
            )
            .then(
                () => {
                    return onVerify(dispatch, integration.get('id') as number)
                },
                (error: AxiosError) => {
                    return dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (
                                fromJS(error.response) as Map<any, any>
                            ).getIn(['data', 'error', 'msg']),
                        }),
                    )
                },
            )
    }
}

export function klaviyoSyncHistoricalEvent() {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return client
            .post(
                `/api/integrations/klaviyo/${
                    integration.get('id') as number
                }/sync/`,
            )
            .then(
                () => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Syncing process has started!',
                        }),
                    )
                },
                (error: AxiosError) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (
                                fromJS(error.response) as Map<any, any>
                            ).getIn(['data', 'error', 'msg']),
                        }),
                    )
                },
            )
    }
}

export function sendVerificationEmail() {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return client
            .post(
                `/api/integrations/${
                    integration.get('id') as number
                }/send-verification-email/`,
            )
            .then(
                () => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'The verification email has been re-sent!',
                        }),
                    )
                },
                (error: AxiosError) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (
                                fromJS(error.response) as Map<any, any>
                            ).getIn(['data', 'error', 'msg']),
                        }),
                    )
                },
            )
    }
}

export function verifyEmailIntegrationManually(token: string) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integrationId = integrationSelectors
            .getCurrentIntegration(state)
            .get('id') as number

        return client
            .post<void>(
                `/api/integrations/${integrationId}/verify-email-integration/`,
                { verification_code: token },
            )
            .then(
                () => {
                    return onVerify(dispatch, integrationId)
                },
                (error: AxiosError) => {
                    return dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (
                                fromJS(error.response) as Map<any, any>
                            ).getIn(['data', 'error', 'msg']),
                        }),
                    )
                },
            )
    }
}

export function fetchChatIntegrationStatus(integrationId: number) {
    return async (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration =
            integrationSelectors.getIntegrationById(integrationId)(state)

        try {
            const installationStatus = await getInstallationStatusAction(
                integration.getIn(['meta', 'app_id']),
            )

            const chatStatus = helpers.computeChatIntegrationStatus(
                integration,
                installationStatus,
            )

            if (chatStatus) {
                return dispatch({
                    chatStatus,
                    id: integrationId,
                    type: constants.FETCH_CHAT_STATUS_SUCCESS,
                })
            }

            void dispatch({
                id: integrationId,
                type: constants.FETCH_CHAT_STATUS_START,
            })

            const applicationId: string = integration.getIn(['meta', 'app_id'])
            const client = await getGorgiasChatProtectedApiClient()

            const { data }: { data: AplicationAgentsResponse } =
                await client.getApplicationAgents({
                    applicationId,
                })

            if (data.hasAvailableAgents) {
                return dispatch({
                    chatStatus: GorgiasChatStatusEnum.ONLINE,
                    id: integrationId,
                    type: constants.FETCH_CHAT_STATUS_SUCCESS,
                })
            }

            return dispatch({
                chatStatus: GorgiasChatStatusEnum.OFFLINE,
                id: integrationId,
                type: constants.FETCH_CHAT_STATUS_SUCCESS,
            })
        } catch (error) {
            return dispatch({
                error,
                id: integrationId,
                type: constants.FETCH_CHAT_STATUS_ERROR,
                reason: `Failed to fetch Status for Chat ID ${integrationId}`,
            })
        }
    }
}

export const getTranslations = getTranslationsAction
export const getApplicationTexts = getApplicationTextsAction
export const updateApplicationTexts = updateApplicationTextsAction
export const getInstallationStatus = getInstallationStatusAction
export const getInstallationStatuses = getInstallationStatusesAction

export const hideShopifyCheckoutChatBanner = () => {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        return dispatch({
            type: constants.HIDE_SHOPIFY_CHECKOUT_CHAT_BANNER,
        })
    }
}
