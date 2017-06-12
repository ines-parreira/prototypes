import axios from 'axios'
import {sortBy as _sortBy} from 'lodash'
import {browserHistory} from 'react-router'
import moment from 'moment'
import {fromJS} from 'immutable'

import * as types from './constants'
import {notify} from '../notifications/actions'

export function fetchIntegrations(withDeleted = false) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_INTEGRATIONS_START
        })

        const params = {}

        if (withDeleted) {
            params.with_deleted = 'true'
        }

        return axios.get('/api/integrations/', {params})
            .then((json = {}) => json.data)
            .then(resp => {
                const newResp = resp

                if (newResp) {
                    newResp.data = _sortBy(newResp.data, o => o.name.toLowerCase())
                }

                dispatch({
                    type: types.FETCH_INTEGRATIONS_SUCCESS,
                    resp: newResp
                })
            }, error => {
                return dispatch({
                    type: types.FETCH_INTEGRATIONS_ERROR,
                    error,
                    reason: 'Failed to fetch integrations'
                })
            })
    }
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully created.
 *
 * @param dispatch: the dispatch method
 * @param resp: the raw Integration data coming back from the server
 */
function onCreateSuccess(dispatch, resp) {
    dispatch({
        type: types.CREATE_INTEGRATION_SUCCESS,
        resp
    })

    fetchIntegrations()(dispatch)

    browserHistory.push(`/app/integrations/${resp.type}/${resp.id || ''}${resp.type === 'email' ? '/forwarding' : ''}`)

    dispatch(notify({
        type: 'success',
        message: 'Integration successfully added'
    }))
}

export function triggerCreateSuccess(integration) {
    return (dispatch) => onCreateSuccess(dispatch, integration)
}

/**
 * Helper to execute all actions that should be executed when an Integration is successfully updated.
 *
 * @param dispatch: the dispatch method
 * @param resp: the raw Integration data coming back from the server
 */
function onUpdateSuccess(dispatch, resp) {
    dispatch({
        type: types.UPDATE_INTEGRATION_SUCCESS,
        resp
    })

    fetchIntegrations()(dispatch)

    dispatch(notify({
        type: 'success',
        message: 'Integration successfully updated'
    }))
}

export function fetchIntegration(integrationId, integrationType, waitingForAuthentication = false) {
    return (dispatch) => {
        if (!waitingForAuthentication) {
            dispatch({
                type: types.FETCH_INTEGRATION_START,
                id: integrationId
            })
        }

        return axios.get(`/api/integrations/${integrationId}`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_INTEGRATION_SUCCESS,
                    integration: resp
                })

                if (waitingForAuthentication) {
                    const isPending = fromJS(resp).getIn(['meta', 'oauth', 'status'], null) === 'pending'

                    if (isPending) {
                        setTimeout(() => dispatch(fetchIntegration(integrationId, integrationType, true)), 3000)
                    } else {
                        onCreateSuccess(dispatch, resp)
                    }
                }
            }, error => {
                // We redirect to the integrations home page if we can't find the wanted integration on the server
                browserHistory.replace(`/app/integrations/${integrationType}`)
                return dispatch({
                    type: types.FETCH_INTEGRATION_ERROR,
                    error,
                    reason: 'Failed to fetch integration'
                })
            })
    }
}


export function deleteIntegration(integration) {
    return (dispatch) => {
        dispatch({
            type: types.DELETE_INTEGRATION_START,
            id: integration.get('id')
        })

        return axios.delete(`/api/integrations/${integration.get('id')}/`)
            .then((json = {}) => json.data)
            .then(() => {
                dispatch({
                    type: types.DELETE_INTEGRATION_SUCCESS,
                    id: integration.get('id')
                })
                const currentUrl = window.location.pathname
                const indexOfId = currentUrl.lastIndexOf(integration.get('id'))

                if (~indexOfId) {
                    const nextUrl = currentUrl.substr(0, indexOfId)
                    browserHistory.push(nextUrl)
                }

                return dispatch(notify({
                    type: 'success',
                    message: 'Integration successfully deleted'
                }))
            }, error => {
                return dispatch({
                    type: types.DELETE_INTEGRATION_ERROR,
                    error,
                    reason: 'Failed to delete the integration'
                })
            })
    }
}

function updateOrCreateIntegrationRequest(integration, action, withDeleted) {
    return (dispatch) => {
        const isUpdate = integration.get('id')

        dispatch({
            type: isUpdate ? types.UPDATE_INTEGRATION_START : types.CREATE_INTEGRATION_START,
            integration
        })

        let promise

        const params = {}

        if (action) {
            params.action = action
        }

        if (withDeleted) {
            params.with_deleted = 'true'
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
            .then(resp => {
                if (isUpdate) {
                    onUpdateSuccess(dispatch, resp)
                } else {
                    onCreateSuccess(dispatch, resp)
                }
            }, error => {
                return dispatch({
                    type: isUpdate ? types.UPDATE_INTEGRATION_ERROR : types.CREATE_INTEGRATION_ERROR,
                    error,
                    reason: isUpdate ? 'Failed to update integration' : 'Failed to add integration'
                })
            })
    }
}

export function deactivateIntegration(id) {
    return (dispatch) => {
        const integration = fromJS({
            id,
            deactivated_datetime: moment().format(),
        })
        return dispatch(updateOrCreateIntegrationRequest(integration))
    }
}

export function activateIntegration(id) {
    return (dispatch) => {
        const integration = fromJS({
            id,
            deactivated_datetime: null,
        })
        return dispatch(updateOrCreateIntegrationRequest(integration))
    }
}

/**
 * Called when we create an integration or when we edit the settings.
 * @param integration
 * @param action
 * @returns {Function}
 */
export function updateOrCreateIntegration(integration, action, withDeleted) {
    return (dispatch) => {
        return dispatch(updateOrCreateIntegrationRequest(integration, action, withDeleted))
    }
}

export function importEmails(integration) {
    return (dispatch) => {
        dispatch({
            type: types.GMAIL_INTEGRATION_IMPORT_START,
            id: integration.get('id')
        })

        return axios.put(
            `/api/integrations/${integration.get('id')}/`,
            integration.toJS()
        )
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch(notify({
                    type: 'success',
                    message: 'Importation successfully started'
                }))
                return dispatch({
                    type: types.GMAIL_INTEGRATION_IMPORT_SUCCESS,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.GMAIL_INTEGRATION_IMPORT_ERROR,
                    error,
                    reason: 'Failed to start importation'
                })
            })
    }
}

export function activateFacebookOnboardingPage(data) {
    return (dispatch) => {
        dispatch({
            type: types.ACTIVATE_FACEBOOK_ONBOARDING_PAGES_START
        })

        return axios.put('/integrations/facebook/onboarding-pages/', data)
            .then((json = {}) => json.data)
            .then((resp) => {
                dispatch(notify({
                    type: 'success',
                    message: `Facebook page${data.length > 1 ? 's' : ''} successfully activated.`
                }))
                return dispatch({
                    type: types.ACTIVATE_FACEBOOK_ONBOARDING_PAGES_SUCCESS,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.ACTIVATE_FACEBOOK_ONBOARDING_PAGES_ERROR,
                    error,
                    reason: 'Failed to activate your Facebook page'
                })
            })
    }
}
