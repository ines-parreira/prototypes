// @flow

import {fromJS, type Map, type Record} from 'immutable'
import {browserHistory} from 'react-router'
import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'
import axios from 'axios'

import type Moment from 'moment'

import {DEFAULT_ACTIONS} from '../../config'
import {INSTAGRAM_AD_COMMENT_SOURCE, INSTAGRAM_COMMENT_SOURCE} from '../../config/ticket'
import browserNotification from '../../services/browserNotification'
import GorgiasApi from '../../services/gorgiasApi'
import socketManager from '../../services/socketManager'
import {isCurrentlyOnTicket, isTabActive} from '../../utils'
import {markChatAsRead} from '../chats/actions'
import * as newMessageActions from '../newMessage/actions'
import * as newMessageTypes from '../newMessage/constants'
import {getSourceTypeCache} from '../newMessage/responseUtils'
import {notify} from '../notifications/actions'
import * as ticketsSelectors from '../tickets/selectors'
import * as viewsSelectors from '../views/selectors'
import * as segmentTracker from '../../store/middlewares/segmentTracker'

import type {Action, Ticket, TicketMessage} from '../../models/ticket'
import type {Macro} from '../macro/types'
import type {dispatchType, getStateType, thunkActionType} from '../types'

import * as socketEventTypes from '../../services/socketManager/types'

import {buildPartialUpdateFromAction, getSourceTypeOfResponse, nestedReplace} from './utils'
import * as types from './constants'


export const mergeTicket = (ticket: Ticket) => (dispatch: dispatchType, getState: getStateType) => {
    const ticketRecord = fromJS(ticket)
    const state = getState()
    const {ticket: ticketState} = state

    // if received ticket data does not concern current ticket, do nothing
    if (ticketRecord.get('id') !== ticketState.get('id')) {
        return Promise.resolve()
    }

    // notification on new message while not on tab
    if (!isTabActive()) {
        const {ticket: previousTicket} = getState()

        const messagesLength = ticketRecord.get('messages', fromJS([])).size
        const previousMessagesLength = previousTicket.get('messages', fromJS([])).size

        const newMessage = ticketRecord.get('messages', fromJS([])).last()

        if (messagesLength !== previousMessagesLength && newMessage && !newMessage.get('from_agent')) {
            const title = newMessage.getIn(['sender', 'name'])
            const body = newMessage.get('body_text')
            browserNotification.newMessage({title, body})
        }
    }

    const currentMessages = ticketState.get('messages', fromJS([]))
    const messagesDifference = ticketRecord.get('messages', fromJS([])).size - currentMessages.size

    const mergeDispatch = dispatch({
        type: types.MERGE_TICKET,
        ticket: ticketRecord,
        messagesDifference,
    })

    if (messagesDifference) {
        dispatch(newMessageActions.resetFromTicket(ticketRecord))
    }

    return Promise.resolve(mergeDispatch)
}

export const mergeCustomer = (customer: Map<*, *>) => {
    return {
        type: types.MERGE_CUSTOMER,
        customer,
    }
}

export const fetchTicketReplyMacro = () => ({
    type: types.FETCH_TICKET_REPLY_MACRO
})

export const ticketPartialUpdate = (args: Object) => (dispatch: dispatchType, getState: getStateType) => {
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
        .then((resp) => {
            return dispatch({
                type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                resp
            })
        }, (error) => {
            return dispatch({
                type: types.TICKET_PARTIAL_UPDATE_ERROR,
                error,
                reason: `Failed to update ticket ${ticketId}`
            })
        })
}

export const addTags = (tags: string) => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.ADD_TICKET_TAGS,
        args: fromJS({tags}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const removeTag = (tag: string) => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.REMOVE_TICKET_TAG,
        args: fromJS({tag}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState())))
}

export const setSpam = (spam: boolean, callback: () => void = _noop) =>
    (dispatch: dispatchType, getState: getStateType) => {
        const {ticket} = getState()
        const currentSpam = ticket.get('spam')

        if (currentSpam === spam) {
            return Promise.resolve()
        }

        dispatch({
            type: types.SET_SPAM,
            spam
        })

        // execute callback immediately, do not wait for server answer
        callback()

        return dispatch(ticketPartialUpdate({spam}))
    }

