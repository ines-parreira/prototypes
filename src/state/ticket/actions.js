import {fromJS} from 'immutable'
import Push from 'push.js'
import {browserHistory} from 'react-router'

import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'
import axios from 'axios'

import * as newMessageActions from '../newMessage/actions'
import * as types from './constants'
import * as newMessageTypes from '../newMessage/constants'

import {DEFAULT_ACTIONS} from '../../config'
import {setMacrosVisible} from '../macro/actions'
import {TICKET_VIEWED} from '../activity/constants'
import {notify} from '../notifications/actions'
import {renderTemplate} from '../../pages/common/utils/template'
import {
    isCurrentlyOnTicket,
    isTabActive,
    playNotificationSound,
} from '../../utils'
import {
    buildPartialUpdateFromAction,
} from './utils'

import SocketIO from '../../pages/common/utils/socketio'

export const mergeTicket = (ticket) => (dispatch, getState) => {
    ticket = fromJS(ticket)
    const state = getState()
    const {ticket: ticketState} = state

    // if received ticket data does not concern current ticket, do nothing
    if (ticket.get('id') !== ticketState.get('id')) {
        return Promise.resolve()
    }

    // notification on new message while not on tab
    if (!isTabActive()) {
        const {ticket: previousTicket} = getState()

        const messagesLength = ticket.get('messages', fromJS([])).size
        const previousMessagesLength = previousTicket.get('messages', fromJS([])).size

        const newMessage = ticket.get('messages', fromJS([])).last()

        if (messagesLength !== previousMessagesLength && newMessage && !newMessage.get('from_agent')) {
            const from = newMessage.getIn(['sender', 'name']) || 'Gorgias'
            const body = newMessage.get('body_text') || 'You received an answer'
            playNotificationSound()
            Push.create(from, {
                body: body,
                timeout: 5000,
                icon: `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/logo.png`,
                onClick: function () {
                    // send on helpdesk and close notification
                    window.focus()
                    this.close()
                }
            })
        }
    }

    const currentMessages = ticketState.get('messages', fromJS([]))
    const messagesDifference = ticket.get('messages', fromJS([])).size - currentMessages.size

    const mergeDispatch = dispatch({
        type: types.MERGE_TICKET,
        ticket,
        messagesDifference,
    })

    if (messagesDifference) {
        dispatch(newMessageActions.resetFromTicket(ticket))
    }

    return mergeDispatch
}

export const mergeRequester = (user) => {
    return {
        type: types.MERGE_REQUESTER,
        user,
    }
}

export const fetchTicketReplyMacro = () => ({
    type: types.FETCH_TICKET_REPLY_MACRO
})

export const ticketPartialUpdate = (args) => (dispatch, getState) => {
    if (_isEmpty(args)) {
        return Promise.resolve()
    }

    const {ticket} = getState()
    const ticketId = ticket.get('id')

    // do not send to server if it's a partial update on a new ticket
    if (!ticketId) {
        return Promise.resolve()
    }

    dispatch({
        type: types.TICKET_PARTIAL_UPDATE_START,
        args,
    })

    return axios.put(`/api/tickets/${ticketId}/`, args)
        .then((json = {}) => json.data)
        .then(resp => {
            dispatch({
                type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                resp
            })
        }, error => {
            return dispatch({
                type: types.TICKET_PARTIAL_UPDATE_ERROR,
                error,
                reason: `Failed to update ticket ${ticketId}`
            })
        })
}

