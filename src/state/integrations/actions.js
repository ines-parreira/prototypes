// @flow
import axios from 'axios'
import {browserHistory} from 'react-router'
import moment from 'moment'
import {fromJS, type Map} from 'immutable'
import _capitalize from 'lodash/capitalize'
import _sortBy from 'lodash/sortBy'

import {
    FACEBOOK_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
} from '../../constants/integration'

import {notify} from '../notifications/actions'
import type {Dispatch, getStateType} from '../types'

import * as constants from './constants'
import * as integrationSelectors from './selectors'

type integrationType = {
    type: string,
    id: string,
}

export function fetchIntegrations() {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.FETCH_INTEGRATIONS_START,
        })

        return axios
            .get('/api/integrations/')
            .then((json = {}) => json.data)
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
                (error) => {
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
 *
 * @param page: the page of the list that we want
 * @param integrationType: the type of deleted integrations we want to fetch
 * @param forceOverride: whether the result should be forcefully set in the reducer, or only set if the page of the
 *   response's meta matches the page currently set in the reducer
 * @param filter: filter results that contain typed value
 */
function fetchOnboardingIntegrations(
    page: number = 1,
    integrationType: string,
    forceOverride: boolean = true,
    filter: string = ''
) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.FETCH_ONBOARDING_INTEGRATIONS_START,
        })

        const params = filter ? {page, filter} : {page}

        return axios
            .get(`/integrations/${integrationType}/onboarding-integrations/`, {
                params,
            })
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: constants.FETCH_ONBOARDING_INTEGRATIONS_SUCCESS,
                        integrationType,
                        resp,
                        forceOverride,
                    })
                },
                (error) => {
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
 *
 * @param page: the page of the list that we want
 * @param forceOverride: whether the result should be forcefully set in the reducer, or only set if the page of the
 *   response's meta matches the page currently set in the reducer
 */
export function fetchFacebookOnboardingIntegrations(
    page: number = 1,
    forceOverride: boolean = true
) {
    return fetchOnboardingIntegrations(
        page,
        FACEBOOK_INTEGRATION_TYPE,
        forceOverride
    )
}

/**
 * Fetch Outlook deleted integrations which can be activated by the current agent.
 *
 * @param page: the page of the list that we want
 * @param forceOverride: whether the result should be forcefully set in the reducer, or only set if the page of the
 *   response's meta matches the page currently set in the reducer
 * @param filter: filter results that contain typed value
 */
export function fetchOutlookOnboardingIntegrations(
    page: number = 1,
    forceOverride: boolean = true,
    filter: string = ''
) {
    return fetchOnboardingIntegrations(
        page,
        OUTLOOK_INTEGRATION_TYPE,
        forceOverride,
        filter
    )
}

export function activateOnboardingIntegrations(
    data: Array<{}>,
    integrationType: string
) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.ACTIVATE_ONBOARDING_INTEGRATIONS_START,
        })

        return axios
            .put(
                `/integrations/${integrationType}/onboarding-integrations/`,
                data
            )
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    const formattedType = `${_capitalize(
                        integrationType
                    )} integration${data.length > 1 ? 's' : ''}`

                    dispatch(
                        notify({
                            status: 'success',
                            message: `${formattedType} successfully activated.`,
                        })
                    )
                    return dispatch({
                        type:
                            constants.ACTIVATE_ONBOARDING_INTEGRATIONS_SUCCESS,
                        resp,
                    })
                },
                (error) => {
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
 *
 * @param dispatch: the dispatch method
 * @param resp: the raw Integration data coming back from the server
 */
export function onCreateSuccess(
    dispatch: Dispatch,
    resp: integrationType
): Dispatch {
    dispatch({
        type: constants.CREATE_INTEGRATION_SUCCESS,
        resp,
    })

    fetchIntegrations()(dispatch)

    let nextStep = ''

    if (resp.type === 'email') {
        nextStep = '/forwarding'
    } else if (resp.type === 'smooch_inside') {
        nextStep = '/installation'
    } else if (resp.type === 'smooch') {
        nextStep = '/overview'
    }

    browserHistory.push(
        `/app/settings/integrations/${resp.type}/${resp.id || ''}${nextStep}`
    )

    dispatch(
        notify({
            status: 'success',
            message: 'Integration successfully added',
        })
    )
}

export function triggerCreateSuccess(integration: integrationType) {
    return (dispatch: Dispatch) => onCreateSuccess(dispatch, integration)
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully updated.
 *
 * @param dispatch: the dispatch method
 * @param resp: the raw Integration data coming back from the server
 * @param notificationId: the id of the notification to replace with the success notification, if any
 * @param didInvalidateCache: whether this update invalidated the cache of this integration or not
 */
export function onUpdateSuccess(
    dispatch: Dispatch,
    resp: {type: string},
    notificationId: ?string = null,
    didInvalidateCache: boolean = false
): Dispatch {
    dispatch({
        type: constants.UPDATE_INTEGRATION_SUCCESS,
        resp,
    })

    fetchIntegrations()(dispatch)

    let message = 'Integration successfully updated'

    if (resp.type === 'smooch_inside' && didInvalidateCache) {
        message = 'Integration successfully updated.'
    }

    return dispatch(
        notify({
            id: notificationId,
            status: 'success',
            message,
        })
    )
}

export function fetchIntegration(
    integrationId: string,
    integrationType: string,
    waitingForAuthentication: boolean = false
) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        if (!waitingForAuthentication) {
            dispatch({
                type: constants.FETCH_INTEGRATION_START,
                id: integrationId,
            })
        }

        return axios
            .get(`/api/integrations/${integrationId}`)
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch({
                        type: constants.FETCH_INTEGRATION_SUCCESS,
                        integration: resp,
                    })

                    if (waitingForAuthentication) {
                        const isPending =
                            fromJS(resp).getIn(
                                ['meta', 'oauth', 'status'],
                                null
                            ) === 'pending'

                        if (isPending) {
                            setTimeout(
                                () =>
                                    dispatch(
                                        fetchIntegration(
                                            integrationId,
                                            integrationType,
                                            true
                                        )
                                    ),
                                3000
                            )
                        } else {
                            onCreateSuccess(dispatch, resp)
                        }
                    }
                },
                (error) => {
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

export function deleteIntegration(integration: Map<*, *>) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.DELETE_INTEGRATION_START,
            id: integration.get('id'),
        })

        return axios
            .delete(`/api/integrations/${integration.get('id')}/`)
            .then((json = {}) => json.data)
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
                            status: 'success',
                            message: 'Integration successfully deleted',
                        })
                    )
                },
                (error) => {
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
    integration: Map<*, *>,
    action: ?{},
    notificationId: ?string = null
) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        const isUpdate = integration.get('id')
        const oldDecoration = integration.get('decoration') || fromJS({})

        dispatch({
            type: isUpdate
                ? constants.UPDATE_INTEGRATION_START
                : constants.CREATE_INTEGRATION_START,
            integration,
        })

        let promise

        const params = {}

        if (action) {
            params.action = action
        }

        if (isUpdate) {
            promise = axios.put(
                `/api/integrations/${integration.get('id')}/`,
                integration.toJS(),
                {params}
            )
        } else {
            promise = axios.post('/api/integrations/', integration.toJS())
        }

        return promise
            .then((json = {}) => json.data)
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
                (error) => {
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

export function createImportIntegration(integration: Map<*, *>) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        const isUpdate = !!integration.get('id')

        dispatch({
            type: constants.CREATE_INTEGRATION_START,
            integration,
        })

        return axios
            .post('/api/integrations/', integration.toJS())
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    browserHistory.push('/app/settings/import-data/')

                    dispatch(
                        notify({
                            status: 'success',
                            message: 'Import successfully started',
                        })
                    )

                    return dispatch({
                        type: constants.CREATE_INTEGRATION_SUCCESS,
                        resp,
                    })
                },
                (error) => {
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
    return (dispatch: Dispatch, getState: getStateType): Dispatch => {
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
                    status: 'loading',
                    message: 'Removing the chat from your Shopify stores...',
                })
            )

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
    return (dispatch: Dispatch, getState: getStateType): Dispatch => {
        const fullIntegration = integrationSelectors.getIntegrationById(id)(
            getState()
        )

        const integration = fromJS({
            id,
            deactivated_datetime: null,
        })

        let notificationId = null

        if (fullIntegration.getIn(['meta', 'shopify_integration_ids'])) {
            const notification = dispatch(
                notify({
                    status: 'loading',
                    message: 'Adding the chat on your Shopify stores...',
                })
            )

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
 * @param integration
 * @param action
 * @returns {Function}
 */
export function updateOrCreateIntegration(integration: Map<*, *>, action: {}) {
    return (dispatch: Dispatch): Dispatch => {
        return dispatch(updateOrCreateIntegrationRequest(integration, action))
    }
}

export function importEmails(integration: Map<*, *>) {
    return (dispatch: Dispatch): Promise<Dispatch> => {
        dispatch({
            type: constants.EMAIL_INTEGRATION_IMPORT_START,
            id: integration.get('id'),
        })

        return axios
            .put(
                `/api/integrations/${integration.get('id')}/`,
                integration.toJS()
            )
            .then((json = {}) => json.data)
            .then(
                (resp) => {
                    dispatch(
                        notify({
                            status: 'success',
                            message: 'Import successfully started',
                        })
                    )
                    return dispatch({
                        type: constants.EMAIL_INTEGRATION_IMPORT_SUCCESS,
                        resp,
                    })
                },
                (error) => {
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
    dispatch: Dispatch,
    integrationId: number
): Promise<Dispatch> {
    dispatch(
        notify({
            status: 'success',
            message: 'Integration verified successfully',
        })
    )
    return dispatch({
        type: constants.EMAIL_INTEGRATION_VERIFIED,
        integrationId,
    })
}

export function verifyEmailIntegration(token: string) {
    return (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return axios
            .post(`/api/integrations/${integration.get('id')}/verify/`, {token})
            .then(
                () => {
                    return onVerify(dispatch, integration.get('id'))
                },
                (error) => {
                    return dispatch(
                        notify({
                            status: 'error',
                            message: fromJS(error.response).getIn([
                                'data',
                                'error',
                                'msg',
                            ]),
                        })
                    )
                }
            )
    }
}

export function sendVerificationEmail() {
    return (dispatch: Dispatch, getState: getStateType): Promise<Dispatch> => {
        const state = getState()
        const integration = integrationSelectors.getCurrentIntegration(state)

        return axios
            .post(
                `/api/integrations/${integration.get(
                    'id'
                )}/send-verification-email/`
            )
            .then(
                () => {
                    dispatch(
                        notify({
                            status: 'success',
                            message: 'The verification email has been re-sent!',
                        })
                    )
                },
                (error) => {
                    dispatch(
                        notify({
                            status: 'error',
                            message: fromJS(error.response).getIn([
                                'data',
                                'error',
                                'msg',
                            ]),
                        })
                    )
                }
            )
    }
}
