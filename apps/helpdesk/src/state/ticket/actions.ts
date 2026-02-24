import { createAction } from '@reduxjs/toolkit'
import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { history } from '@repo/routing'
import type { AxiosError } from 'axios'
import type { Map } from 'immutable'
import { fromJS, List } from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import _pick from 'lodash/pick'
import { compressToEncodedURIComponent } from 'lz-string'
import type { Moment } from 'moment'
import { dismissNotification } from 'reapop'

import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    Macro as MacroModel,
    Tag,
    TicketPriority,
} from '@gorgias/helpdesk-types'

import { appQueryClient } from 'api/queryClient'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import {
    setInvalidCustomFieldsToErrored,
    triggerTicketFieldsRefreshAndInvalidation,
} from 'common/state'
import goToTicket from 'common/utils/goToTicket'
import { DEFAULT_ACTIONS } from 'config'
import type { CustomFields, CustomFieldState } from 'custom-fields/types'
import client from 'models/api/resources'
import { getCustomer } from 'models/customer/resources'
import type {
    EcommerceStore,
    Shopper,
    ShopperAddress,
    ShopperOrder,
} from 'models/customerEcommerceData/types'
import type { CustomerExternalData } from 'models/customerExternalData/types'
import type { Event } from 'models/event/types'
import { EventType } from 'models/event/types'
import { MacroActionName } from 'models/macroAction/types'
import type { Member, Team } from 'models/team/types'
import { mapNormalizedToArray } from 'models/ticket/mappers'
import type {
    Action,
    NextPrevTicketPartial,
    SourceAddress,
    Ticket,
    TicketMessage,
    TicketMessageIntent,
} from 'models/ticket/types'
import type { View } from 'models/view/types'
import GorgiasApi from 'services/gorgiasApi'
import socketManager from 'services/socketManager/socketManager'
import type { TicketMessageFailedEvent } from 'services/socketManager/types'
import { JoinEventType, SocketEventType } from 'services/socketManager/types'
import { markChatAsRead } from 'state/chats/actions'
import type { InTicketSuggestionState } from 'state/entities/rules/types'
import { getChannelsByType } from 'state/integrations/selectors'
import type { Macro } from 'state/macro/types'
import * as newMessageActions from 'state/newMessage/actions'
import * as newMessageTypes from 'state/newMessage/constants'
import { getSourceTypeCache } from 'state/newMessage/responseUtils'
import type { TopRankMacroState } from 'state/newMessage/ticketReplyCache'
import { notify } from 'state/notifications/actions'
import type {
    Notification,
    NotificationButton,
} from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import * as ticketsSelectors from 'state/tickets/selectors'
import type { RootState, StoreDispatch, StoreState } from 'state/types'
import * as viewsSelectors from 'state/views/selectors'
import { nestedReplace } from 'tickets/common/utils'
import { isCurrentlyOnTicket } from 'utils'

import * as types from './constants'
import { isTicketViewActive } from './selectors'
import {
    buildPartialUpdateFromAction,
    getSourceTypeOfResponse,
    guessReceiversFromTicket,
} from './utils'

export const mergeTicket =
    (ticket: Ticket) =>
    async (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const ticketRecord = fromJS(ticket) as Map<any, any>
        const state = getState()
        const { ticket: ticketState } = state

        // if received ticket data does not concern current ticket, do nothing
        if (ticketRecord.get('id') !== ticketState.get('id')) {
            return Promise.resolve()
        }

        const currentMessages = ticketState.get(
            'messages',
            fromJS([]),
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
            dispatch({
                type: types.SET_TYPING_ACTIVITY_SHOPPER,
                payload: {
                    isShopperTyping: false,
                },
            })
        }

        return Promise.resolve(mergeDispatch)
    }

export const mergeCustomer = (customer: Record<string, unknown>) => {
    return {
        type: types.MERGE_CUSTOMER,
        customer,
    }
}

export const mergeCustomerExternalData = (
    customerId: number,
    externalData: CustomerExternalData,
) => {
    return {
        type: types.MERGE_CUSTOMER_EXTERNAL_DATA,
        customerId,
        externalData,
    }
}
export const mergeCustomerEcommerceDataShopper = (
    customerId: number,
    store: EcommerceStore,
    shopper: Shopper,
) => {
    return {
        type: types.MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER,
        customerId,
        store,
        shopper,
    }
}

