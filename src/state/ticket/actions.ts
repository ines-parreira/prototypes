import {fromJS, Map, List} from 'immutable'
import {browserHistory} from 'react-router'
import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'
import axios, {AxiosError} from 'axios'
import {createAction} from '@reduxjs/toolkit'
import {removeNotification} from 'reapop'
import {Moment} from 'moment'

import {TicketMessageSourceType} from '../../business/types/ticket'
import {DEFAULT_ACTIONS} from '../../config.js'
import browserNotification from '../../services/browserNotification'
import GorgiasApi from '../../services/gorgiasApi'
import socketManager from '../../services/socketManager/socketManager.js'
import {isCurrentlyOnTicket, isTabActive} from '../../utils.js'
import {markChatAsRead} from '../chats/actions'
import * as newMessageActions from '../newMessage/actions'
import * as newMessageTypes from '../newMessage/constants'
import {getSourceTypeCache} from '../newMessage/responseUtils'
import {notify} from '../notifications/actions'
import * as ticketsSelectors from '../tickets/selectors.js'
import * as viewsSelectors from '../views/selectors.js'
import * as segmentTracker from '../../store/middlewares/segmentTracker.js'

import {ApiListResponsePagination} from '../../models/api/types'
import {Action, Ticket, TicketMessage} from '../../models/ticket/types'
import {Macro} from '../macro/types'
import {StoreDispatch, RootState} from '../types'

import * as socketEventTypes from '../../services/socketManager/types'
import {Customer} from '../customers/types'
import {UserSearchResult} from '../newMessage/types'
import {
    NotificationStatus,
    Notification,
    NotificationButton,
} from '../notifications/types'

import {
    buildPartialUpdateFromAction,
    getSourceTypeOfResponse,
    nestedReplace,
} from './utils.js'
import * as types from './constants'

export const mergeTicket = (ticket: Ticket) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const ticketRecord = fromJS(ticket) as Map<any, any>
    const state = getState()
    const {ticket: ticketState} = state

    // if received ticket data does not concern current ticket, do nothing
    if (ticketRecord.get('id') !== ticketState.get('id')) {
        return Promise.resolve()
    }

    // notification on new message while not on tab
    if (!isTabActive()) {
        const {ticket: previousTicket} = getState()

        const messagesLength = (ticketRecord.get(
            'messages',
            fromJS([])
        ) as List<any>).size
        const previousMessagesLength = (previousTicket.get(
            'messages',
            fromJS([])
        ) as List<any>).size

        const newMessage = (ticketRecord.get('messages', fromJS([])) as List<
            any
        >).last() as Map<any, any>

        if (
            messagesLength !== previousMessagesLength &&
            newMessage &&
            !newMessage.get('from_agent')
        ) {
            const title = newMessage.getIn(['sender', 'name']) as string
            const body = newMessage.get('body_text') as string
            browserNotification.newMessage({title, body})
        }
    }

    const currentMessages = ticketState.get('messages', fromJS([])) as List<any>
    const messagesDifference =
        (ticketRecord.get('messages', fromJS([])) as List<any>).size -
        currentMessages.size

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

export const mergeCustomer = (customer: Map<any, any>) => {
    return {
        type: types.MERGE_CUSTOMER,
        customer,
    }
}

export const fetchTicketReplyMacro = () => ({
    type: types.FETCH_TICKET_REPLY_MACRO,
})

export const ticketPartialUpdate = (args: Record<string, unknown>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    if (_isEmpty(args)) {
        return Promise.resolve()
    }

    const {ticket} = getState()
    const ticketId = ticket.get('id') as number

    // do not send to server if it's a partial update on a new ticket
    if (!ticketId) {
        return Promise.resolve()
    }

    dispatch({
        type: types.TICKET_PARTIAL_UPDATE_START,
        args,
    })

    return axios
        .put<Ticket>(`/api/tickets/${ticketId}/`, args)
        .then((json) => json?.data)
        .then(
            (resp) => {
                return dispatch({
                    type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                    resp,
                })
            },
            (error: AxiosError) => {
                return dispatch({
                    type: types.TICKET_PARTIAL_UPDATE_ERROR,
                    error,
                    reason: `Failed to update ticket ${ticketId}`,
                })
            }
        )
}