export const setTrashed = (datetime: ?Moment, callback: () => void = _noop): thunkActionType =>
    (dispatch: dispatchType, getState: getStateType) => {
        const {ticket} = getState()
        const isTrashed = !!ticket.get('trashed_datetime')

        if (isTrashed && !!datetime) {
            return Promise.resolve()
        }

        dispatch({
            type: types.SET_TRASHED,
            trashed_datetime: datetime
        })

        // execute callback immediately, do not wait for server answer
        callback()

        return dispatch(ticketPartialUpdate({trashed_datetime: datetime})).then(() => {
            // display a notification when we trash a ticket
            if (datetime) {
                return dispatch(notify({
                    status: 'success',
                    message: 'Ticket deleted'
                }))
            }
        })
    }

export const setAgent = (assigneeUser: ?Object) => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.SET_AGENT,
        args: fromJS({assignee_user: assigneeUser}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setAssignee', getState())))
}

export const setTeam = (assigneeTeam: ?Object) => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.SET_TEAM,
        args: fromJS({assignee_team: assigneeTeam}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setTeamAssignee', getState())))
}

export const setCustomer = (customer: Object): thunkActionType => (dispatch: dispatchType) => {
    dispatch({
        type: types.SET_CUSTOMER,
        args: fromJS({customer}),
    })

    if (!customer || customer.isEmpty()) {
        return Promise.resolve()
    }

    socketManager.join('customer', customer.get('id'))

    return dispatch(ticketPartialUpdate({
        customer: fromJS({
            id: customer.get('id')
        })
    }))
}

export const setStatus = (status: string, callback: () => void = _noop) =>
    (dispatch: dispatchType, getState: getStateType) => {
        dispatch({
            type: types.SET_STATUS,
            args: fromJS({status}),
        })

        if (status === 'closed') {
            dispatch(notify({
                status: 'success',
                message: 'The ticket has been closed.'
            }))

            // execute callback immediately, do not wait for server answer
            callback()
        }

        return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setStatus', getState())))
    }

export const setSubject = (subject: string) => (dispatch: dispatchType, getState: getStateType) => {
    dispatch({
        type: types.SET_SUBJECT,
        args: fromJS({subject}),
    })

    return dispatch(ticketPartialUpdate(buildPartialUpdateFromAction('setSubject', getState())))
}

export const setSnooze = (datetime: Moment, callback: () => void = _noop) => (dispatch: dispatchType) => {
    const data = {
        snooze_datetime: datetime,
        status: 'closed'
    }

    dispatch({
        type: types.SET_SNOOZE,
        ...data
    })

    // execute callback immediately, do not wait for server answer
    callback()

    return dispatch(ticketPartialUpdate(data)).then(() => {
        dispatch(notify({
            status: 'success',
            message: 'The ticket has been closed and snoozed.'
        }))
    })
}

export const deleteMessage = (ticketId: number, messageId: number) => (dispatch: dispatchType) => {
    return axios.delete(`/api/tickets/${ticketId}/messages/${messageId}/`)
        .then((json = {}) => json.data)
        .then(() => {
            dispatch({
                type: types.DELETE_TICKET_MESSAGE_SUCCESS,
                messageId
            })
        }, (error) => {
            return dispatch({
                type: types.DELETE_TICKET_MESSAGE_ERROR,
                error,
                reason: `Failed to delete message ${messageId} from ticket ${ticketId}`
            })
        })
}

export const deleteActionOnApplied = (actionIndex: number, ticketId: number) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId
})

export const updateActionArgsOnApplied = (actionIndex: number, value: string, ticketId: number) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId
})

export const applyMacroAction = (action: Record<Action>) => (dispatch: dispatchType, getState: getStateType) => {
    const state = getState()
    const {ticket, currentUser} = state

    const {type, name} = action.toJS()
    if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
        console.error('Applying unknown macro action', name)
    }

    const args = action.get('arguments')

    // should have the same params in state/newMessage/actions/setResponseText
    return dispatch({
        type: name,
        args,
        ticketId: ticket.get('id'),
        ticket, // used in middleware, not in reducer
        appliedMacro: ticket.getIn(['state', 'appliedMacro']),
        currentUser, // used in middleware, not in reducer
        fromMacro: true, // used in middleware, not in reducer
    })
}

