import axios from 'axios'
import {sortBy as _sortBy} from 'lodash'
import {browserHistory} from 'react-router'
import {notify} from '../notifications/actions'
import moment from 'moment'
import {fromJS} from 'immutable'
import * as types from './constants'


export function fetchIntegrations() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_INTEGRATIONS_START
        })

        return axios.get('/api/integrations/')
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

    browserHistory.push(`/app/integrations/${resp.type}/${resp.id || ''}`)

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
    if (window.confirm('Are you sure you want to delete this integration?')) {
        return (dispatch) => {
            dispatch({
                type: types.DELETE_INTEGRATION_START,
                id: integration.get('id')
            })

            axios.delete(`/api/integrations/${integration.get('id')}/`)
                .then((json = {}) => json.data)
                .then(() => {
                    dispatch({
                        type: types.DELETE_INTEGRATION_SUCCESS,
                        id: integration.get('id')
                    })

                    browserHistory.push(`/app/integrations/${integration.get('type')}`)

                    dispatch(notify({
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

    return {
        type: types.DELETE_INTEGRATION_CANCEL
    }
}

function updateOrCreateIntegrationRequest(integration, action) {
    return (dispatch) => {
        const isUpdate = integration.get('id')

        dispatch({
            type: isUpdate ? types.UPDATE_INTEGRATION_START : types.CREATE_INTEGRATION_START,
            integration
        })

        let promise

        if (isUpdate) {
            promise = axios.put(
                `/api/integrations/${integration.get('id')}/${action ? `?action=${action}` : ''}`,
                integration.toJS()
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

export function deactivateIntegration(integration) {
    return (dispatch) => {
        // We set deactivated_datetime using a UTC timestamp
        const newIntegration = integration.set('deactivated_datetime', moment().format())
        return updateOrCreateIntegrationRequest(newIntegration)(dispatch)
    }
}

export function activateIntegration(integration) {
    return (dispatch) => {
        const newIntegration = integration.set('deactivated_datetime', null)
        return updateOrCreateIntegrationRequest(newIntegration)(dispatch)
    }
}

/**
 * Called when we create an integration or when we edit the settings.
 * @param integration
 * @param action
 * @returns {Function}
 */
export function updateOrCreateIntegration(integration, action) {
    return (dispatch) => {
        // We make sure that the integration is active
        const newIntegration = integration.set('deactivated_datetime', null)
        return updateOrCreateIntegrationRequest(newIntegration, action)(dispatch)
    }
}

export function testHttpIntegration(integration) {
    return (dispatch) => {
        console.log('fake test', integration)

        dispatch({
            type: types.TEST_HTTP_INTEGRATION_START
        })

        setTimeout(() => {
            dispatch({
                type: types.TEST_HTTP_INTEGRATION_SUCCESS,
                response: {
                    json: {
                        hello: 'world'
                    }
                }
            })
        }, 2000)
    }
}
