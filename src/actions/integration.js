import reqwest from 'reqwest'
import {systemMessage} from './systemMessage'
import {browserHistory} from 'react-router'

export const DELETE_INTEGRATION_SUCCESS = 'DELETE_INTEGRATION_SUCCESS'

export const FETCH_INTEGRATIONS_START = 'FETCH_INTEGRATIONS_START'
export const FETCH_INTEGRATIONS_SUCCESS = 'FETCH_INTEGRATIONS_SUCCESS'

export const FACEBOOK_LOGIN = 'FACEBOOK_LOGIN'
export const FACEBOOK_LOGIN_SUCCESS = 'FACEBOOK_LOGIN_SUCCESS'
export const TOGGLE_PRIVATE_MESSAGES_ENABLED = 'TOGGLE_PRIVATE_MESSAGES_ENABLED'
export const TOGGLE_POSTS_ENABLED = 'TOGGLE_POSTS_ENABLED'
export const TOGGLE_IMPORT_HISTORY_ENABLED = 'TOGGLE_IMPORT_HISTORY_ENABLED'

export const UPDATE_INTEGRATION_START = 'UPDATE_INTEGRATION_START'
export const UPDATE_INTEGRATION_SUCCESS = 'UPDATE_INTEGRATION_SUCCESS'

export const SELECT_FACEBOOK_PAGE = 'SELECT_FACEBOOK_PAGE'
export const FETCH_INTEGRATION_START = 'FETCH_INTEGRATION_START'
export const FETCH_INTEGRATION_SUCCESS = 'FETCH_INTEGRATION_SUCCESS'


export function fetchIntegration(integrationId) {
    return (dispatch) => {
        dispatch({
            type: FETCH_INTEGRATION_START,
            id: integrationId
        })

        return reqwest({
            url: `/api/integrations/${integrationId}`,
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_INTEGRATION_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch integration',
                internalMessage: err
            }))
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
            type: FETCH_INTEGRATIONS_START
        })

        return reqwest({
            url: '/api/integrations/',
            type: 'json',
            method: 'GET',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch({
                type: FETCH_INTEGRATIONS_SUCCESS,
                resp
            })
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to fetch integrations',
                internalMessage: err
            }))
        })
    }
}

export function deleteintegration(integration) {
    if (window.confirm('Are you sure you want to delete this integration?')) {
        return (dispatch) => reqwest({
            url: `/api/integrations/${integration.get('id')}/`,
            method: 'delete'
        }).then((resp) => {
            dispatch({
                type: DELETE_INTEGRATION_SUCCESS,
                resp
            })
            browserHistory.push(`/app/settings/integrations/${integration.get('type')}`)
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'error: failed to delete the integration',
                internalMessage: err
            }))
        })
    }

    return {
        type: 'noop'
    }
}


function onFacebookLoginSuccess(dispatch) {
    return (response) => {
        if (response.authResponse) {
            reqwest({
                url: `/callbacks/facebook/receive-access-token?user_id=${response.authResponse.userID}&access_token=${response.authResponse.accessToken}`,
                method: 'POST'
            }).then((resp) => {
                // Tell the reducer to update the state and proceed to next step.
                dispatch(
                    {
                        type: FACEBOOK_LOGIN_SUCCESS,
                        resp
                    }
                )
                browserHistory.push('/app/settings/integrations/facebook/new')
            }).catch((err) => {
                dispatch(systemMessage({
                    type: 'error',
                    header: 'Error: failed to POST facebook token to the backend',
                    internalMessage: err
                }))
            })
        } else {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: user canceled login or did not fully authorize',
                msg: 'Error: user canceled login or did not fully authorize'
            }))
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
            type: FACEBOOK_LOGIN
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
            type: UPDATE_INTEGRATION_START,
            integration
        })

        reqwest({
            url: integration.get('id') ? `/api/integrations/${integration.get('id')}/${action ? `?action=${action}` : ''}` : '/api/integrations/',
            method: integration.get('id') ? 'PUT' : 'POST',
            data: JSON.stringify(integration),
            type: 'json',
            contentType: 'application/json'
        }).then((resp) => {
            dispatch(
                {
                    type: UPDATE_INTEGRATION_SUCCESS,
                    resp
                })
            // Re-fetch everything so we get the latest data from the db in the app
            fetchIntegrations()(dispatch)
            browserHistory.push(`/app/settings/integrations/${integration.get('type')}`)
        }).catch((err) => {
            dispatch(systemMessage({
                type: 'error',
                header: 'Error: failed to add integration.',
                internalMessage: err
            }))
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
        type: SELECT_FACEBOOK_PAGE,
        pageId
    }
}


export function togglePrivateMessagesEnabled() {
    return {
        type: TOGGLE_PRIVATE_MESSAGES_ENABLED
    }
}

export function togglePostsEnabled() {
    return {
        type: TOGGLE_POSTS_ENABLED
    }
}

export function toggleImportHistoryEnabled() {
    return {
        type: TOGGLE_IMPORT_HISTORY_ENABLED
    }
}