export const addTags = (tags) => (dispatch, getState) => {
    dispatch({
        type: types.ADD_TICKET_TAGS,
        args: fromJS({tags}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const removeTag = (tag) => (dispatch, getState) => {
    dispatch({
        type: types.REMOVE_TICKET_TAG,
        args: fromJS({tag}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const togglePriority = (priority = null) => (dispatch, getState) => { // priority argument is optional
    dispatch({
        type: types.TOGGLE_PRIORITY,
        args: fromJS({priority}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setPriority', getState())))
}

export const setAgent = (assigneeUser) => (dispatch, getState) => {
    dispatch({
        type: types.SET_AGENT,
        args: fromJS({assignee_user: assigneeUser}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setAssignee', getState())))
}

export const setRequester = (requester) => (dispatch) => {
    dispatch({
        type: types.SET_REQUESTER,
        args: fromJS({requester}),
    })

    return dispatch(ticketPartialUpdate({
        requester: fromJS({
            id: requester.get('id')
        })
    }))
}

export const setStatus = (status, onClose = _noop) => (dispatch, getState) => {
    dispatch({
        type: types.SET_STATUS,
        args: fromJS({status}),
    })

    if (status === 'closed') {
        dispatch(notify({
            status: 'success',
            message: 'The ticket has been closed.'
        }))

        onClose()
    }

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setStatus', getState())))
}

export const setSubject = (subject) => (dispatch, getState) => {
    dispatch({
        type: types.SET_SUBJECT,
        args: fromJS({subject}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setSubject', getState())))
}

export const deleteMessage = (ticketId, messageId) => (dispatch) => {
    dispatch({
        type: types.DELETE_TICKET_MESSAGE_START
    })

    return axios.delete(`/api/tickets/${ticketId}/messages/${messageId}/`)
        .then((json = {}) => json.data)
        .then(() => {
            dispatch({
                type: types.DELETE_TICKET_MESSAGE_SUCCESS,
                messageId
            })
        }, error => {
            return dispatch({
                type: types.DELETE_TICKET_MESSAGE_ERROR,
                error,
                reason: `Failed to delete message ${messageId} from ticket ${ticketId}`
            })
        })
}

export const deleteActionOnApplied = (actionIndex, ticketId) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId
})

export const updateActionArgsOnApplied = (actionIndex, value, ticketId) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId
})

export const applyMacroAction = (action) => (dispatch, getState) => {
    const state = getState()
    const {ticket, currentUser} = state

    const {type, name} = action.toJS()
    if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
        console.error('Applying unknown macro action', name)
    }

    const args = action.get('arguments')

    // should have the same params in state/newMessage/actions/setResponseText
    dispatch({
        type: name,
        args,
        ticketId: ticket.get('id'),
        ticket, // used in middleware, not in reducer
        appliedMacro: ticket.getIn(['state', 'appliedMacro']),
        currentUser, // used in middleware, not in reducer
        fromMacro: true, // used in middleware, not in reducer
    })
}

const renderObject = (argument, context) => {
    let ret = argument

    if (typeof argument === 'string') {
        ret = renderTemplate(argument, context)
    } else if (typeof argument === 'object') {
        ret = argument.map(v => renderObject(v, context))
    }

    return ret
}

export const replaceIntegrationVariables = (integrationType, ticketState, variable, newArgument, dispatch) => {
    let integrations = ticketState
        .getIn(['requester', 'integrations'], fromJS([]))
        .filter((integration) => {
            return integration.get('__integration_type__') === integrationType
        })

    // if we have updated_at in customer, sort integrations by the update date so we use the most recent updates
    if (!integrations.isEmpty() && integrations.first().getIn(['customer', 'updated_at'])) {
        integrations = integrations.sortBy(integration => integration.getIn(['customer', 'updated_at'])).reverse()
    }

    const integrationIds = integrations.map((_, integrationId) => integrationId).toList()

    const integrationId = integrationIds.first()

    if (!integrationId) {
        dispatch(notify({
            type: 'warning',
            title: `This user does not have any ${integrationType} information`,
        }))
        return newArgument.replace(variable, '')
    }

    const newVariable = variable.replace('integrations.shopify', `integrations[${integrationId}]`)
    return newArgument.replace(variable, newVariable)
}

const replaceVariables = (argument, state, dispatch) => {
    let ticketState = state.ticket

    // If there's a var of format `ticket.requester.integrations.XXX`, then it's a dynamic variable.
    // Else, it would be `ticket.requester.integrations[XXX]`.
    let variables = argument.match(/\{ticket.requester.integrations.[\w\d\]\[._-]+}/g)
    let newArgument = argument

    if (variables) {
        // If a variable is a dynamic variable, we try to replace `integrations.{type}` with
        // `integrations[correct-integration-id]`.
        variables.forEach((variable) => {
            if (variable.includes('integrations.shopify')) {
                newArgument = replaceIntegrationVariables('shopify', ticketState, variable, newArgument, dispatch)
            }

            if (variable.includes('integrations.recharge')) {
                newArgument = replaceIntegrationVariables('recharge', ticketState, variable, newArgument, dispatch)
            }
        })
    }

    return renderObject(newArgument, {
        ticket: ticketState.toJS(),
        current_user: state.currentUser.toJS()
    })
}

const nestedReplace = (obj, state, dispatch) => {
    if (typeof obj === 'string') {
        return replaceVariables(obj, state, dispatch)
    }

    if (typeof obj === 'object') {
        return obj.map((item) => nestedReplace(item, state, dispatch))
    }

    return obj
}

export const applyMacro = (macro, ticketId) => (dispatch, getState) => {
    // render macro action arguments
    let state = getState()

    const renderedMacro = macro.set('actions', macro.get('actions').map(
        (action) => action.set('arguments', nestedReplace(action.get('arguments'), state, dispatch))
    ))

    dispatch({
        type: types.APPLY_MACRO,
        macro: renderedMacro,
        ticketId
    })

    const actions = renderedMacro.get('actions', fromJS([]))

    actions.forEach(action => dispatch(applyMacroAction(action)))

    state = getState() // refetch state after macro actions has been applied

    const actionNames = actions.map(a => a.get('name')).toJS()
    const partialUpdate = buildPartialUpdateFromAction(actionNames, state)

    dispatch(ticketPartialUpdate(partialUpdate))

    dispatch({
        type: newMessageTypes.NEW_MESSAGE_RECORD_MACRO,
        macro
    })

    dispatch(setMacrosVisible(false))
}

export const clearAppliedMacro = (ticketId) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId
})

export const fetchTicket = (ticketId, displayLoading = true) => (dispatch) => {
    if (ticketId === 'new') {
        return new Promise((resolve) => {
            // wait next tick before initializing the draft
            // so that draft-js is mounted (and Editor plugins are ran) before we initialize message content
            // otherwise on a new ticket plugins are not applied to the Editor
            setTimeout(() => {
                resolve(dispatch(newMessageActions.initializeMessageDraft()))
            }, 1)
        })
    }

    dispatch({
        type: types.FETCH_TICKET_START,
        displayLoading,
    })

    dispatch({
        type: TICKET_VIEWED,
        ticketId
    })

    const url = `/api/tickets/${ticketId}/`

    return axios.get(url)
        .then((json = {}) => json.data)
        .then(resp => {
            if (_isEmpty(resp)) {
                console.error('No results for', url)
            }

            if (!isCurrentlyOnTicket(ticketId)) {
                return Promise.resolve()
            }

            // dispatch for ticket reducer branch
            dispatch({
                type: types.FETCH_TICKET_SUCCESS,
                resp,
                ticketId: parseInt(ticketId),
                displayLoading,
            })

            // dispatch for newMessage reducer branch
            dispatch({
                type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                resp,
            })

            dispatch(newMessageActions.initializeMessageDraft())

            // Notify the server that we viewed this ticket
            const io = new SocketIO()
            io._sendTicketViewed(ticketId)

            return dispatch(newMessageActions.resetReceiversAndSender)
        }, error => {
            if (!displayLoading) {
                return Promise.resolve()
            }

            return dispatch({
                type: types.FETCH_TICKET_ERROR,
                error,
                reason: `Failed to fetch ticket ${ticketId}`
            })
        })
}

export const handleMessageActionError = (ticketId) => (dispatch) => {
    let buttons = []

    if (!isCurrentlyOnTicket(ticketId)) {
        buttons = [{
            primary: true,
            name: 'Review',
            onClick: () => {
                browserHistory.push(`/app/ticket/${ticketId}`)
            }
        }]
    }

    return dispatch(notify({
        status: 'error',
        title: 'Something went wrong on your last message 😞',
        dismissAfter: 0,
        allowHTML: true,
        message: 'The message was not sent because an action broke on it, you should review it right now.',
        buttons
    }))
}

export function updateTicketMessage(ticketId, messageId, data, action = null) {
    return (dispatch) => {
        dispatch({
            type: types.UPDATE_TICKET_MESSAGE_START,
            messageId
        })

        let url = `/api/tickets/${ticketId}/messages/${messageId}/`

        if (action) {
            url = `${url}?action=${action}`
        }

        return axios.put(url, data)
            .then((json = {}) => json.data)
            .then(resp => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_SUCCESS,
                    messageId,
                    resp
                })
            }, error => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_ERROR,
                    messageId,
                    error,
                    reason: 'Message was not sent. Please try again in a few moments. If the problem persists contact us.'
                })
            })
    }
}

export function clearTicket() {
    return (dispatch, getState) => {
        const state = getState()

        const shouldDisplayHistoryOnNextPage = state.ticket.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])

        dispatch(setMacrosVisible(true))

        dispatch({
            type: types.CLEAR_TICKET,
            shouldDisplayHistoryOnNextPage,
        })

        return dispatch(newMessageActions.resetReceiversAndSender)
    }
}

export function toggleHistory(state) {
    return {
        type: types.TOGGLE_HISTORY,
        state
    }
}

export function displayHistoryOnNextPage(state = true) {
    return {
        type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
        state
    }
}

export function deleteTicket(id) {
    return (dispatch) => {
        return axios.delete(`/api/tickets/${id}/`)
            .then((json = {}) => json.data)
            .then(() => {
                return dispatch(notify({
                    status: 'success',
                    message: 'Ticket deleted'
                }))
            }, error => {
                return dispatch({
                    type: types.DELETE_TICKET_ERROR,
                    error,
                    reason: `Failed to delete the ticket ${id}`,
                })
            })
    }
}

export function deleteTicketPendingMessage(message) {
    return {
        type: types.DELETE_TICKET_PENDING_MESSAGE,
        message
    }
}
