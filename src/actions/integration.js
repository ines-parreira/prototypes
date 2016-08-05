import axios from 'axios'
import {browserHistory} from 'react-router'
import * as types from '../constants/integration'

export function fetchIntegration(integrationId) {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_INTEGRATION_START,
            id: integrationId
        })

        return axios.get(`/api/integrations/${integrationId}`)
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_INTEGRATION_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_INTEGRATION_ERROR,
                    error,
                    reason: 'Failed to fetch integration'
                })
            })
    }
}


export function updateIntegration(integrationType, integrationId) {
    browserHistory.push(`/app/settings/integrations/${integrationType}/${integrationId}`)
    return fetchIntegration(integrationId)
}


export function fetchIntegrations() {
    return (dispatch) => {
        dispatch({
            type: types.FETCH_INTEGRATIONS_START
        })

        return axios.get('/api/integrations/')
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.FETCH_INTEGRATIONS_SUCCESS,
                    resp
                })
            })
            .catch(error => {
                dispatch({
                    type: types.FETCH_INTEGRATIONS_ERROR,
                    error,
                    reason: 'Failed to fetch integrations'
                })
            })
    }
}

export function deleteIntegration(integration) {
    if (window.confirm('Are you sure you want to delete this integration?')) {
        return (dispatch) => {
            axios.delete(`/api/integrations/${integration.get('id')}/`)
                .then((json = {}) => json.data)
                .then(resp => {
                    dispatch({
                        type: types.DELETE_INTEGRATION_SUCCESS,
                        resp
                    })
                    browserHistory.push(`/app/settings/integrations/${integration.get('type')}`)
                })
                .catch(error => {
                    dispatch({
                        type: types.DELETE_INTEGRATION_ERROR,
                        error,
                        reason: 'Failed to delete the integration'
                    })
                })
        }
    }

    return {
        type: 'noop'
    }
}


function onFacebookLoginSuccess(dispatch) {
    return (response) => {
        if (response.authResponse) {
            axios.post(`/callbacks/facebook/receive-access-token?user_id=${response.authResponse.userID}&access_token=${response.authResponse.accessToken}`)
                .then((json = {}) => json.data)
                .then(resp => {
                    dispatch({
                        type: types.FACEBOOK_LOGIN_SUCCESS,
                        resp
                    })
                    browserHistory.push('/app/settings/integrations/facebook/new')
                })
                .catch(error => {
                    dispatch({
                        type: types.FACEBOOK_LOGIN_ERROR,
                        error,
                        reason: 'Failed to POST facebook token to the backend'
                    })
                })
        } else {
            dispatch({
                type: types.FACEBOOK_LOGIN_ERROR,
                error: true,
                reason: 'User canceled login or did not fully authorize'
            })
        }
    }
}


/**
 * We want to login the user, ask for relevant permissions and then display the list of pages so s/he can choose the
 * ones to import.
 * @returns {function()}
 *
 * See https://developers.facebook.com/docs/facebook-login/web
 */
export function facebookLogin() {
    return (dispatch) => {
        dispatch({
            type: types.FACEBOOK_LOGIN
        });

        // eslint-disable-next-line no-undef
        FB.getLoginStatus((res) => {
            if (res.status === 'connected') {
                onFacebookLoginSuccess(dispatch)(res)
            } else {
                // login popup
                // eslint-disable-next-line no-undef
                FB.login(onFacebookLoginSuccess(dispatch), {scope: 'manage_pages,publish_pages,read_page_mailboxes'})
            }
        })
    }
}

export function twitterLogin() {
    return (dispatch) => {
        dispatch({
            type: 'NOOP'
        })
    }
}

export function mailLogin() {
    return (dispatch) => {
        dispatch({
            type: 'NOOP'
        })
    }
}

function updateOrCreateIntegrationRequest(integration, action) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_INTEGRATION_START,
            integration
        })

        let promise

        if (integration.get('id')) {
            promise = axios.put(`/api/integrations/${integration.get('id')}/${action ? `?action=${action}` : ''}`, JSON.stringify(integration))
        } else {
            promise = axios.post('/api/integrations/', JSON.stringify(integration))
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch(
                    {
                        type: types.UPDATE_INTEGRATION_SUCCESS,
                        resp
                    })
                fetchIntegrations()(dispatch)
                browserHistory.push(`/app/settings/integrations/${integration.get('type')}`)
            })
            .catch(error => {
                dispatch({
                    type: types.UPDATE_INTEGRATION_ERROR,
                    error,
                    reason: 'Failed to add integration'
                })
            })
    }
}

export function deactivateIntegration(integration) {
    return (dispatch) => {
        // We set deactivated_datetime using a UTC timestamp
        const newIntegration = integration.set('deactivated_datetime', new Date().getTime())
        updateOrCreateIntegrationRequest(newIntegration)(dispatch)
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
        updateOrCreateIntegrationRequest(newIntegration, action)(dispatch)
    }
}


export function selectFacebookPage(pageId) {
    browserHistory.push('/app/settings/integrations/facebook/new/addpage')
    return {
        type: types.SELECT_FACEBOOK_PAGE,
        pageId
    }
}


export function togglePrivateMessagesEnabled() {
    return {
        type: types.TOGGLE_PRIVATE_MESSAGES_ENABLED
    }
}

export function togglePostsEnabled() {
    return {
        type: types.TOGGLE_POSTS_ENABLED
    }
}

export function toggleImportHistoryEnabled() {
    return {
        type: types.TOGGLE_IMPORT_HISTORY_ENABLED
    }
}