export const addTags = (tags: string) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    dispatch({
        type: types.ADD_TICKET_TAGS,
        args: fromJS({tags}),
    })

    return dispatch(
        ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState()))
    )
}

export const removeTag = (tag: string) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    dispatch({
        type: types.REMOVE_TICKET_TAG,
        args: fromJS({tag}),
    })

    return dispatch(
        ticketPartialUpdate(buildPartialUpdateFromAction('addTags', getState()))
    )
}

export const setSpam = (spam: boolean, callback: () => void = _noop) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const {ticket} = getState()
    const ticketId = ticket.get('id') as string
    const currentSpam = ticket.get('spam') as boolean

    if (currentSpam === spam) {
        return Promise.resolve()
    }

    dispatch({
        type: types.SET_SPAM_START,
        spam,
    })

    // execute callback immediately, do not wait for server answer
    callback()

    return (dispatch(ticketPartialUpdate({spam})) as Promise<void>).then(() => {
        dispatch({
            type: types.SET_SPAM_SUCCESS,
        })
        if (spam) {
            return dispatch(
                notify({
                    id: `spam-${ticketId}`,
                    dismissAfter: 5000,
                    buttons: [
                        {
                            name: 'Undo',
                            onClick: () => {
                                void dispatch(
                                    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                    removeNotification(`spam-${ticketId}`)
                                )
                                browserHistory.push(`/app/ticket/${ticketId}`)
                                return dispatch(fetchTicket(ticketId)).then(
                                    () => {
                                        void dispatch(setSpam(false))
                                    }
                                )
                            },
                            primary: true,
                        },
                    ],
                    status: NotificationStatus.Success,
                    message: 'Ticket has been marked as spam',
                })
            )
        }
    })
}

export const setTrashed = (
    datetime: Maybe<Moment>,
    callback: () => void = _noop
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    const {ticket} = getState()
    const ticketId = ticket.get('id') as string
    const isTrashed = !!ticket.get('trashed_datetime')

    if (isTrashed && !!datetime) {
        return Promise.resolve()
    }

    dispatch({
        type: types.SET_TRASHED_START,
        trashed_datetime: datetime,
    })

    // execute callback immediately, do not wait for server answer
    callback()

    return dispatch(ticketPartialUpdate({trashed_datetime: datetime})).then(
        () => {
            dispatch({
                type: types.SET_TRASHED_SUCCESS,
            })
            // display a notification when we trash a ticket
            if (datetime) {
                return dispatch(
                    notify({
                        id: `trash-${ticketId}`,
                        dismissAfter: 5000,
                        buttons: [
                            {
                                name: 'Undo',
                                onClick: () => {
                                    dispatch(
                                        //eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                        removeNotification(`trash-${ticketId}`)
                                    )
                                    browserHistory.push(
                                        `/app/ticket/${ticketId}`
                                    )
                                    return dispatch(fetchTicket(ticketId)).then(
                                        () => {
                                            void dispatch(setTrashed(null))
                                        }
                                    )
                                },
                                primary: true,
                            },
                        ],
                        status: NotificationStatus.Success,
                        message: 'Ticket has been deleted',
                    })
                )
            }
        }
    )
}

export const setAgent = (assigneeUser: Maybe<Record<string, unknown>>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    dispatch({
        type: types.SET_AGENT,
        args: fromJS({assignee_user: assigneeUser}),
    })

    return dispatch(
        ticketPartialUpdate(
            buildPartialUpdateFromAction('setAssignee', getState())
        )
    )
}

export const setTeam = (assigneeTeam: Maybe<Record<string, unknown>>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    dispatch({
        type: types.SET_TEAM,
        args: fromJS({assignee_team: assigneeTeam}),
    })

    return dispatch(
        ticketPartialUpdate(
            buildPartialUpdateFromAction('setTeamAssignee', getState())
        )
    )
}