export const mergeCustomerEcommerceDataShopperAddress = (
    customerId: number,
    storeUUID: EcommerceStore['uuid'],
    shopperAddress: ShopperAddress,
) => {
    return {
        type: types.MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS,
        customerId,
        storeUUID,
        shopperAddress,
    }
}

export const mergeCustomerEcommerceDataOrder = (
    customerId: number,
    storeUUID: EcommerceStore['uuid'],
    shopperOrder: ShopperOrder,
) => {
    return {
        type: types.MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER,
        customerId,
        storeUUID,
        shopperOrder,
    }
}

export const ticketPartialUpdate =
    (
        args: Record<string, unknown> & {
            custom_fields?: CustomFields
        },
        id?: number,
    ) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        if (_isEmpty(args)) {
            return Promise.resolve()
        }

        const { ticket } = getState()
        const ticketId = id || (ticket.get('id') as number)

        // do not send to server if it's a partial update on a new ticket
        if (!ticketId) {
            return Promise.resolve()
        }

        dispatch({
            type: types.TICKET_PARTIAL_UPDATE_START,
            args,
        })

        let previousPriority = ticket.get('priority')

        if (args.priority) {
            dispatch(setPriority(args.priority as TicketPriority))
        }

        return client
            .put<Ticket>(`/api/tickets/${ticketId}/`, {
                ...args,
                custom_fields:
                    args.custom_fields &&
                    mapNormalizedToArray(args.custom_fields),
            })
            .then((json) => json?.data)
            .then(
                (resp) => {
                    return dispatch({
                        type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                        resp,
                    })
                },
                (error: AxiosError) => {
                    void dispatch(triggerTicketFieldsRefreshAndInvalidation())
                    dispatch(setPriority(previousPriority as TicketPriority))
                    return dispatch({
                        type: types.TICKET_PARTIAL_UPDATE_ERROR,
                        error,
                        reason: `Failed to update ticket ${ticketId}`,
                    })
                },
            )
    }

export const addTag =
    (tag: Tag) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.ADD_TICKET_TAG,
            args: fromJS({ tag }),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('addTags', getState()),
            ),
        )
    }

export const removeTag =
    (tag: string) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.REMOVE_TICKET_TAG,
            args: fromJS({ tag }),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('addTags', getState()),
            ),
        )
    }

export const setSpam =
    (spam: boolean, callback?: () => void) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const { ticket } = getState()
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
        callback?.()

        return dispatch(ticketPartialUpdate({ spam })).then(() => {
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
                                        dismissNotification(`spam-${ticketId}`),
                                    )
                                    goToTicket(ticketId)
                                    return dispatch(
                                        fetchTicket(ticketId, {
                                            isCurrentlyOnTicket: true,
                                        }),
                                    ).then(() => {
                                        void dispatch(setSpam(false))
                                    })
                                },
                                primary: true,
                            },
                        ],
                        status: NotificationStatus.Success,
                        message: 'Ticket has been marked as spam',
                    }),
                )
            }
        })
    }

export const setTrashed =
    (datetime: Maybe<Moment>, callback?: () => void) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const { ticket } = getState()
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
        callback?.()

        return dispatch(
            ticketPartialUpdate({ trashed_datetime: datetime }),
        ).then(() => {
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
                                            `trash-${ticketId}`,
                                        ),
                                    )
                                    goToTicket(ticketId)
                                    return dispatch(
                                        fetchTicket(ticketId, {
                                            isCurrentlyOnTicket: true,
                                        }),
                                    ).then(() => {
                                        void dispatch(setTrashed(null))
                                    })
                                },
                                primary: true,
                            },
                        ],
                        status: NotificationStatus.Success,
                        message: 'Ticket has been deleted',
                    }),
                )
            }
        })
    }

export const setPriority =
    (priority: TicketPriority | null) => (dispatch: StoreDispatch) => {
        dispatch({
            type: types.SET_PRIORITY,
            args: fromJS({ priority }),
        })
    }

export const setAgent =
    (assigneeUser: Member | null) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.SET_AGENT,
            args: fromJS({ assignee_user: assigneeUser }),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('setAssignee', getState()),
            ),
        )
    }

