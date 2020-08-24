import axios, {AxiosError} from 'axios'
import {browserHistory} from 'react-router'
import moment from 'moment'
import {fromJS, Map} from 'immutable'
import _capitalize from 'lodash/capitalize'
import _sortBy from 'lodash/sortBy'

import {ApiListResponsePagination} from '../../models/api/types'
import {Integration, IntegrationType} from '../../models/integration/types'
import {notify} from '../notifications/actions'
import {NotificationStatus} from '../notifications/types'
import type {StoreDispatch, RootState} from '../types'

import * as constants from './constants.js'
import * as integrationSelectors from './selectors'

export function fetchIntegrations() {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_INTEGRATIONS_START,
        })

        return axios
            .get<ApiListResponsePagination<Integration[]>>('/api/integrations/')
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const newResp = resp

                    if (newResp) {
                        newResp.data = _sortBy(newResp.data, (integration) =>
                            integration.name.toLowerCase()
                        )
                    }

                    return dispatch({
                        type: constants.FETCH_INTEGRATIONS_SUCCESS,
                        resp: newResp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.FETCH_INTEGRATIONS_ERROR,
                        error,
                        reason: 'Failed to fetch integrations',
                    })
                }
            )
    }
}

/**
 * Fetch deleted integrations which can be activated by the current agent.
 */
function fetchOnboardingIntegrations(
    page = 1,
    integrationType: string,
    forceOverride = true,
    filter = ''
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.FETCH_ONBOARDING_INTEGRATIONS_START,
        })

        const params = filter ? {page, filter} : {page}

        return axios
            .get<ApiListResponsePagination<Integration[]>>(
                `/integrations/${integrationType}/onboarding-integrations/`,
                {
                    params,
                }
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
                }
            )
    }
}

/**
 * Fetch Facebook deleted integrations which can be activated by the current agent.
 */
export function fetchFacebookOnboardingIntegrations(
    page = 1,
    forceOverride = true
) {
    return fetchOnboardingIntegrations(
        page,
        IntegrationType.FacebookIntegrationType,
        forceOverride
    )
}

/**
 * Fetch Outlook deleted integrations which can be activated by the current agent.
 */
export function fetchOutlookOnboardingIntegrations(
    page = 1,
    forceOverride = true,
    filter = ''
) {
    return fetchOnboardingIntegrations(
        page,
        IntegrationType.OutlookIntegrationType,
        forceOverride,
        filter
    )
}

export function activateOnboardingIntegrations(
    data: Integration[],
    integrationType: IntegrationType
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_START,
        })

        return axios
            .put<ApiListResponsePagination<Integration[]>>(
                `/integrations/${integrationType}/onboarding-integrations/`,
                data
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    const formattedType = `${_capitalize(
                        integrationType
                    )} integration${data.length > 1 ? 's' : ''}`

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: `${formattedType} successfully activated.`,
                        })
                    )
                    return dispatch({
                        type:
                            constants.ACTIVATE_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_ERROR,
                        error,
                        reason: `Failed to activate your ${_capitalize(
                            integrationType
                        )} integration`,
                    })
                }
            )
    }
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully created.
 */
export function onCreateSuccess(dispatch: StoreDispatch, resp: Integration) {
    dispatch({
        type: constants.CREATE_INTEGRATION_SUCCESS,
        resp,
    })

    void fetchIntegrations()(dispatch)

    let nextStep = ''

    if (resp.type === IntegrationType.EmailIntegrationType) {
        nextStep = '/forwarding'
    } else if (resp.type === IntegrationType.SmoochInsideIntegrationType) {
        nextStep = '/installation'
    } else if (resp.type === IntegrationType.SmoochIntegrationType) {
        nextStep = '/overview'
    }

    browserHistory.push(
        `/app/settings/integrations/${resp.type}/${resp.id || ''}${nextStep}`
    )

    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: 'Integration successfully added',
        })
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
    didInvalidateCache = false
): Promise<ReturnType<StoreDispatch>> {
    dispatch({
        type: constants.UPDATE_INTEGRATION_SUCCESS,
        resp,
    })

    void fetchIntegrations()(dispatch)

    let message = 'Integration successfully updated'

    if (
        resp.type === IntegrationType.SmoochInsideIntegrationType &&
        didInvalidateCache
    ) {
        message = 'Integration successfully updated.'
    }

    return dispatch(
        notify({
            id: notificationId,
            status: NotificationStatus.Success,
            message,
        })
    ) as Promise<Record<string, unknown>>
}