export const setCustomer = (customer: Maybe<Map<any, any>>) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    dispatch({
        type: types.SET_CUSTOMER,
        args: fromJS({customer}),
    })

    if (!customer || customer.isEmpty()) {
        return Promise.resolve()
    }

    socketManager.join('customer', customer.get('id'))

    return dispatch(
        ticketPartialUpdate({
            customer: fromJS({
                id: customer.get('id'),
            }),
        })
    )
}

export const setStatus = (status: string, callback: () => void = _noop) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    dispatch({
        type: types.SET_STATUS,
        args: fromJS({status}),
    })

    if (status === 'closed') {
        // execute callback immediately, do not wait for server answer
        callback()
    }

    return dispatch(
        ticketPartialUpdate(
            buildPartialUpdateFromAction('setStatus', getState())
        )
    )
}

export const setSubject = (subject: string) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    dispatch({
        type: types.SET_SUBJECT,
        args: fromJS({subject}),
    })

    return dispatch(
        ticketPartialUpdate(
            buildPartialUpdateFromAction('setSubject', getState())
        )
    )
}

export const setSnooze = (datetime: Moment, callback: () => void = _noop) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    const data = {
        snooze_datetime: datetime,
        status: 'closed',
    }

    dispatch({
        type: types.SET_SNOOZE,
        ...data,
    })

    // execute callback immediately, do not wait for server answer
    callback()

    return dispatch(ticketPartialUpdate(data)).then(() => {
        void dispatch(
            notify({
                status: NotificationStatus.Success,
                message: 'The ticket has been closed and snoozed.',
            })
        )
    })
}

export const deleteMessage = (ticketId: number, messageId: number) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> => {
    return axios.delete(`/api/tickets/${ticketId}/messages/${messageId}/`).then(
        () => {
            dispatch({
                type: types.DELETE_TICKET_MESSAGE_SUCCESS,
                messageId,
            })
        },
        (error: AxiosError) => {
            return dispatch({
                type: types.DELETE_TICKET_MESSAGE_ERROR,
                error,
                reason: `Failed to delete message ${messageId} from ticket ${ticketId}`,
            })
        }
    )
}

export const deleteActionOnApplied = (
    actionIndex: number,
    ticketId: number
) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId,
})

export const updateActionArgsOnApplied = (
    actionIndex: number,
    value: string,
    ticketId: number
) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId,
})

export const applyMacroAction = (action: Map<any, any>) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): ReturnType<StoreDispatch> => {
    const state = getState()
    const {ticket, currentUser} = state

    const {type, name} = action.toJS() as Action
    if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
        console.error('Applying unknown macro action', name)
    }

    const args = action.get('arguments') as List<any>

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

export const applyMacro = (
    macro: Macro,
    ticketId: number,
    shouldUpdateNewMessage = true
) => (
    dispatch: StoreDispatch,
    getState: () => RootState
): Promise<ReturnType<StoreDispatch>> => {
    // render macro action arguments
    let state = getState()

    const renderedMacro = macro.update('actions', (actions: List<any>) => {
        return actions.map((action: Map<any, any>) => {
            return action.update(
                'arguments',
                (args: List<any>) =>
                    nestedReplace(
                        args,
                        state.ticket,
                        state.currentUser,
                        (args: Notification) => {
                            return dispatch(notify(args))
                        }
                    ) as List<any>
            )
        })
    })

    dispatch({
        type: types.APPLY_MACRO,
        macro: renderedMacro,
        ticketId,
    })

    const actions = renderedMacro.get('actions', fromJS([])) as List<any>

    actions.forEach((action: Map<any, any>) => {
        if (
            !shouldUpdateNewMessage &&
            ['addAttachments', 'setResponseText'].includes(action.get('name'))
        ) {
            return
        }
        dispatch(applyMacroAction(action))
    })

    state = getState() // refetch state after macro actions has been applied

    const actionNames = (actions.map(
        (action: Map<any, any>) => action.get('name') as string
    ) as List<any>).toJS() as string[]
    const partialUpdate = buildPartialUpdateFromAction(
        actionNames,
        state
    ) as Map<any, any>

    void dispatch(ticketPartialUpdate(partialUpdate))
    if (shouldUpdateNewMessage) {
        dispatch({
            type: newMessageTypes.NEW_MESSAGE_RECORD_MACRO,
            macro,
        })
    }

    return Promise.resolve()
}