export const applyMacro = (macro: Macro, ticketId: number) => (dispatch: dispatchType, getState: getStateType) => {
    // render macro action arguments
    let state = getState()

    const renderedMacro = macro.update('actions', (actions) => {
        return actions.map((action) => {
            return action.update('arguments', (args) => nestedReplace(args, state.ticket, state.currentUser, (args) => {
                return dispatch(notify(args))
            }))
        })
    })

    dispatch({
        type: types.APPLY_MACRO,
        macro: renderedMacro,
        ticketId
    })

    const actions = renderedMacro.get('actions', fromJS([]))

    actions.forEach((action) => dispatch(applyMacroAction(action)))

    state = getState() // refetch state after macro actions has been applied

    const actionNames = actions.map((action) => action.get('name')).toJS()
    const partialUpdate = buildPartialUpdateFromAction(actionNames, state)

    dispatch(ticketPartialUpdate(partialUpdate))

    dispatch({
        type: newMessageTypes.NEW_MESSAGE_RECORD_MACRO,
        macro
    })

    return Promise.resolve()
}

export const clearAppliedMacro = (ticketId: number) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId
})

/**
 * Fetch a ticket from the API, and put it in the `ticket` store.
 *
 * @param ticketId: the id of the ticket to fetch
 * @param error: the error message
 * @param discreetly: (default: false) whether or not the function should dispatch `FETCH_TICKET_START`
 */
export const fetchTicket = (ticketId: string, discreetly: boolean = false) => (dispatch: dispatchType) => {
    if (ticketId === 'new') {
        return new Promise<thunkActionType>((resolve) => {
            // wait next tick before initializing the draft
            // so that draft-js is mounted (and Editor plugins are ran) before we initialize message content
            // otherwise on a new ticket plugins are not applied to the Editor
            setTimeout(() => {
                resolve(dispatch(newMessageActions.initializeMessageDraft()))
            }, 1)
        })
    }

    const parsedTicketId: number = parseInt(ticketId)

    if (!discreetly) {
        dispatch({
            type: types.FETCH_TICKET_START,
        })
    }

    dispatch(markChatAsRead(parsedTicketId))

    const url = `/api/tickets/${parsedTicketId}/`

    return axios.get(url)
        .then((json = {}) => json.data)
        .then((resp) => {
            if (_isEmpty(resp)) {
                console.error('No results for', url)
            }

            if (!isCurrentlyOnTicket(ticketId)) {
                return Promise.resolve()
            }

            const customerId = fromJS(resp).getIn(['customer', 'id'])

            if (parsedTicketId) {
                socketManager.join('ticket', parsedTicketId)
            }

            if (customerId) {
                socketManager.join('customer', customerId)
            }

            // dispatch for ticket reducer branch
            dispatch({
                type: types.FETCH_TICKET_SUCCESS,
                resp,
                ticketId: parsedTicketId,
            })

            // dispatch for newMessage reducer branch
            dispatch({
                type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                resp,
            })

            dispatch(newMessageActions.initializeMessageDraft())

            // trigger side effects for cached source type
            const cachedSourceType = getSourceTypeCache(ticketId)
            if (cachedSourceType) {
                dispatch(newMessageActions.prepare(cachedSourceType))
            }

            const sourceTypeOfResponse = getSourceTypeOfResponse(resp.messages)

            if ([INSTAGRAM_COMMENT_SOURCE, INSTAGRAM_AD_COMMENT_SOURCE].includes(sourceTypeOfResponse)) {
                dispatch(newMessageActions.prepare(sourceTypeOfResponse))
            }

            // Notify the server that we viewed this ticket
            socketManager.send('ticket-viewed', parsedTicketId)

            return dispatch(newMessageActions.resetReceiversAndSender)
        }, (error) => {
            return dispatch({
                type: types.FETCH_TICKET_ERROR,
                error,
                reason: `Failed to fetch ticket ${parsedTicketId}`
            })
        })
}

/**
 * Fetch the next or the previous ticket immediately
 * but wait for the Promise (`promise` argument) to be resolved to display it
 *
 * @param {number} ticketId - the id of the ticket from which we want the next or the previous ticket
 * @param {String} direction - `next` or `prev` to get the ticket after or before the current ticket
 * @param {String} promise - promise to resolve before displaying the ticket fetched
 * @returns {Promise}
 */