export function fetchIntegration(
    integrationId: string,
    integrationType: string,
    waitingForAuthentication = false
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        if (!waitingForAuthentication) {
            dispatch({
                type: constants.FETCH_INTEGRATION_START,
                id: integrationId,
            })
        }

        return axios
            .get<Integration>(`/api/integrations/${integrationId}`)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.FETCH_INTEGRATION_SUCCESS,
                        integration: resp,
                    })

                    if (waitingForAuthentication) {
                        const isPending =
                            (fromJS(resp) as Map<any, any>).getIn(
                                ['meta', 'oauth', 'status'],
                                null
                            ) === 'pending'

                        if (isPending) {
                            setTimeout(() => {
                                void dispatch(
                                    fetchIntegration(
                                        integrationId,
                                        integrationType,
                                        true
                                    )
                                )
                            }, 3000)
                        } else {
                            onCreateSuccess(dispatch, resp)
                        }
                    }
                },
                (error: AxiosError) => {
                    // We redirect to the integrations home page if we can't find the wanted integration on the server
                    browserHistory.replace(
                        `/app/settings/integrations/${integrationType}`
                    )
                    return dispatch({
                        type: constants.FETCH_INTEGRATION_ERROR,
                        error,
                        reason: 'Failed to fetch integration',
                    })
                }
            )
    }
}

export function deleteIntegration(integration: Map<any, any>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.DELETE_INTEGRATION_START,
            id: integration.get('id'),
        })

        return axios
            .delete(`/api/integrations/${integration.get('id') as number}/`)
            .then(
                () => {
                    dispatch({
                        type: constants.DELETE_INTEGRATION_SUCCESS,
                        id: integration.get('id'),
                    })
                    const currentUrl = window.location.pathname
                    const indexOfId = currentUrl.lastIndexOf(
                        integration.get('id')
                    )

                    if (~indexOfId) {
                        const nextUrl = currentUrl.substr(0, indexOfId)
                        browserHistory.push(nextUrl)
                    }

                    return dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Integration successfully deleted',
                        })
                    )
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.DELETE_INTEGRATION_ERROR,
                        reason: 'Failed to delete the integration',
                        verbose: true,
                        error,
                    })
                }
            )
    }
}

function updateOrCreateIntegrationRequest(
    integration: Map<any, any>,
    action: Maybe<Record<string, unknown>>,
    notificationId: Maybe<string> = null
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const isUpdate = integration.get('id') as number
        const oldDecoration =
            (integration.get('decoration') as Map<any, any>) || fromJS({})

        dispatch({
            type: isUpdate
                ? constants.UPDATE_INTEGRATION_START
                : constants.CREATE_INTEGRATION_START,
            integration,
        })

        let promise

        const params: {action?: Record<string, unknown>} = {}

        if (action) {
            params.action = action
        }

        if (isUpdate) {
            promise = axios.put<Integration>(
                `/api/integrations/${integration.get('id') as number}/`,
                integration.toJS(),
                {params}
            )
        } else {
            promise = axios.post<Integration>(
                '/api/integrations/',
                integration.toJS()
            )
        }

        return promise
            .then((json) => json?.data)
            .then(
                (resp) => {
                    if (isUpdate) {
                        return onUpdateSuccess(
                            dispatch,
                            resp,
                            notificationId,
                            !oldDecoration.isEmpty()
                        )
                    }

                    return onCreateSuccess(dispatch, resp)
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: isUpdate
                            ? constants.UPDATE_INTEGRATION_ERROR
                            : constants.CREATE_INTEGRATION_ERROR,
                        error,
                        verbose: true,
                        reason: isUpdate
                            ? 'Failed to update integration'
                            : 'Failed to add integration',
                    })
                }
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

        return axios
            .post<Integration>('/api/integrations/', integration.toJS())
            .then((json) => json?.data)
            .then(
                (resp) => {
                    browserHistory.push('/app/settings/import-data/')

                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Import successfully started',
                        })
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
                            ? 'Failed to update integration'
                            : 'Failed to add integration',
                        verbose: true,
                    })
                }
            )
    }
}

