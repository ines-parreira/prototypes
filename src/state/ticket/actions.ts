import {fromJS, List, Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'
import _pick from 'lodash/pick'
import {AxiosError} from 'axios'
import {createAction} from '@reduxjs/toolkit'
import {dismissNotification} from 'reapop'
import {Moment} from 'moment'
import {compressToEncodedURIComponent} from 'lz-string'

import {
    TicketMessageSourceType,
    TicketStatus,
    TicketChannel,
} from 'business/types/ticket'
import {DEFAULT_ACTIONS} from 'config'
import {FeatureFlagKey} from 'config/featureFlags'
import {ViewType} from 'models/view/constants'
import {search} from 'models/search/resources'
import {SearchType, UserSearchResult} from 'models/search/types'
import browserNotification from 'services/browserNotification'
import GorgiasApi from 'services/gorgiasApi'
import socketManager from 'services/socketManager/socketManager'
import {markChatAsRead} from 'state/chats/actions'
import * as newMessageActions from 'state/newMessage/actions'
import * as newMessageTypes from 'state/newMessage/constants'
import {getSourceTypeCache} from 'state/newMessage/responseUtils'
import {notify} from 'state/notifications/actions'
import * as ticketsSelectors from 'state/tickets/selectors'
import * as viewsSelectors from 'state/views/selectors'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {isCurrentlyOnTicket, isTabActive} from 'utils'
import {getLDClient} from 'utils/launchDarkly'

import {
    Action,
    Ticket,
    TicketMessage,
    TicketMessageIntent,
    SourceAddress,
} from 'models/ticket/types'
import {View} from 'models/view/types'

import {MacroActionName} from 'models/macroAction/types'
import {getChannelsByType} from 'state/integrations/selectors'

import {
    JoinEventType,
    SocketEventType,
    TicketMessageFailedEvent,
} from 'services/socketManager/types'
import {Customer} from 'state/customers/types'
import {
    Notification,
    NotificationButton,
    NotificationStatus,
} from 'state/notifications/types'
import history from 'pages/history'
import client from 'models/api/resources'
import {RootState, StoreDispatch, StoreState} from 'state/types'
import {Macro} from 'state/macro/types'

import {
    buildPartialUpdateFromAction,
    getSourceTypeOfResponse,
    nestedReplace,
    guessReceiversFromTicket,
} from './utils'
import * as types from './constants'

export const mergeTicket =
    (ticket: Ticket) =>
    (
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

            const messagesLength = (
                ticketRecord.get('messages', fromJS([])) as List<any>
            ).size
            const previousMessagesLength = (
                previousTicket.get('messages', fromJS([])) as List<any>
            ).size

            const newMessage = (
                ticketRecord.get('messages', fromJS([])) as List<any>
            ).last() as Map<any, any>

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

        const currentMessages = ticketState.get(
            'messages',
            fromJS([])
        ) as List<any>
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

export const ticketPartialUpdate =
    (args: Record<string, unknown>, id?: number) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        if (_isEmpty(args)) {
            return Promise.resolve()
        }

        const {ticket} = getState()
        const ticketId = id || (ticket.get('id') as number)

        // do not send to server if it's a partial update on a new ticket
        if (!ticketId) {
            return Promise.resolve()
        }

        dispatch({
            type: types.TICKET_PARTIAL_UPDATE_START,
            args,
        })

        return client
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

export const addTags =
    (tags: string) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.ADD_TICKET_TAGS,
            args: fromJS({tags}),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('addTags', getState())
            )
        )
    }

export const removeTag =
    (tag: string) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.REMOVE_TICKET_TAG,
            args: fromJS({tag}),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('addTags', getState())
            )
        )
    }

export const setSpam =
    (spam: boolean, callback: () => void = _noop) =>
    (
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

        return (dispatch(ticketPartialUpdate({spam})) as Promise<void>).then(
            () => {
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
                                            dismissNotification(
                                                `spam-${ticketId}`
                                            )
                                        )
                                        history.push(`/app/ticket/${ticketId}`)
                                        return dispatch(
                                            fetchTicket(ticketId)
                                        ).then(() => {
                                            void dispatch(setSpam(false))
                                        })
                                    },
                                    primary: true,
                                },
                            ],
                            status: NotificationStatus.Success,
                            message: 'Ticket has been marked as spam',
                        })
                    )
                }
            }
        )
    }