export const setTeam =
    (assigneeTeam: Pick<Team, 'id' | 'name' | 'decoration'> | null) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.SET_TEAM,
            args: fromJS({ assignee_team: assigneeTeam }),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('setTeamAssignee', getState()),
            ),
        )
    }

export const setCustomer =
    (customer: Maybe<Map<any, any>>) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        dispatch({
            type: types.SET_CUSTOMER,
            args: fromJS({ customer }),
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
            }),
        )
    }

export const setStatus =
    (status: string, callback?: () => void) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        const initialStatus = getState().ticket.get('status')
        dispatch({
            type: types.SET_STATUS,
            args: fromJS({ status }),
        })
        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('setStatus', getState()),
            ),
        ).then((response) => {
            if (
                (response as { type: string })?.type ===
                types.TICKET_PARTIAL_UPDATE_ERROR
            ) {
                dispatch({
                    type: types.SET_STATUS,
                    args: fromJS({ status: initialStatus }),
                })
                return response
            }
            if (status === 'closed') callback?.()
        })
    }

export const setSubject =
    (subject: string) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        dispatch({
            type: types.SET_SUBJECT,
            args: fromJS({ subject }),
        })

        return dispatch(
            ticketPartialUpdate(
                buildPartialUpdateFromAction('setSubject', getState()),
            ),
        )
    }

export const snoozeTicket =
    (datetime: Moment | string | null, callback?: () => void) =>
    (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        const data = {
            snooze_datetime: datetime,
            status: datetime ? 'closed' : 'open',
        }

        dispatch({
            type: types.SNOOZE_TICKET,
            ...data,
        })

        return dispatch(ticketPartialUpdate(data)).then(() => {
            if (datetime) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Ticket has been closed and snoozed',
                    }),
                )
            }

            callback?.()
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
                },
            )
    }

export const deleteActionOnApplied = (
    actionIndex: number,
    ticketId: number,
) => ({
    type: types.DELETE_ACTION_ON_APPLIED,
    actionIndex,
    ticketId,
})

export const updateActionArgsOnApplied = (
    actionIndex: number,
    value: Map<any, any>,
    ticketId: number,
) => ({
    type: types.UPDATE_ACTION_ARGS_ON_APPLIED,
    actionIndex,
    value,
    ticketId,
})

const getRecipientsArray = (
    newRecipients?: string,
    recipients: SourceAddress[] = [],
): SourceAddress[] => {
    if (newRecipients) {
        const recipientAddresses = recipients.map(({ address }) => address)

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
        getState: () => RootState,
    ): ReturnType<StoreDispatch> => {
        const state = getState()
        const { ticket, currentUser } = state

        const { type, name } = action.toJS() as Action
        if (type === 'user' && !DEFAULT_ACTIONS.includes(name)) {
            console.error('Applying unknown macro action', name)
        }

        const args = action.get('arguments') as Map<any, any>

        const flags = getLDClient().allFlags()
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
                        extra: { forward },
                    },
                },
            } = state.newMessage.toJS()

            const cc = getRecipientsArray(args.get('cc'), currentCc)
            const bcc = getRecipientsArray(args.get('bcc'), currentBcc)

            const { to } = guessReceiversFromTicket(
                state.ticket,
                TicketMessageSourceType.Email,
                getChannelsByType(TicketMessageSourceType.Email)(
                    state as unknown as StoreState,
                ),
            )

            dispatch(newMessageActions.setSubject(''))
            dispatch(
                newMessageActions.setSourceType(TicketMessageSourceType.Email),
            )
            dispatch(newMessageActions.setSourceExtra({}))
            dispatch(
                newMessageActions.setShowConvertToForwardPopover(
                    sourceType !== TicketChannel.Email || forward,
                ),
            )
            dispatch(
                newMessageActions.setReceivers({
                    to,
                    cc,
                    bcc,
                }),
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
    (
        macro: Macro,
        ticketId: number,
        shouldUpdateNewMessage = true,
        topRankMacroState?: TopRankMacroState,
    ) =>
    (
        dispatch: StoreDispatch,
        getState: () => RootState,
    ): Promise<ReturnType<StoreDispatch>> => {
        // render macro action arguments
        const state = getState()

        const prevTopRankMacroState = state.ticket.getIn([
            'state',
            'topRankMacroState',
        ]) as Map<any, any> | undefined

        if (
            !topRankMacroState &&
            prevTopRankMacroState?.get('state') === 'pending'
        ) {
            dispatch({
                type: newMessageTypes.NEW_MESSAGE_RESET_CONTENT_STATE,
                ticketId,
            })
            dispatch({
                type: types.CLEAR_APPLIED_MACRO,
                ticketId,
            })
        }

        const flags = getLDClient().allFlags()
        const isMacroForwardByEmailEnabled =
            !!flags?.[FeatureFlagKey.MacroForwardByEmail]

        const renderedMacro = macro.update(
            'actions',
            (actions: List<any> | null) =>
                actions
                    ?.filter(
                        (action: Map<any, any>) =>
                            isMacroForwardByEmailEnabled ||
                            action.get('name') !==
                                MacroActionName.ForwardByEmail,
                    )
                    .map((action: Map<any, any>) =>
                        action.update(
                            'arguments',
                            (args: List<any>) =>
                                nestedReplace(
                                    args,
                                    state.ticket,
                                    state.currentUser,
                                    ((args: Notification) => {
                                        return dispatch(notify(args))
                                    }) as any,
                                ) as List<any>,
                        ),
                    ),
        )

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
                },
            )
            dispatch({
                type: newMessageTypes.NEW_MESSAGE_RECORD_MACRO,
                macro,
            })
        }

        if (topRankMacroState) {
            dispatch({
                type: types.SET_TOP_RANK_MACRO_STATE,
                ticketId,
                topRankMacroState,
            })
        }

        return Promise.resolve()
    }