export function deactivateIntegration(id: number) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): ReturnType<StoreDispatch> => {
        const fullIntegration = integrationSelectors.getIntegrationById(id)(
            getState()
        )

        const integration = fromJS({
            id,
            deactivated_datetime: moment().format(),
        })

        let notificationId = null

        if (fullIntegration.getIn(['meta', 'shopify_integration_ids'])) {
            const notification = dispatch(
                notify({
                    status: NotificationStatus.Loading,
                    message: 'Removing the chat from your Shopify stores...',
                })
            ) as Promise<any> & {id: string}

            notificationId = notification.id
        }

        return dispatch(
            updateOrCreateIntegrationRequest(
                integration,
                undefined,
                notificationId
            )
        )
    }
}

export function activateIntegration(id: number) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): ReturnType<StoreDispatch> => {
        const fullIntegration = integrationSelectors.getIntegrationById(id)(
            getState()
        )

        const integration = fromJS({
            id,
            deactivated_datetime: null,
        }) as Map<any, any>

        let notificationId = null

        if (fullIntegration.getIn(['meta', 'shopify_integration_ids'])) {
            const notification = dispatch(
                notify({
                    status: NotificationStatus.Loading,
                    message: 'Adding the chat on your Shopify stores...',
                })
            ) as Promise<any> & {id: string}

            notificationId = notification.id
        }

        return dispatch(
            updateOrCreateIntegrationRequest(
                integration,
                undefined,
                notificationId
            )
        )
    }
}

/**
 * Called when we create an integration or when we edit the settings.
 */
export function updateOrCreateIntegration(
    integration: Map<any, any>,
    action: Record<string, unknown>
) {
    return (dispatch: StoreDispatch): ReturnType<StoreDispatch> => {
        return dispatch(updateOrCreateIntegrationRequest(integration, action))
    }
}

export function importEmails(integration: Map<any, any>) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: constants.EMAIL_INTEGRATION_IMPORT_START,
            id: integration.get('id'),
        })

        return axios
            .put<Integration>(
                `/api/integrations/${integration.get('id') as number}/`,
                integration.toJS()
            )
            .then((json) => json?.data)
            .then(
                (resp) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'Import successfully started',
                        })
                    )
                    return dispatch({
                        type: constants.EMAIL_INTEGRATION_IMPORT_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: constants.EMAIL_INTEGRATION_IMPORT_ERROR,
                        error,
                        reason: 'Failed to start importation',
                    })
                }
            )
    }
}

export function onVerify(
    dispatch: StoreDispatch,
    integrationId: number
): ReturnType<StoreDispatch> {
    void dispatch(
        notify({
            status: NotificationStatus.Success,
            message: 'Integration verified successfully',
        })
    )
    return dispatch({
        type: constants.EMAIL_INTEGRATION_VERIFIED,
        integrationId,
    })
}

export function verifyEmailIntegration(token: string) {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return axios
            .post<void>(
                `/api/integrations/${integration.get('id') as number}/verify/`,
                {token}
            )
            .then(
                () => {
                    return onVerify(dispatch, integration.get('id') as number)
                },
                (error: AxiosError) => {
                    return dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (fromJS(error.response) as Map<
                                any,
                                any
                            >).getIn(['data', 'error', 'msg']),
                        })
                    )
                }
            )
    }
}

export function sendVerificationEmail() {
    return (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return axios
            .post(
                `/api/integrations/${
                    integration.get('id') as number
                }/send-verification-email/`
            )
            .then(
                () => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Success,
                            message: 'The verification email has been re-sent!',
                        })
                    )
                },
                (error: AxiosError) => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: (fromJS(error.response) as Map<
                                any,
                                any
                            >).getIn(['data', 'error', 'msg']),
                        })
                    )
                }
            )
    }
}
