import React from 'react'
import axios from 'axios'
import {Link} from 'react-router'
import {fromJS} from 'immutable'
import md5 from 'md5'
import {Button} from 'reactstrap'

import {notify} from '../notifications/actions'
import {isCurrentlyOnTicket, stripErrorMessage} from '../../utils'

import * as types from './constants'

export const search = (query, searchType = 'infobar-user') => ((dispatch) => {
    dispatch({
        type: searchType === 'infobar-user' ? types.SEARCH_USERS_START : types.SEARCH_TICKETS_START
    })

    return axios.post('/api/search/', {
        type: searchType,
        query
    })
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: searchType === 'infobar-user' ? types.SEARCH_USERS_SUCCESS : types.SEARCH_TICKETS_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: searchType === 'infobar-user' ? types.SEARCH_USERS_ERROR : types.SEARCH_TICKETS_ERROR,
                error,
                reason: 'Failed to do the search. Please try again...'
            })
        })
})

export const resetSearch = () => ({
    type: types.RESET_SEARCH
})

export const fetchUserPicture = (email = '') => ((dispatch) => {
    dispatch({
        type: types.FETCH_USER_PICTURE_START
    })

    // s = 50 means the picture's width=height=50px; d=404 means if there's no image, returns a 404 error
    const GRAVATAR_URL = `https://www.gravatar.com/avatar/${md5(email)}?d=404&s=50`
    const GOOGLE_URL = `https://picasaweb.google.com/data/entry/api/user/${encodeURIComponent(email)}?alt=json`

    return axios.get(GRAVATAR_URL)
        .then(() => {
            dispatch({
                type: types.FETCH_USER_PICTURE_SUCCESS,
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
                            type: types.FETCH_USER_PICTURE_SUCCESS,
                            url: thumbnailUrl,
                            email
                        })
                    } else {
                        dispatch({
                            type: types.FETCH_USER_PICTURE_ERROR
                        })
                    }
                }, () => {
                    // DO NOT ADD AN ERROR FIELD HERE: it's on purpose, we don't want an error message to be
                    // displayed if there's no picture for a user
                    return dispatch({
                        type: types.FETCH_USER_PICTURE_ERROR,
                    })
                })
        })
})

export const fetchPreviewUser = (userId) => ((dispatch) => {
    dispatch({
        type: types.FETCH_PREVIEW_USER_START
    })

    return axios.get(`/api/users/${userId}/`)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.FETCH_PREVIEW_USER_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.FETCH_PREVIEW_USER_ERROR,
                error,
                reason: 'Couldn\'t fetch the user. Please try again in a few minutes.'
            })
        })
})

export const setInfobarMode = (mode) => ({
    type: types.SET_INFOBAR_MODE,
    mode
})

export const toggleMergeUsersModal = (value) => ({
    type: types.TOGGLE_MERGE_USERS_MODAL,
    value
})

/**
 * Send action from infobar button to server
 * @param actionName
 * @param integrationId
 * @param userId
 * @param payload
 * @param callback
 */
export const executeAction = (actionName, integrationId, userId, payload = {}, callback) => ((dispatch, getState) => {
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
        type: types.EXECUTE_ACTION_START,
        data,
        callback,
    })

    return axios.post('/api/actions/execute/', data)
        .then((json = {}) => json.data)
        .then(() => {
            return Promise.resolve()
        }, error => {
            return dispatch({
                type: types.EXECUTE_ACTION_ERROR,
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
export const handleExecutedAction = (response) => ((dispatch) => {
    if (response.status === 'error') {
        dispatch(notify({
            type: 'error',
            title: 'Something went wrong on your last action :/',
            autoDismiss: false,
            children: (
                <div>
                    <p>
                        {stripErrorMessage(response.msg)}
                    </p>
                    <div className="buttons">
                        {
                            response.ticket_id ? (
                                    <div>
                                        {
                                            !isCurrentlyOnTicket(response.ticket_id) && (
                                                <Button
                                                    tag={Link}
                                                    color="primary"
                                                    to={`/app/ticket/${response.ticket_id}`}
                                                >
                                                    Review ticket
                                                </Button>
                                            )
                                        }
                                    </div>
                                ) : (
                                    <Button
                                        tag={Link}
                                        color="primary"
                                        to={`/app/user/${response.user_id}`}
                                    >
                                        Review user
                                    </Button>
                                )
                        }
                    </div>
                </div>
            )
        }))

        return dispatch({
            type: types.EXECUTE_ACTION_ERROR,
            data: response,
        })
    }

    return dispatch({
        type: types.EXECUTE_ACTION_SUCCESS,
        data: response,
    })
})