export const clearAppliedMacro = (ticketId: number | string) => ({
    type: types.CLEAR_APPLIED_MACRO,
    ticketId,
})

/**
 * Fetch a ticket from the API, and put it in the `ticket` store.
 */
export const fetchTicket =
    (
        ticketId: string,
        options: { discreetly?: boolean; isCurrentlyOnTicket?: boolean } = {
            discreetly: false,
            isCurrentlyOnTicket: false,
        },
    ) =>
    (dispatch: StoreDispatch, getState: () => RootState) => {
        if (ticketId === 'new') {
            return new Promise<ReturnType<StoreDispatch>>((resolve) => {
                // wait next tick before initializing the draft
                // so that draft-js is mounted (and Editor plugins are ran) before we initialize message content
                // otherwise on a new ticket plugins are not applied to the Editor
                setTimeout(() => {
                    resolve(
                        dispatch(newMessageActions.initializeMessageDraft()),
                    )
                }, 1)
            })
        }

        const parsedTicketId = parseInt(ticketId)

        if (!options.discreetly) {
            dispatch({
                type: types.FETCH_TICKET_START,
            })
        }

        const url = `/api/tickets/${parsedTicketId}/`

        return client
            .get<Ticket>(url)
            .then((response) => {
                if (options.isCurrentlyOnTicket) {
                    const wasRedirected =
                        response?.data?.uri &&
                        response.data?.id &&
                        url !== response.data.uri

                    if (wasRedirected) {
                        history.push(`/app/ticket/${response.data.id}`)
                    }
                }

                return response?.data
            })
            .then(
                async (response) => {
                    if (_isEmpty(response)) {
                        console.error('No results for', url)
                    }

                    if (!options.isCurrentlyOnTicket) {
                        return Promise.resolve()
                    }

                    const immutableTicket = fromJS(response) as Map<any, any>
                    const customerId = immutableTicket.getIn([
                        'customer',
                        'id',
                    ]) as number

                    if (parsedTicketId) {
                        socketManager.join(JoinEventType.Ticket, parsedTicketId)
                    }

                    if (customerId) {
                        socketManager.join(JoinEventType.Customer, customerId)
                    }

                    const client = new GorgiasApi()
                    const satisfactionSurveyId =
                        response?.satisfaction_survey?.id

                    if (satisfactionSurveyId) {
                        let surveyEvents: typeof response.events = []

                        for await (const events of client.getSatisfactionSurveyEvents(
                            satisfactionSurveyId,
                            { types: [EventType.SatisfactionSurveyResponded] },
                        )) {
                            surveyEvents = [...surveyEvents, ...events.toJS()]
                        }
                        response.events = [...response.events, ...surveyEvents]
                    }

                    // dispatch for ticket reducer branch
                    dispatch({
                        type: types.FETCH_TICKET_SUCCESS,
                        response,
                        ticketId: parsedTicketId,
                    })

                    // dispatch for newMessage reducer branch
                    if (
                        (
                            getState().newMessage.getIn(
                                ['newMessage', 'body_text'],
                                '',
                            ) as string
                        ).length === 0
                    ) {
                        dispatch({
                            type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                            resp: response,
                        })
                    }

                    dispatch(newMessageActions.initializeMessageDraft())

                    // trigger side effects for cached source type
                    const cachedSourceType = getSourceTypeCache(ticketId)
                    if (cachedSourceType) {
                        dispatch(newMessageActions.prepare(cachedSourceType))
                    }

                    let sourceTypeOfResponse = immutableTicket.getIn([
                        'meta',
                        'response_channel',
                    ]) as TicketMessageSourceType | undefined

                    sourceTypeOfResponse ??= getSourceTypeOfResponse(
                        response.messages,
                        response.via,
                        ticketId,
                    )

                    if (
                        [
                            TicketMessageSourceType.InstagramComment,
                            TicketMessageSourceType.InstagramAdComment,
                        ].includes(sourceTypeOfResponse)
                    ) {
                        dispatch(
                            newMessageActions.prepare(sourceTypeOfResponse),
                        )
                    }

                    // Notify the server that we viewed this ticket and mark it as read in the reducer
                    if (response.is_unread) {
                        dispatch(markChatAsRead(parsedTicketId))
                        socketManager.send(
                            SocketEventType.TicketViewed,
                            parsedTicketId,
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
                },
            )
    }

/**
 * Fetch the next or the previous ticket immediately
 * but wait for the Promise (`promise` argument) to be resolved to display it
 */
export const _goToNextOrPrevTicket = (
    ticketId: number,
    direction: string,
    promise?: Promise<Maybe<ReturnType<StoreDispatch>>>,
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

        if (!isTicketViewActive(getState())) {
            return returnedPromise.then(() => {
                // there is no active view so we go to the first view
                history.push('/app')
            })
        }

        //$TsFixMe remove casting once views/selectors is migrated
        const view = (
            viewsSelectors.getActiveView as (state: RootState) => Map<any, any>
        )(getState())
        const viewId = view.get('id') as number
        const viewSearch = view.get('search') as string
        const viewFilters = view.get('filters') as string
        const viewCursor = ticketsSelectors.getCursor(getState())

        const url = `/api/views/${
            viewId || '0'
        }/tickets/${ticketId}/${direction}`
        const payload_data: { cursor: Maybe<string>; view?: Partial<View> } = {
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
            .put<NextPrevTicketPartial>(url, payload_data)
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
                            const query: { q?: string; filters?: string } = {}
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

                        const ticketId = ticket.id
                        const getTicketUrl = `/api/tickets/${ticketId}`
                        return client
                            .get<Ticket>(getTicketUrl)
                            .then((fullTicket) => fullTicket?.data)
                            .then((fullTicket) => {
                                const customerId = (
                                    fromJS(ticket) as Map<any, any>
                                ).getIn(['customer', 'id'])

                                if (ticketId) {
                                    socketManager.join(
                                        JoinEventType.Ticket,
                                        fullTicket.id,
                                    )
                                }

                                if (customerId) {
                                    socketManager.join(
                                        JoinEventType.Customer,
                                        customerId,
                                    )
                                }

                                dispatch({
                                    type: types.FETCH_TICKET_SUCCESS,
                                    response: fullTicket,
                                    ticketId: fullTicket.id,
                                })

                                dispatch({
                                    type: newMessageTypes.NEW_MESSAGE_FETCH_TICKET_SUCCESS,
                                    resp: fullTicket,
                                })

                                dispatch(
                                    newMessageActions.initializeMessageDraft(),
                                )

                                const sourceTypeOfResponse =
                                    getSourceTypeOfResponse(
                                        fullTicket.messages,
                                        fullTicket.via,
                                        fullTicket.id as unknown as string,
                                    )

                                if (
                                    [
                                        TicketMessageSourceType.InstagramComment,
                                        TicketMessageSourceType.InstagramAdComment,
                                    ].includes(sourceTypeOfResponse)
                                ) {
                                    dispatch(
                                        newMessageActions.prepare(
                                            sourceTypeOfResponse,
                                        ),
                                    )
                                }

                                // Notify the server that we viewed this ticket
                                if (fullTicket.is_unread) {
                                    socketManager.send(
                                        SocketEventType.TicketViewed,
                                        fullTicket.id,
                                    )
                                }
                                dispatch(
                                    newMessageActions.resetReceiversAndSender,
                                )

                                history.push(`/app/ticket/${fullTicket.id}`)
                            })
                            .catch((error) => {
                                dispatch({
                                    type: types.FETCH_TICKET_ERROR,
                                    error,
                                    reason: 'Failed to fetch complete ticket data',
                                })
                            })
                    })
                },
                (error: AxiosError) => {
                    return dispatch({
                        type: types.FETCH_TICKET_ERROR,
                        error,
                        reason: 'Failed to fetch ticket',
                    })
                },
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
    (ticketId: number, satisfactionSurveyId?: number) =>
    async (dispatch: StoreDispatch) => {
        logEvent(SegmentEvent.DisplayAllEventsClicked, {
            ticketId,
        })

        const client = new GorgiasApi()
        dispatch({
            type: types.DISPLAY_TICKET_AUDIT_LOG_EVENTS,
        })

        let allEvents: List<Event> = fromJS([])

        const generators = [client.getTicketEvents(ticketId)]

        /*
            The ticket API does not return the satisfaction survey id when the survey is not scored.
            If the satisfactionSurveyId is missing, search for the un-scored survey using the /api/satisfaction-surveys API.
        */
        const surveyId =
            satisfactionSurveyId ||
            (await client.getSatisfactionSurvey(ticketId))?.id
        if (surveyId) {
            generators.push(client.getSatisfactionSurveyEvents(surveyId))
        }

        // Run generators in parallel and merge results
        await Promise.all(
            generators.map(async (generator) => {
                for await (const events of generator) {
                    allEvents = List(allEvents.concat(events))
                }
            }),
        )

        if (allEvents.size) {
            dispatch({
                type: types.ADD_TICKET_AUDIT_LOG_EVENTS,
                payload: allEvents,
            })
        }

        if (!allEvents.size) {
            void dispatch(
                notify({
                    status: NotificationStatus.Info,
                    message: 'No event for this ticket',
                }),
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
            fetchPromise = dispatch(
                fetchTicket(ticketId, {
                    discreetly: true,
                    isCurrentlyOnTicket: true,
                }),
            )
        }

        void dispatch(
            notify({
                status: NotificationStatus.Error,
                dismissAfter: 0,
                allowHTML: true,
                message: 'Last message not sent because an action failed.',
                buttons,
            }),
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
                fetchTicket(json.ticket_id as unknown as string, {
                    discreetly: true,
                    isCurrentlyOnTicket: true,
                }),
            )
        }

        void dispatch(
            ticketPartialUpdate({ status: TicketStatus.Open }, json.ticket_id),
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
            }),
        )

        return fetchPromise || Promise.resolve()
    }

