// @flow
import axios from 'axios'
import {fromJS} from 'immutable'
import md5 from 'md5'
import {browserHistory} from 'react-router'

import {notify} from '../notifications/actions'
import {isCurrentlyOnTicket, stripErrorMessage} from '../../utils'

import * as constants from './constants'

import type {dispatchType, getStateType, thunkActionType} from '../types'
type responseType = {
    status: string,
    user_id: string,
    ticket_id: string,
    msg: string
}

export const search = (query: string): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.SEARCH_USERS_START,
    })

    return axios.post('/api/search/', {type: 'user_profile', query})
        .then((json = {}) => json.data)
        .then(resp => {
            return dispatch({
                type: constants.SEARCH_USERS_SUCCESS,
                resp,
            })
        }, error => {
            return dispatch({
                type: constants.SEARCH_USERS_ERROR,
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
})

export const similarUser = (userId: string): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.SEARCH_SIMILAR_USER_START
    })

    return axios.get(`/api/users/${userId}/similar/`)
        .then((json = {}) => json.data)
        .then(resp => {
            return dispatch({
                type: constants.SEARCH_SIMILAR_USER_SUCCESS,
                user: resp,
            })
        }, error => {
            return dispatch({
                type: constants.SEARCH_SIMILAR_USER_ERROR,
                error,
                reason: 'Failed to do the search similar users. Please try again...'
            })
        })
})

export const fetchUserPicture = (email: string = '') => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.FETCH_USER_PICTURE_START
    })

    // s = 50 means the picture's width=height=50px; d=404 means if there's no image, returns a 404 error
    const GRAVATAR_URL = `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=50`
    const GOOGLE_URL = `https://picasaweb.google.com/data/entry/api/user/${encodeURIComponent(email)}?alt=json`

    return axios.get(GRAVATAR_URL)
        .then(() => {
            return dispatch({
                type: constants.FETCH_USER_PICTURE_SUCCESS,
                url: GRAVATAR_URL,
                email
            })
        }, () => {
            return axios.get(GOOGLE_URL)
                .then((json = {}) => json.data)
                .then((data = {}) => {
                    const thumbnailUrl = fromJS(data).getIn(['entry', 'gphoto$thumbnail', '$t'])

                    if (thumbnailUrl) {
                        dispatch({
                            type: constants.FETCH_USER_PICTURE_SUCCESS,
                            url: thumbnailUrl,
                            email
                        })
                    } else {
                        dispatch({
                            type: constants.FETCH_USER_PICTURE_ERROR
                        })
                    }
                }, () => {
                    // DO NOT ADD AN ERROR FIELD HERE: it's on purpose, we don't want an error message to be
                    // displayed if there's no picture for a user
                    return dispatch({
                        type: constants.FETCH_USER_PICTURE_ERROR,
                    })
                })
        })
})

export const fetchPreviewUser = (userId: string): thunkActionType => ((dispatch: dispatchType): Promise<dispatchType> => {
    dispatch({
        type: constants.FETCH_PREVIEW_USER_START
    })

    return axios.get(`/api/users/${userId}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            return dispatch({
                type: constants.FETCH_PREVIEW_USER_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: constants.FETCH_PREVIEW_USER_ERROR,
                error,
                reason: 'Couldn\'t fetch the user. Please try again in a few minutes.'
            })
        })
})

/**
 * Send action from infobar button to server
 * @param actionName
 * @param integrationId
 * @param userId
 * @param payload
 * @param callback
 */
export const executeAction = (actionName: string, integrationId: string, userId: string, payload: {} = {}, callback: () => void) => ((dispatch: dispatchType, getState: getStateType): Promise<dispatchType> => {
    const state = getState()
    const {ticket} = state

    const ticketId = ticket.get('id')

    const data = {
        action_name: actionName,
        user_id: userId,
        ticket_id: ticketId,
        integration_id: integrationId,
        payload,
    }

    dispatch({
        type: constants.EXECUTE_ACTION_START,
        data,
        callback,
    })

    return axios.post('/api/actions/execute/', data)
        .then((json = {}) => json.data)
        .then(() => {
            return Promise.resolve()
        }, error => {
            return dispatch({
                type: constants.EXECUTE_ACTION_ERROR,
                data,
                error,
                reason: `Failed to execute action ${actionName} on user ${userId} for integration ${integrationId}`
            })
        })
})

/**
 * Handle asynchronous result from an executed action from server (returned by socket)
 * @param response
 */
export const handleExecutedAction = (response: responseType) => ((dispatch: dispatchType): Promise<dispatchType> => {
    if (response.status === 'error') {
        let buttons = [{
            primary: true,
            name: 'Review',
            onClick: () => {
                browserHistory.push(`/app/user/${response.user_id}`)
            }
        }]

        if (response.ticket_id) {
            if (isCurrentlyOnTicket(response.ticket_id)) {
                buttons = []
            } else {
                buttons[0].onClick = () => {
                    browserHistory.push(`/app/ticket/${response.ticket_id}`)
                }
            }
        }

        dispatch(notify({
            status: 'error',
            title: 'Something went wrong on your last action 😞',
            dismissAfter: 0,
            message: stripErrorMessage(response.msg),
            buttons,
        }))

        return dispatch({
            type: constants.EXECUTE_ACTION_ERROR,
            data: response,
        })
    }

    return dispatch({
        type: constants.EXECUTE_ACTION_SUCCESS,
        data: response,
    })
})