export const _goToNextOrPrevTicket = (ticketId: number, direction: string, promise: Promise<?dispatchType>) => {
    return (dispatch: dispatchType, getState: getStateType) => {
        if (!promise) {
            // we do not display the loading state if there is a promise to resolve
            // because we want to do it discreetly: while something else is happening.
            dispatch({
                type: types.FETCH_TICKET_START,
            })

            // create a simple Promise resolved to go to the ticket as soon as it's fetched
            promise = Promise.resolve()
        }

        const viewId = viewsSelectors.getActiveView(getState()).get('id')
        const viewCursor = ticketsSelectors.getCursor(getState())
        const url = `/api/views/${viewId}/tickets/${ticketId}/${direction}`

        if (!viewId) {
            return promise.then(() => {
                // there is no active view so we go to the first view
                browserHistory.push('/app')
            })
        }

        return axios.put(url, {cursor: viewCursor})
            .then((json = {}) => json.data)
            .then((ticket) => {
                // wait for the promise to be resolved to go to the ticket
                return promise.then(() => {
                    if (!ticket) {
                        // there is no other ticket the user can handle so we go back to the view
                        browserHistory.push(`/app/tickets/${viewId}`)
                        return
                    }

                    const customerId = fromJS(ticket).getIn(['customer', 'id'])

                    if (ticketId) {
                        socketManager.join('ticket', ticket.id)
                    }

                    if (customerId) {
                        socketManager.join('customer', customerId)
                    }

                    dispatch({
                        type: types.FETCH_TICKET_SUCCESS,
                        resp: ticket,
                        ticketId: ticket.id,
                    })

                    dispatch({
                        type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                        resp: ticket,
                    })

                    dispatch(newMessageActions.initializeMessageDraft())

                    const sourceTypeOfResponse = getSourceTypeOfResponse(ticket.messages)

                    if ([INSTAGRAM_COMMENT_SOURCE, INSTAGRAM_AD_COMMENT_SOURCE].includes(sourceTypeOfResponse)) {
                        dispatch(newMessageActions.prepare(sourceTypeOfResponse))
                    }

                    // Notify the server that we viewed this ticket
                    socketManager.send('ticket-viewed', ticket.id)
                    dispatch(newMessageActions.resetReceiversAndSender)

                    browserHistory.push(`/app/ticket/${ticket.id}`)
                })
            }, (error) => {
                return dispatch({
                    type: types.FETCH_TICKET_ERROR,
                    error,
                    reason: 'Failed to fetch ticket'
                })
            })
    }
}

/**
 * Fetch the previous ticket immediately
 * but wait the Promise (`promise` argument) to be resolved to display it
 */
export const goToPrevTicket = (ticketId: number, promise: Promise<?dispatchType>) => (dispatch: dispatchType) => {
    return dispatch(_goToNextOrPrevTicket(ticketId, 'prev', promise))
}

/**
 * Fetch the next ticket immediately
 * but wait the Promise (`promise` argument) to be resolved to display it
 */
export const goToNextTicket = (ticketId: number, promise: Promise<?dispatchType>) => (dispatch: dispatchType) => {
    return dispatch(_goToNextOrPrevTicket(ticketId, 'next', promise))
}

export const displayAuditLogEvents = (ticketId: number) => async (dispatch: dispatchType) => {
    segmentTracker.logEvent(segmentTracker.EVENTS.DISPLAY_ALL_EVENTS_CLICKED, {ticketId})

    const client = new GorgiasApi()
    const generator = client.getTicketEvents(ticketId)
    let total = 0

    dispatch({
        type: types.DISPLAY_TICKET_AUDIT_LOG_EVENTS,
    })

    for await (const events of generator) {
        total += events.size

        if (events.size) {
            dispatch({
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: events,
            })
        }
    }

    if (!total) {
        dispatch(notify({
            status: 'info',
            message: 'No event for this ticket',
        }))

        dispatch({
            type: types.HIDE_TICKET_AUDIT_LOG_EVENTS,
        })
    }
}