export const clearAppliedMacro = (ticketId: number) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId,
})

/**
 * Fetch a ticket from the API, and put it in the `ticket` store.
 */
export const fetchTicket = (ticketId: string, discreetly = false) => (
    dispatch: StoreDispatch,
    getState: () => RootState
) => {
    if (ticketId === 'new') {
        return new Promise<ReturnType<StoreDispatch>>((resolve) => {
            // wait next tick before initializing the draft
            // so that draft-js is mounted (and Editor plugins are ran) before we initialize message content
            // otherwise on a new ticket plugins are not applied to the Editor
            setTimeout(() => {
                resolve(dispatch(newMessageActions.initializeMessageDraft()))
            }, 1)
        })
    }

    const parsedTicketId = parseInt(ticketId)

    if (!discreetly) {
        dispatch({
            type: types.FETCH_TICKET_START,
        })
    }

    dispatch(markChatAsRead(parsedTicketId))

    const url = `/api/tickets/${parsedTicketId}/`

    return axios
        .get<Ticket>(url)
        .then((json) => json?.data)
        .then(
            (resp) => {
                if (_isEmpty(resp)) {
                    console.error('No results for', url)
                }

                if (!isCurrentlyOnTicket(ticketId)) {
                    return Promise.resolve()
                }

                const customerId = (fromJS(resp) as Map<any, any>).getIn([
                    'customer',
                    'id',
                ]) as number

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
                if (
                    (getState().newMessage.getIn(
                        ['newMessage', 'body_text'],
                        ''
                    ) as string).length === 0
                ) {
                    dispatch({
                        type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                        resp,
                    })
                }

                dispatch(newMessageActions.initializeMessageDraft())

                // trigger side effects for cached source type
                const cachedSourceType = getSourceTypeCache(ticketId)
                if (cachedSourceType) {
                    dispatch(newMessageActions.prepare(cachedSourceType))
                }

                const sourceTypeOfResponse = getSourceTypeOfResponse(
                    resp.messages
                )

                if (
                    [
                        TicketMessageSourceType.InstagramComment,
                        TicketMessageSourceType.InstagramAdComment,
                    ].includes(sourceTypeOfResponse)
                ) {
                    dispatch(newMessageActions.prepare(sourceTypeOfResponse))
                }

                // Notify the server that we viewed this ticket
                socketManager.send('ticket-viewed', parsedTicketId)

                return dispatch(newMessageActions.resetReceiversAndSender)
            },
            (error) => {
                return dispatch({
                    type: types.FETCH_TICKET_ERROR,
                    error,
                    reason: `Failed to fetch ticket ${parsedTicketId}`,
                })
            }
        )
}

/**
 * Fetch the next or the previous ticket immediately
 * but wait for the Promise (`promise` argument) to be resolved to display it
 */
