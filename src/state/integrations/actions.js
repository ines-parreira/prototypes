import axios from 'axios'
import {sortBy as _sortBy} from 'lodash'
import {browserHistory} from 'react-router'
import {systemMessage} from '../systemMessage/actions'
import * as types from './constants'

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
                    integration: resp
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
                .then(() => {
                    dispatch({
                        type: types.DELETE_INTEGRATION_SUCCESS,
                        id: integration.get('id')
                    })

                    browserHistory.push(`/app/integrations/${integration.get('type')}`)

                    dispatch(systemMessage({
                        type: 'success',
                        msg: 'Integration successfully deleted'
                    }))
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
        if (!response) {
            // no response means that we're already authenticated so just redirect to the pages
            dispatch({
                type: types.FACEBOOK_LOGIN_SUCCESS
            })
            browserHistory.push('/app/integrations/facebook/new')
        } else {
            if (response.authResponse) {
                axios.post(`/callbacks/facebook/receive-access-token?user_id=${response.authResponse.userID}&access_token=${response.authResponse.accessToken}`)
                    .then((json = {}) => json.data)
                    .then(resp => {
                        dispatch({
                            type: types.FACEBOOK_LOGIN_SUCCESS,
                            resp
                        })
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
}

export const facebookLoginStatus = () => ((dispatch) => {
    FB.getLoginStatus((res) => {
        dispatch({
            type: types.FACEBOOK_LOGIN_STATUS,
            status: res.status
        })
    })
})

/**
 * We want to login the user, ask for relevant permissions and then display the list of pages so s/he can choose the
 * ones to import.
 * @returns {function()}
 *
 * See https://developers.facebook.com/docs/facebook-login/web
 */
export const facebookLogin = (status) => ((dispatch) => {
    dispatch({
        type: types.FACEBOOK_LOGIN
    })

    if (status === 'connected') {
        onFacebookLoginSuccess(dispatch)()
    } else {
        // login popup
        FB.login(onFacebookLoginSuccess(dispatch), {
            scope: 'manage_pages,publish_pages,read_page_mailboxes'
        })
    }
})

function updateOrCreateIntegrationRequest(integration, action) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_INTEGRATION_START,
            integration
        })

        let promise
        const isUpdate = integration.get('id')

        if (isUpdate) {
            promise = axios.put(`/api/integrations/${integration.get('id')}/${action ? `?action=${action}` : ''}`, integration.toJS())
        } else {
            promise = axios.post('/api/integrations/', integration.toJS())
        }

        return promise
            .then((json = {}) => json.data)
            .then(resp => {
                dispatch({
                    type: types.UPDATE_INTEGRATION_SUCCESS,
                    resp
                })

                fetchIntegrations()(dispatch)

                if (!isUpdate) {
                    browserHistory.push(`/app/integrations/${integration.get('type')}/${resp.id}`)
                }

                dispatch(systemMessage({
                    type: 'success',
                    msg: `Integration successfully ${isUpdate ? 'updated' : 'added'}`
                }))
            })
            .catch(error => {
                dispatch({
                    type: types.UPDATE_INTEGRATION_ERROR,
                    error,
                    reason: isUpdate ? 'Failed to update integration' : 'Failed to add integration'
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

export function activateIntegration(integration) {
    return (dispatch) => {
        // We set deactivated_datetime using a UTC timestamp
        const newIntegration = integration.set('deactivated_datetime', null)
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
    browserHistory.push('/app/integrations/facebook/new/addpage')
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