export function updateTicketMessage(
    ticketId: string | number,
    messageId: number,
    data: Partial<TicketMessage>,
    action: Maybe<string> = null,
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
                    if (action === 'retry') {
                        // Invalidate ticket-related queries when retrying
                        void appQueryClient.invalidateQueries({
                            queryKey: queryKeys.tickets.getTicket(
                                Number(ticketId),
                            ),
                        })

                        // Invalidate listTickets queries (like timeline data)
                        void appQueryClient.invalidateQueries({
                            queryKey: ['tickets', 'listTickets'],
                        })

                        // Also invalidate ticket list queries that might contain this ticket
                        void appQueryClient.invalidateQueries({
                            queryKey: ['tickets', 'ticket_ids'],
                            predicate: (query) => {
                                const [, , ticketIds] = query.queryKey
                                return (
                                    Array.isArray(ticketIds) &&
                                    ticketIds.includes(Number(ticketId))
                                )
                            },
                        })
                    }
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
                },
            )
    }
}

export function clearTicket() {
    return (dispatch: StoreDispatch) => {
        dispatch({
            type: types.CLEAR_TICKET,
        })

        return dispatch(newMessageActions.resetReceiversAndSender)
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
                    }),
                )
            },
            (error: AxiosError) => {
                return dispatch({
                    type: types.DELETE_TICKET_ERROR,
                    error,
                    reason: `Failed to delete the ticket ${id}`,
                })
            },
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
 * Retrieve a customer by id, and then fetch it and set it as customer of the current ticket.
 */