export const _goToNextOrPrevTicket = (
    ticketId: number,
    direction: string,
    promise?: Promise<Maybe<ReturnType<StoreDispatch>>>
) => {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        if (!promise) {
            // we do not display the loading state if there is a promise to resolve
            // because we want to do it discreetly: while something else is happening.
            dispatch({
                type: types.FETCH_TICKET_START,
            })
        }
        const returnedPromise: Promise<Maybe<ReturnType<StoreDispatch>>> =
            promise || Promise.resolve()

        //$TsFixMe remove casting once views/selectors is migrated
        const viewId = (viewsSelectors.getActiveView as (
            state: RootState
        ) => Map<any, any>)(getState()).get('id') as string
        //$TsFixMe remove casting once tickets/selectors is migrated
        const viewCursor = (ticketsSelectors.getCursor as (
            state: RootState
        ) => Map<any, any>)(getState())
        const url = `/api/views/${viewId}/tickets/${ticketId}/${direction}`

        if (!viewId) {
            return returnedPromise.then(() => {
                // there is no active view so we go to the first view
                browserHistory.push('/app')
            })
        }

        return axios
            .put<Ticket>(url, {cursor: viewCursor})
            .then((json) => json?.data)
            .then(
                (ticket) => {
                    // wait for the promise to be resolved to go to the ticket
                    return returnedPromise.then(() => {
                        if (!ticket) {
                            // there is no other ticket the user can handle so we go back to the view
                            browserHistory.push(`/app/tickets/${viewId}`)
                            return
                        }

                        const customerId = (fromJS(ticket) as Map<
                            any,
                            any
                        >).getIn(['customer', 'id'])

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
                            type:
                                newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                            resp: ticket,
                        })

                        dispatch(newMessageActions.initializeMessageDraft())

                        const sourceTypeOfResponse = getSourceTypeOfResponse(
                            ticket.messages
                        )

                        if (
                            [
                                TicketMessageSourceType.InstagramComment,
                                TicketMessageSourceType.InstagramAdComment,
                            ].includes(sourceTypeOfResponse)
                        ) {
                            dispatch(
                                newMessageActions.prepare(sourceTypeOfResponse)
                            )
                        }

                        // Notify the server that we viewed this ticket
                        socketManager.send('ticket-viewed', ticket.id)
                        dispatch(newMessageActions.resetReceiversAndSender)

                        browserHistory.push(`/app/ticket/${ticket.id}`)
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.FETCH_TICKET_ERROR,
                        error,
                        reason: 'Failed to fetch ticket',
                    })
                }
            )
    }
}

/**
 * Fetch the previous ticket immediately
 * but wait the Promise (`promise` argument) to be resolved to display it
 */
export const goToPrevTicket = (
    ticketId: number,
    promise?: Promise<Maybe<ReturnType<StoreDispatch>>>
) => (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
    return dispatch(_goToNextOrPrevTicket(ticketId, 'prev', promise))
}

/**
 * Fetch the next ticket immediately
 * but wait the Promise (`promise` argument) to be resolved to display it
 */
export const goToNextTicket = (
    ticketId: number,
    promise?: Promise<Maybe<ReturnType<StoreDispatch>>>
) => (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
    return dispatch(_goToNextOrPrevTicket(ticketId, 'next', promise))
}

export const displayAuditLogEvents = (ticketId: number) => async (
    dispatch: StoreDispatch
) => {
    segmentTracker.logEvent(segmentTracker.EVENTS.DISPLAY_ALL_EVENTS_CLICKED, {
        ticketId,
    })

    const client = new GorgiasApi()
    const generator = client.getTicketEvents(ticketId)
    let total = 0

    dispatch({
        type: types.DISPLAY_TICKET_AUDIT_LOG_EVENTS,
    })

    for await (const events of generator as any) {
        total += (events as List<any>).size

        if ((events as List<any>).size) {
            dispatch({
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: events,
            })
        }
    }

    if (!total) {
        void dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'No event for this ticket',
            })
        )

        dispatch({
            type: types.HIDE_TICKET_AUDIT_LOG_EVENTS,
        })
    }
}

export const hideAuditLogEvents = () => (dispatch: StoreDispatch) => {
    dispatch({
        type: types.HIDE_TICKET_AUDIT_LOG_EVENTS,
    })

    dispatch({
        type: types.REMOVE_TICKET_AUDIT_LOG_EVENTS,
    })
}

export const handleMessageActionError = (ticketId: string) => (
    dispatch: StoreDispatch
) => {
    let buttons: NotificationButton[] = []
    let fetchPromise = null

    if (!isCurrentlyOnTicket(ticketId)) {
        buttons = [
            {
                primary: true,
                name: 'Review',
                onClick: () => {
                    browserHistory.push(`/app/ticket/${ticketId}`)
                },
            },
        ]
    } else {
        fetchPromise = dispatch(fetchTicket(ticketId, true))
    }

    void dispatch(
        notify({
            status: NotificationStatus.Error,
            dismissAfter: 0,
            allowHTML: true,
            message:
                'Your last message could not be sent because an action broke on it, you should review it right now.',
            buttons,
        })
    )

    return fetchPromise || Promise.resolve()
}