export const hideAuditLogEvents = () => (dispatch: dispatchType) => {
    dispatch({
        type: types.HIDE_TICKET_AUDIT_LOG_EVENTS,
    })

    dispatch({
        type: types.REMOVE_TICKET_AUDIT_LOG_EVENTS,
    })
}

export const handleMessageActionError = (ticketId: string) => (dispatch: dispatchType) => {
    let buttons = []
    let fetchPromise = null

    if (!isCurrentlyOnTicket(ticketId)) {
        buttons = [{
            primary: true,
            name: 'Review',
            onClick: () => {
                browserHistory.push(`/app/ticket/${ticketId}`)
            }
        }]
    } else {
        fetchPromise = dispatch(fetchTicket(ticketId, true))
    }

    dispatch(notify({
        status: 'error',
        dismissAfter: 0,
        allowHTML: true,
        message: 'Your last message could not be sent because an action broke on it, you should review it right now.',
        buttons
    }))

    return fetchPromise || Promise.resolve()
}

export const handleMessageError = (json: socketEventTypes.TicketMessageFailedEvent) => (dispatch: dispatchType) => {
    let buttons = []
    let fetchPromise = null

    if (!isCurrentlyOnTicket(json.ticket_id)) {
        buttons = [{
            primary: true,
            name: 'Review',
            onClick: () => {
                browserHistory.push(`/app/ticket/${json.ticket_id}`)
            }
        }]
    } else {
        fetchPromise = dispatch(fetchTicket(json.ticket_id, true))
    }

    dispatch(notify({
        status: 'error',
        dismissAfter: 0,
        allowHTML: true,
        message: 'Your last message could not be sent because ' + json.event.data.error.message,
        buttons
    }))

    return fetchPromise || Promise.resolve()
}

export function updateTicketMessage(ticketId: string, messageId: number, data: Object, action: ?string = null) {
    return (dispatch: dispatchType) => {
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
            .then((resp) => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_SUCCESS,
                    messageId,
                    resp
                })
            }, (error) => {
                return dispatch({
                    type: types.UPDATE_TICKET_MESSAGE_ERROR,
                    messageId,
                    error,
                    reason:
                        'Message was not sent. Please try again in a few moments. If the problem persists, contact us.'
                })
            })
    }
}

export function clearTicket() {
    return (dispatch: dispatchType, getState: getStateType) => {
        const state = getState()

        const shouldDisplayHistoryOnNextPage = state.ticket.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])

        dispatch({
            type: types.CLEAR_TICKET,
            shouldDisplayHistoryOnNextPage,
        })

        return dispatch(newMessageActions.resetReceiversAndSender)
    }
}

export function toggleHistory(state: boolean) {
    return {
        type: types.TOGGLE_HISTORY,
        state
    }
}

export function displayHistoryOnNextPage(state: boolean = true) {
    return {
        type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
        state
    }
}

export function deleteTicket(id: number) {
    return (dispatch: dispatchType) => {
        return axios.delete(`/api/tickets/${id}/`)
            .then((json = {}) => json.data)
            .then(() => {
                return dispatch(notify({
                    status: 'success',
                    message: 'Ticket deleted'
                }))
            }, (error) => {
                return dispatch({
                    type: types.DELETE_TICKET_ERROR,
                    error,
                    reason: `Failed to delete the ticket ${id}`,
                })
            })
    }
}

export function deleteTicketPendingMessage(message: Record<TicketMessage>) {
    return {
        type: types.DELETE_TICKET_PENDING_MESSAGE,
        message
    }
}

/**
 * Search a customer by email, and then fetch it and set it as customer of the current ticket.
 * @param email: the email of the customer we want to set as customer
 */
export const findAndSetCustomer = (email: string) => (dispatch: dispatchType) =>
    axios.post('/api/search/', {type: 'user_channel_email', query: email})
        .then((json = {}) => json.data)
        .then((resp) => {
            if (resp.data.length !== 1) {
                // We can't do anything if we are not sure which customer should be set as customer of the current
                // ticket. We don't want to log an error here, as this may be expected if the agent is sending an email
                // to a new customer.
                return Promise.resolve()
            }

            const channel = resp.data[0]

            return axios.get(`/api/customers/${channel.user.id}/`)
                .then((json = {}) => json.data)
                .then((resp): Promise<dispatchType> => {
                    return dispatch(setCustomer(fromJS(resp)))
                })
        })