export const findAndSetCustomer =
    (id: number) =>
    async (dispatch: StoreDispatch): Promise<ReturnType<StoreDispatch>> => {
        try {
            const { data } = await getCustomer(id)

            return dispatch(setCustomer(fromJS(data)))
        } catch {
            return dispatch(
                notify({
                    message: 'Failed to fetch customer',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

export const messageDeleted = createAction<string>(types.TICKET_MESSAGE_DELETED)

export const sendIntentFeedbackSuccess = createAction<{
    messageId: number
    intents: TicketMessageIntent[]
}>(types.SEND_INTENT_FEEDBACK_SUCCESS)

export function setTypingActivityShopper(ticketId: number) {
    return (dispatch: StoreDispatch, getState: () => RootState) => {
        if (isCurrentlyOnTicket(ticketId.toString())) {
            let timeoutId = getState().ticket.getIn([
                '_internal',
                'isShopperTypingTimeoutId',
            ])

            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            timeoutId = setTimeout(() => {
                void dispatch({
                    type: types.SET_TYPING_ACTIVITY_SHOPPER,
                    payload: {
                        isShopperTyping: false,
                    },
                })
            }, types.TYPING_ACTIVITY_SHOPPER_TIMEOUT_MS)

            void dispatch({
                type: types.SET_TYPING_ACTIVITY_SHOPPER,
                payload: {
                    isShopperTyping: true,
                    isShopperTypingTimeoutId: timeoutId,
                },
            })
        }
    }
}

export function setInTicketSuggestionState(
    inTicketSuggestionState: InTicketSuggestionState,
) {
    return {
        type: types.SET_IN_TICKET_SUGGESTION_STATE,
        inTicketSuggestionState,
    }
}

export const updateCustomFieldState = (state: CustomFieldState) => ({
    type: types.UPDATE_CUSTOM_FIELD_STATE,
    payload: state,
})

// http call to update the value on the back-end is done
// (and in some case debounced) at the component level
export const updateCustomFieldValue = (
    id: CustomFieldState['id'],
    value: CustomFieldState['value'],
) => ({
    type: types.UPDATE_CUSTOM_FIELD_VALUE,
    payload: { id, value },
})

export const updateCustomFieldPrediction = (
    id: CustomFieldState['id'],
    prediction: CustomFieldState['prediction'],
) => ({
    type: types.UPDATE_CUSTOM_FIELD_PREDICTION,
    payload: { id, prediction },
})

export const updateCustomFieldError = (
    id: CustomFieldState['id'],
    hasError: CustomFieldState['hasError'],
) => ({
    type: types.UPDATE_CUSTOM_FIELD_ERROR,
    payload: { id, hasError },
})

export function triggerTicketFieldsErrors(
    erroredCustomFields: CustomFieldState['id'][],
) {
    return (dispatch: StoreDispatch) => {
        void dispatch(setInvalidCustomFieldsToErrored(erroredCustomFields))
        void dispatch(
            notify({
                message:
                    'This ticket cannot be closed. Please fill the required fields.',
                status: NotificationStatus.Error,
            }),
        )
    }
}

export const restoreTicketDraft = createAction<
    Pick<
        Ticket,
        | 'assignee_team'
        | 'assignee_user'
        | 'customer'
        | 'subject'
        | 'tags'
        | 'custom_fields'
    >
>(types.RESTORE_TICKET_DRAFT)

export const restoreTicketDraftApplyMacro = createAction<MacroModel | null>(
    types.RESTORE_TICKET_DRAFT_APPLY_MACRO,
)

export const setHasAttemptedToCloseTicket = (value: boolean) => ({
    type: types.SET_HAS_ATTEMPTED_TO_CLOSE_TICKET,
    payload: value,
})

export const setShouldDisplayAllFollowUps = (value: boolean) => ({
    type: types.SET_SHOULD_DISPLAY_ALL_FOLLOW_UPS,
    payload: value,
})