export const handleMessageError = (
    json: socketEventTypes.TicketMessageFailedEvent
) => (dispatch: StoreDispatch) => {
    let buttons: NotificationButton[] = []
    let fetchPromise = null

    if (!isCurrentlyOnTicket(json.ticket_id)) {
        buttons = [
            {
                primary: true,
                name: 'Review',
                onClick: () => {
                    browserHistory.push(`/app/ticket/${json.ticket_id}`)
                },
            },
        ]
    } else {
        fetchPromise = dispatch(
            fetchTicket((json.ticket_id as unknown) as string, true)
        )
    }

    void dispatch(
        notify({
            status: NotificationStatus.Error,
            dismissAfter: 0,
            allowHTML: true,
            message:
                'Your last message could not be sent because ' +
                json.event.data.error.message,
            buttons,
        })
    )

    return fetchPromise || Promise.resolve()
}

export function updateTicketMessage(
    ticketId: string,
    messageId: number,
    data: TicketMessage,
    action: Maybe<string> = null
) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.UPDATE_TICKET_MESSAGE_START,
            messageId,
        })

        let url = `/api/tickets/${ticketId}/messages/${messageId}/`

        if (action) {
            url = `${url}?action=${action}`
        }

        return axios
            .put<TicketMessage>(url, data)
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.UPDATE_TICKET_MESSAGE_SUCCESS,
                        messageId,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.UPDATE_TICKET_MESSAGE_ERROR,
                        messageId,
                        error,
                        reason:
                            'Message was not sent. Please try again in a few moments. If the problem persists, contact us.',
                    })
                }
            )
    }
}

export function clearTicket() {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        const state = getState()

        const shouldDisplayHistoryOnNextPage = state.ticket.getIn([
            '_internal',
            'shouldDisplayHistoryOnNextPage',
        ])

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
        state,
    }
}

export function displayHistoryOnNextPage(state = true) {
    return {
        type: types.DISPLAY_HISTORY_ON_NEXT_PAGE,
        state,
    }
}

export function deleteTicket(id: number) {
    return (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return axios.delete(`/api/tickets/${id}/`).then(
            () => {
                return dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Ticket deleted',
                    })
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: types.DELETE_TICKET_ERROR,
                    error,
                    reason: `Failed to delete the ticket ${id}`,
                })
            }
        )
    }
}

export function deleteTicketPendingMessage(message: Map<any, any>) {
    return {
        type: types.DELETE_TICKET_PENDING_MESSAGE,
        message,
    }
}

/**
 * Search a customer by email, and then fetch it and set it as customer of the current ticket.
 */
export const findAndSetCustomer = (email: string) => (
    dispatch: StoreDispatch
): Promise<ReturnType<StoreDispatch>> =>
    axios
        .post<ApiListResponsePagination<UserSearchResult[]>>('/api/search/', {
            type: 'user_channel_email',
            query: email,
        })
        .then((json) => json?.data)
        .then((resp) => {
            if (resp.data.length !== 1) {
                // We can't do anything if we are not sure which customer should be set as customer of the current
                // ticket. We don't want to log an error here, as this may be expected if the agent is sending an email
                // to a new customer.
                return Promise.resolve()
            }

            const channel = resp.data[0]

            return axios
                .get<Customer>(`/api/customers/${channel.user?.id || ''}/`)
                .then((json) => json?.data)
                .then(
                    (resp): Promise<ReturnType<StoreDispatch>> => {
                        return dispatch(setCustomer(fromJS(resp)))
                    }
                )
        })

export const messageDeleted = createAction<
    typeof types.TICKET_MESSAGE_DELETED,
    string
>(types.TICKET_MESSAGE_DELETED)