export const setTrashed =
    (datetime: Maybe<Moment>, callback: () => void = _noop) =>
    (
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
                                            dismissNotification(
                                                `trash-${ticketId}`
                                            )
                                        )
                                        history.push(`/app/ticket/${ticketId}`)
                                        return dispatch(
                                            fetchTicket(ticketId)
                                        ).then(() => {
                                            void dispatch(setTrashed(null))
                                        })
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

export const setAgent =
    (assigneeUser: Maybe<Record<string, unknown>>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
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

export const setTeam =
    (assigneeTeam: Maybe<Record<string, unknown>>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
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

export const setCustomer =
    (customer: Maybe<Map<any, any>>) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.SET_CUSTOMER,
            args: fromJS({customer}),
        })

        if (!customer || customer.isEmpty()) {
            return Promise.resolve()
        }

        socketManager.join(JoinEventType.Customer, customer.get('id'))

        return dispatch(
            ticketPartialUpdate({
                customer: fromJS({
                    id: customer.get('id'),
                }),
            })
        )
    }

export const setStatus =
    (status: string, callback: () => void = _noop) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
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

export const setSubject =
    (subject: string) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
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

export const snoozeTicket =
    (datetime: Moment | string | null, callback: () => void = _noop) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const data = {
            snooze_datetime: datetime,
            status: datetime ? 'closed' : 'open',
        }

        dispatch({
            type: types.SNOOZE_TICKET,
            ...data,
        })

        // execute callback immediately, do not wait for server answer
        callback()

        return dispatch(ticketPartialUpdate(data)).then(() => {
            if (datetime) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Ticket has been closed and snoozed',
                    })
                )
            }
        })
    }

export const deleteMessage =
    (ticketId: number, messageId: number) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return client
            .delete(`/api/tickets/${ticketId}/messages/${messageId}/`)
            .then(
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
    value: Map<any, any>,
    ticketId: number
) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId,
})

const getRecipientsArray = (
    newRecipients?: string,
    recipients: SourceAddress[] = []
): SourceAddress[] => {
    if (newRecipients) {
        const recipientAddresses = recipients.map(({address}) => address)

        return [
            ...recipients,
            ...newRecipients
                .split(',')
                .filter((address) => !recipientAddresses.includes(address))
                .map<SourceAddress>((address) => ({
                    name: '',
                    address,
                })),
        ]
    }

    return recipients
}

export const applyMacroAction =
    (action: Map<any, any>) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const {ticket, currentUser} = state

        const {type, name} = action.toJS() as Action
        if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
            console.error('Applying unknown macro action', name)
        }

        const args = action.get('arguments') as Map<any, any>

        const flags = getLDClient()?.allFlags()
        const isMacroResponseCcBccEnabled =
            flags?.[FeatureFlagKey.MacroResponseTextCcBcc]

        if (
            name === MacroActionName.SetResponseText &&
            isMacroResponseCcBccEnabled &&
            (args.get('cc') || args.get('bcc'))
        ) {
            const {
                newMessage: {
                    source: {
                        type: sourceType,
                        cc: currentCc,
                        bcc: currentBcc,
                        extra: {forward},
                    },
                },
            } = state.newMessage.toJS()

            const cc = getRecipientsArray(args.get('cc'), currentCc)
            const bcc = getRecipientsArray(args.get('bcc'), currentBcc)

            const {to} = guessReceiversFromTicket(
                state.ticket,
                TicketMessageSourceType.Email,
                getChannelsByType(TicketMessageSourceType.Email)(
                    state as unknown as StoreState
                )
            )

            dispatch(newMessageActions.setSubject(''))
            dispatch(
                newMessageActions.setSourceType(TicketMessageSourceType.Email)
            )
            dispatch(newMessageActions.setSourceExtra({}))
            dispatch(
                newMessageActions.setShowConvertToForwardPopover(
                    sourceType !== TicketChannel.Email || forward
                )
            )
            dispatch(
                newMessageActions.setReceivers({
                    to,
                    cc,
                    bcc,
                })
            )
            dispatch(newMessageActions.setSender())
        }

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

export const applyMacro =
    (macro: Macro, ticketId: number, shouldUpdateNewMessage = true) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState
    ): Promise<ReturnType<StoreDispatch>> => {
        // render macro action arguments
        const state = getState()

        const renderedMacro = macro.update('actions', (actions: List<any>) => {
            return actions.map((action: Map<any, any>) => {
                return action.update(
                    'arguments',
                    (args: List<any>) =>
                        nestedReplace(args, state.ticket, state.currentUser, ((
                            args: Notification
                        ) => {
                            return dispatch(notify(args))
                        }) as any) as List<any>
                )
            })
        })

        dispatch({
            type: types.APPLY_MACRO,
            macro: renderedMacro,
            ticketId,
        })

        if (shouldUpdateNewMessage) {
            ;(renderedMacro.get('actions', fromJS([])) as List<any>).forEach(
                (action: Map<any, any>) => {
                    if (
                        [
                            MacroActionName.SetResponseText,
                            MacroActionName.AddAttachments,
                        ].includes(action.get('name'))
                    ) {
                        dispatch(applyMacroAction(action))
                    }
                }
            )
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
export const fetchTicket =
    (ticketId: string, discreetly = false) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        if (ticketId === 'new') {
            return new Promise<ReturnType<StoreDispatch>>((resolve) => {
                // wait next tick before initializing the draft
                // so that draft-js is mounted (and Editor plugins are ran) before we initialize message content
                // otherwise on a new ticket plugins are not applied to the Editor
                setTimeout(() => {
                    resolve(
                        dispatch(newMessageActions.initializeMessageDraft())
                    )
                }, 1)
            })
        }

        const parsedTicketId = parseInt(ticketId)

        if (!discreetly) {
            dispatch({
                type: types.FETCH_TICKET_START,
            })
        }

        const url = `/api/tickets/${parsedTicketId}/`

        return client
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
                        socketManager.join(JoinEventType.Ticket, parsedTicketId)
                    }

                    if (customerId) {
                        socketManager.join(JoinEventType.Customer, customerId)
                    }

                    // dispatch for ticket reducer branch
                    dispatch({
                        type: types.FETCH_TICKET_SUCCESS,
                        resp,
                        ticketId: parsedTicketId,
                    })

                    // dispatch for newMessage reducer branch
                    if (
                        (
                            getState().newMessage.getIn(
                                ['newMessage', 'body_text'],
                                ''
                            ) as string
                        ).length === 0
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
                        resp.messages,
                        resp.via
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

                    // Notify the server that we viewed this ticket and mark it as read in the reducer
                    if (resp.is_unread) {
                        dispatch(markChatAsRead(parsedTicketId))
                        socketManager.send(
                            SocketEventType.TicketViewed,
                            parsedTicketId
                        )
                    }

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
        const view = (
            viewsSelectors.getActiveView as (state: RootState) => Map<any, any>
        )(getState())
        const viewId = view.get('id') as number
        const viewSearch = view.get('search') as string
        const viewFilters = view.get('filters') as string
        const viewCursor = ticketsSelectors.getCursor(getState())
        const isCustomerView = view.get('type') === ViewType.CustomerList

        if ((!viewId && !viewSearch && !viewFilters) || isCustomerView) {
            return returnedPromise.then(() => {
                // there is no active view so we go to the first view
                history.push('/app')
            })
        }

        const url = `/api/views/${
            viewId || '0'
        }/tickets/${ticketId}/${direction}`
        const payload_data: {cursor: Maybe<string>; view?: Partial<View>} = {
            cursor: viewCursor,
        }

        if (!viewId) {
            payload_data.view = _pick(view.toJS(), [
                'filters',
                'filters_ast',
                'order_by',
                'order_dir',
                'search',
                'type',
            ])
        }

        return client
            .put<Ticket>(url, payload_data)
            .then((json) => json?.data)
            .then(
                (ticket) => {
                    // wait for the promise to be resolved to go to the ticket
                    return returnedPromise.then(() => {
                        if (!ticket && viewId) {
                            // there is no other ticket the user can handle so we go back to the view
                            history.push(`/app/tickets/${viewId}`)
                            return
                        } else if (!ticket && (viewSearch || viewFilters)) {
                            const query: {q?: string; filters?: string} = {}
                            if (viewSearch) {
                                query.q = viewSearch
                            }
                            if (viewFilters) {
                                query.filters =
                                    compressToEncodedURIComponent(viewFilters)
                            }
                            history.push({
                                pathname: '/app/tickets/search',
                                query,
                            } as any)
                            return
                        }

                        const customerId = (
                            fromJS(ticket) as Map<any, any>
                        ).getIn(['customer', 'id'])

                        if (ticketId) {
                            socketManager.join(JoinEventType.Ticket, ticket.id)
                        }

                        if (customerId) {
                            socketManager.join(
                                JoinEventType.Customer,
                                customerId
                            )
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

                        const sourceTypeOfResponse = getSourceTypeOfResponse(
                            ticket.messages,
                            ticket.via
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
                        if (ticket.is_unread) {
                            socketManager.send(
                                SocketEventType.TicketViewed,
                                ticket.id
                            )
                        }
                        dispatch(newMessageActions.resetReceiversAndSender)

                        history.push(`/app/ticket/${ticket.id}`)
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
export const goToPrevTicket =
    (ticketId: number, promise?: Promise<Maybe<ReturnType<StoreDispatch>>>) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return dispatch(_goToNextOrPrevTicket(ticketId, 'prev', promise))
    }

/**
 * Fetch the next ticket immediately
 * but wait the Promise (`promise` argument) to be resolved to display it
 */
export const goToNextTicket =
    (ticketId: number, promise?: Promise<Maybe<ReturnType<StoreDispatch>>>) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        return dispatch(_goToNextOrPrevTicket(ticketId, 'next', promise))
    }

export const displayAuditLogEvents =
    (ticketId: number) => async (dispatch: StoreDispatch) => {
        logEvent(SegmentEvent.DisplayAllEventsClicked, {
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

export const handleMessageActionError =
    (ticketId: string) => (dispatch: StoreDispatch) => {
        let buttons: NotificationButton[] = []
        let fetchPromise = null

        if (!isCurrentlyOnTicket(ticketId)) {
            buttons = [
                {
                    primary: true,
                    name: 'Review',
                    onClick: () => {
                        history.push(`/app/ticket/${ticketId}`)
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
                message: 'Last message not sent because an action failed.',
                buttons,
            })
        )

        return fetchPromise || Promise.resolve()
    }

export const handleMessageError =
    (json: TicketMessageFailedEvent) => (dispatch: StoreDispatch) => {
        const buttons: NotificationButton[] = [
            {
                primary: true,
                name: 'Review',
                onClick: () => {
                    logEvent(SegmentEvent.TicketFailedReview)
                    history.push(`/app/ticket/${json.ticket_id}`)
                },
            },
        ]

        let fetchPromise = null

        if (isCurrentlyOnTicket(json.ticket_id)) {
            fetchPromise = dispatch(
                fetchTicket(json.ticket_id as unknown as string, true)
            )
        }

        void dispatch(
            ticketPartialUpdate({status: TicketStatus.Open}, json.ticket_id)
        )
        void dispatch(
            notify({
                status: NotificationStatus.Error,
                noAutoDismiss: true,
                isTicketMessageFailedEvent: true,
                allowHTML: true,
                message:
                    `Your last message in the ticket with id ${json.ticket_id} could not be sent because ` +
                    json.event.data.error.message,
                buttons,
            })
        )

        return fetchPromise || Promise.resolve()
    }

export function updateTicketMessage(
    ticketId: string | number,
    messageId: number,
    data: Partial<TicketMessage>,
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

        return client
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
                        reason: 'Message was not sent. Please try again in a few moments. If the problem persists, contact us.',
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

export function toggleHistory(state?: boolean) {
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
        return client.delete(`/api/tickets/${id}/`).then(
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
export const findAndSetCustomer =
    (email: string) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> =>
        search<UserSearchResult>({
            type: SearchType.UserChannelEmail,
            query: email,
        }).then((resp) => {
            if (resp.data.length !== 1) {
                // We can't do anything if we are not sure which customer should be set as customer of the current
                // ticket. We don't want to log an error here, as this may be expected if the agent is sending an email
                // to a new customer.
                return Promise.resolve()
            }

            const channel = resp.data[0]

            return client
                .get<Customer>(`/api/customers/${channel.user?.id || ''}/`)
                .then((json) => json?.data)
                .then((resp): Promise<ReturnType<StoreDispatch>> => {
                    return dispatch(setCustomer(fromJS(resp)))
                })
        })

export const messageDeleted = createAction<string>(types.TICKET_MESSAGE_DELETED)

export const sendIntentFeedbackSuccess = createAction<{
    messageId: number
    intents: TicketMessageIntent[]
}>(types.SEND_INTENT_FEEDBACK_SUCCESS)
