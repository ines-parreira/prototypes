import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'
import {EnhancedStore} from '@reduxjs/toolkit'

import {shouldTicketBeDisplayedInRecentChats} from '../business/recentChats'

import * as agentsActions from '../state/agents/actions'
import * as chatsActions from '../state/chats/actions'
import {viewsCountFetched} from '../state/entities/viewsCount/actions'
import * as infobarActions from '../state/infobar/actions'
import * as integrationsActions from '../state/integrations/actions'
import * as notificationsActions from '../state/notifications/actions'
import * as ticketActions from '../state/ticket/actions'
import * as viewsActions from '../state/views/actions'

import * as viewsConstants from '../state/views/constants.js'
import * as currentAccountConstants from '../state/currentAccount/constants.js'

import * as currentAccountSelectors from '../state/currentAccount/selectors'
import * as currentUserSelectors from '../state/currentUser/selectors'
import {getTeams} from '../state/teams/selectors'

import {isCurrentlyOnTicket} from '../utils'
import {store as reduxStore} from '../init'
import {isViewSharedWithUser} from '../state/views/utils'
import {SocketManager} from '../services/socketManager/socketManager'
import {
    AccountUpdatedEvent,
    ActionExecutedEvent,
    CustomerUpdatedEvent,
    EmailIntegrationVerifiedEvent,
    FacebookIntegrationsReconnected,
    OutboundPhoneCallInitiated,
    ServerMessage,
    SocketEventType,
    TicketChatUpdatedEvent,
    TicketMessageActionFailedEvent,
    TicketMessageChatCreatedEvent,
    TicketMessageCreatedEvent,
    TicketMessageFailedEvent,
    TicketUpdatedEvent,
    UserLocationUpdatedEvent,
    UserTypingStatusUpdatedEvent,
    ViewCountUpdatedEvent,
    ViewCreatedEvent,
    ViewDeletedEvent,
    ViewsDeactivated,
    ViewSectionCreatedEvent,
    ViewSectionDeletedEvent,
    ViewSectionUpdatedEvent,
    ViewUpdatedEvent,
} from '../services/socketManager/types'
import {NotificationStatus} from '../state/notifications/types'
import {RootState} from '../state/types'
import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
} from '../state/entities/sections/actions'
import {
    viewCreated,
    viewDeleted,
    viewUpdated,
} from '../state/entities/views/actions'
import history from '../pages/history'
import {fetchSelfServiceConfigurations} from '../models/selfServiceConfiguration/resources'
import {selfServiceConfigurationsFetched} from '../state/entities/selfServiceConfigurations/actions'
import {setLoading} from '../state/ui/selfServiceConfigurations/actions'

import {MAX_RECENT_CHATS} from './recentChats'
import {
    VIEW_SECTION_CREATED,
    VIEW_SECTION_DELETED,
    VIEW_SECTION_UPDATED,
} from './socketConstants'

export type SendData = {
    clientId?: string
    event?: SocketEventType
    dataType?: string
    data?: any
}

type SendEvent = {
    name: string
    dataToSend: (value?: string | number[]) => SendData
    onLeave?: (value?: string) => void
}

export type ReceivedEvent = {
    name: string
    onReceive: (event: ServerMessage) => void
}

//$TsFixMe remove once init.js is migrated
const typeSafeReduxStore = reduxStore as EnhancedStore

/**
 * Events that can be sent to server via socket
 */
export const sendEvents: SendEvent[] = [
    {
        name: SocketEventType.TicketViewed,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.TicketViewed,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: SocketEventType.AgentTypingStarted,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentTypingStarted,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: SocketEventType.AgentTypingStopped,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentTypingStopped,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: SocketEventType.ViewsCountExpired,
        dataToSend: function (viewIds) {
            return {
                event: SocketEventType.ViewsCountExpired,
                dataType: 'View',
                data: viewIds,
            }
        },
    },
    {
        name: SocketEventType.AgentActive,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentActive,
                clientType: 'web',
            }
        },
    },
    {
        name: SocketEventType.AgentInactive,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.AgentInactive,
            }
        },
    },
    {
        name: SocketEventType.SidUpdated,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: SocketEventType.SidUpdated,
            }
        },
    },
]

/**
 * Events describing a room to join on server via socket
 */
export const joinEvents: SendEvent[] = [
    {
        name: 'ticket',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Ticket',
                data: parseInt(id as string),
            }
        },
        onLeave: function (id) {
            return ((this as unknown) as SocketManager).send(
                SocketEventType.AgentTypingStopped,
                id
            )
        },
    },
    {
        name: 'customer',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Customer',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: 'view',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'View',
                data: parseInt(id as string),
            }
        },
    },
    {
        name: 'integration',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Integration',
                data: parseInt(id as string),
            }
        },
    },
]

/**
 * Events that can be received from server via socket
 */
export const receivedEvents: ReceivedEvent[] = [
    {
        name: 'customer-updated',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                ticketActions.mergeCustomer(
                    (json as CustomerUpdatedEvent).customer
                )
            )
        },
    },
    {
        name: 'user-location-updated',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                agentsActions.setAgentsLocations(
                    (json as UserLocationUpdatedEvent).locations
                )
            )
        },
    },
    {
        name: 'user-typing-status-updated',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                agentsActions.setAgentsTypingStatuses(
                    (json as UserTypingStatusUpdatedEvent).locations
                )
            )
        },
    },
    {
        name: 'ticket-updated',
        onReceive: function (json) {
            const {ticket} = json as TicketUpdatedEvent
            if (ticket.is_unread) {
                typeSafeReduxStore.dispatch(
                    chatsActions.markChatAsUnread(ticket.id)
                )
            }
            typeSafeReduxStore.dispatch(
                ticketActions.mergeTicket(ticket) as any
            )
        },
    },
    {
        name: 'ticket-message-created',
        onReceive: function (json) {
            if (
                isCurrentlyOnTicket(
                    (json as TicketMessageCreatedEvent).ticket.id
                )
            ) {
                ;((this as unknown) as SocketManager).send(
                    SocketEventType.TicketViewed,
                    ((json as TicketMessageCreatedEvent).ticket
                        .id as unknown) as string
                )
            }

            typeSafeReduxStore.dispatch(
                ticketActions.mergeTicket(
                    (json as TicketMessageCreatedEvent).ticket
                ) as any
            )
        },
    },
    {
        name: 'ticket-message-action-failed',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                ticketActions.handleMessageActionError(
                    ((json as TicketMessageActionFailedEvent)
                        .ticket_id as unknown) as string
                ) as any
            )
        },
    },
    {
        name: 'ticket-message-failed',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                ticketActions.handleMessageError(
                    json as TicketMessageFailedEvent
                ) as any
            )
        },
    },
    {
        name: 'action-executed',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                infobarActions.handleExecutedAction(
                    json as ActionExecutedEvent
                ) as any
            )
        },
    },
    {
        name: 'view-created',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch({
                type: viewsConstants.CREATE_VIEW_SUCCESS,
                resp: (json as ViewCreatedEvent).view,
            })
            window.Raven?.captureBreadcrumb({
                message: 'View created from socket event',
                data: json,
                level: 'log',
            })
            typeSafeReduxStore.dispatch(
                viewCreated((json as ViewCreatedEvent).view)
            )
        },
    },
    {
        name: 'view-updated',
        onReceive: function (json) {
            const state = typeSafeReduxStore.getState()
            const currentUser = currentUserSelectors.getCurrentUser(state)
            const teams = getTeams(state)
            const {view} = json as ViewUpdatedEvent

            if (isViewSharedWithUser(view as any, currentUser, teams)) {
                typeSafeReduxStore.dispatch({
                    type: viewsConstants.UPDATE_VIEW_SUCCESS,
                    resp: view,
                })
                typeSafeReduxStore.dispatch(viewUpdated(view))
            } else {
                typeSafeReduxStore.dispatch(
                    viewsActions.deleteViewSuccess(view.id) as any
                )
                typeSafeReduxStore.dispatch(viewDeleted(view.id))
            }
        },
    },
    {
        name: 'view-deleted',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                viewsActions.deleteViewSuccess(
                    (json as ViewDeletedEvent).view.id
                ) as any
            )
            typeSafeReduxStore.dispatch(
                viewDeleted((json as ViewDeletedEvent).view.id)
            )
        },
    },
    {
        name: VIEW_SECTION_CREATED,
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                sectionCreated((json as ViewSectionCreatedEvent).view_section)
            )
        },
    },
    {
        name: VIEW_SECTION_UPDATED,
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                sectionUpdated((json as ViewSectionUpdatedEvent).view_section)
            )
        },
    },
    {
        name: VIEW_SECTION_DELETED,
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                sectionDeleted(
                    (json as ViewSectionDeletedEvent).view_section.id
                )
            )
        },
    },
    {
        name: 'views-count-updated',
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                viewsCountFetched((json as ViewCountUpdatedEvent).counts)
            )
            typeSafeReduxStore.dispatch(
                viewsActions.handleViewsCount(
                    (json as ViewCountUpdatedEvent).counts
                ) as any
            )
        },
    },
    {
        name: SocketEventType.AccountUpdated,
        onReceive: function (json) {
            const state = typeSafeReduxStore.getState() as RootState
            const newAccountStatus =
                (json as AccountUpdatedEvent)?.account?.status?.status ||
                'active'
            const notification = (json as AccountUpdatedEvent)?.account?.status
                ?.notification
            const currentAccountStatus =
                //@ts-ignore
                (state.currentAccount as {status?: {status?: string}})?.status
                    ?.status || 'active'

            typeSafeReduxStore.dispatch(
                notificationsActions.handleUsageBanner({
                    newAccountStatus,
                    currentAccountStatus,
                    notification,
                }) as any
            )

            const oldTicketAssignmentSetting = currentAccountSelectors.getTicketAssignmentSettings(
                state
            )

            const account = (json as AccountUpdatedEvent).account
            const newTicketAssignmentSetting = fromJS(
                _find(
                    account.settings || [],
                    (setting) =>
                        setting.type ===
                        currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT
                ) || {}
            ) as Map<any, any>

            let shouldFetchChats =
                oldTicketAssignmentSetting.isEmpty() &&
                !newTicketAssignmentSetting.isEmpty()

            if (
                !oldTicketAssignmentSetting.isEmpty() &&
                !newTicketAssignmentSetting.isEmpty()
            ) {
                const autoAssignToTeamSettingHasChanged =
                    newTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ]) !==
                    oldTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ])

                const oldAssignmentChannels = oldTicketAssignmentSetting.getIn(
                    ['data', 'assignment_channels'],
                    fromJS([])
                ) as List<any>
                const newAssignmentChannels = newTicketAssignmentSetting.getIn(
                    ['data', 'assignment_channels'],
                    fromJS([])
                ) as List<any>
                const ticketAssignmentChannelsHaveChanged = !oldAssignmentChannels.equals(
                    newAssignmentChannels
                )

                if (
                    autoAssignToTeamSettingHasChanged ||
                    (newTicketAssignmentSetting.getIn([
                        'data',
                        'auto_assign_to_teams',
                    ]) &&
                        ticketAssignmentChannelsHaveChanged)
                ) {
                    shouldFetchChats = true
                }
            }

            if (shouldFetchChats) {
                chatsActions.fetchChatsThrottled(typeSafeReduxStore.dispatch)
            }

            typeSafeReduxStore.dispatch({
                type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                resp: account,
            })
        },
    },
    {
        name: SocketEventType.SidUpdated,
        onReceive: function () {
            ;((this as unknown) as SocketManager).send(
                SocketEventType.SidUpdated
            )
        },
    },
    {
        name: SocketEventType.SelfServiceConfigurationsUpdateStarted,
        onReceive: function () {
            typeSafeReduxStore.dispatch(setLoading(true))
        },
    },
    {
        name: SocketEventType.SelfServiceConfigurationsUpdated,
        onReceive: async function () {
            typeSafeReduxStore.dispatch(setLoading(true))
            try {
                const res = await fetchSelfServiceConfigurations()
                typeSafeReduxStore.dispatch(
                    selfServiceConfigurationsFetched(res.data)
                )
            } catch (error) {
                typeSafeReduxStore.dispatch(
                    notificationsActions.notify({
                        status: NotificationStatus.Error,
                        message:
                            'Could not fetch Self-service configurations, please try again later.',
                    }) as any
                )
            } finally {
                typeSafeReduxStore.dispatch(setLoading(false))
            }
        },
    },
    {
        name: SocketEventType.TicketMessageChatCreated,
        onReceive: function (json) {
            const ticket = (json as TicketMessageChatCreatedEvent).data
            // send browser notifications only for new customer messages
            const shouldNotify = !ticket.last_message_from_agent

            const playSoundNotification = (json as TicketMessageChatCreatedEvent)
                .event.play_sound_notification

            const state = typeSafeReduxStore.getState()
            const {currentUser} = state

            const ticketAssignmentSetting = currentAccountSelectors.getTicketAssignmentSettings(
                state
            )
            const currentUserIsAvailable = currentUserSelectors.isAvailable(
                state
            )

            // mark the chat as read because the agent is viewing the ticket
            if (isCurrentlyOnTicket(ticket.id)) {
                ;((this as unknown) as SocketManager).send(
                    SocketEventType.TicketViewed,
                    (ticket.id as unknown) as string
                )
                ticket.is_unread = false
            }

            if (
                shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSetting,
                    currentUser,
                    currentUserIsAvailable
                )
            ) {
                typeSafeReduxStore.dispatch(
                    chatsActions.addChat(
                        ticket,
                        shouldNotify,
                        playSoundNotification
                    ) as any
                )
                return
            }

            typeSafeReduxStore.dispatch(chatsActions.removeChat(ticket.id))

            const {chats} = typeSafeReduxStore.getState() as RootState

            if ((chats.get('tickets') as List<any>).size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(typeSafeReduxStore.dispatch)
            }
        },
    },
    {
        name: SocketEventType.TicketChatUpdated,
        onReceive: function (json) {
            const ticket = (json as TicketChatUpdatedEvent).data
            const state = typeSafeReduxStore.getState() as RootState
            const {currentUser} = state

            const ticketAssignmentSetting = currentAccountSelectors.getTicketAssignmentSettings(
                state
            )
            const currentUserIsAvailable = currentUserSelectors.isAvailable(
                state
            )

            if (
                shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSetting,
                    currentUser,
                    currentUserIsAvailable
                )
            ) {
                typeSafeReduxStore.dispatch(
                    chatsActions.addChat(ticket, false) as any
                )
                return
            }

            typeSafeReduxStore.dispatch(chatsActions.removeChat(ticket.id))

            const {chats} = typeSafeReduxStore.getState() as RootState

            if ((chats.get('tickets') as List<any>).size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(typeSafeReduxStore.dispatch)
            }
        },
    },
    {
        name: SocketEventType.EmailIntegrationVerified,
        onReceive: function (json) {
            integrationsActions.onVerify(
                typeSafeReduxStore.dispatch,
                (json as EmailIntegrationVerifiedEvent).integration_id
            )
        },
    },
    {
        name: SocketEventType.EmailForwardingActivated,
        onReceive: function (json) {
            integrationsActions.onEmailForwardingActivated(
                typeSafeReduxStore.dispatch,
                (json as EmailIntegrationVerifiedEvent).integration_id
            )
        },
    },
    {
        name: SocketEventType.FacebookIntegrationsReconnected,
        onReceive: function (json) {
            typeSafeReduxStore.dispatch(
                integrationsActions.fetchIntegrations() as any
            )

            typeSafeReduxStore.dispatch(
                notificationsActions.notify({
                    status: NotificationStatus.Success,
                    message:
                        (json as FacebookIntegrationsReconnected).event
                            .total === 1
                            ? 'One Facebook page has been reconnected.'
                            : `${
                                  (json as FacebookIntegrationsReconnected)
                                      .event.total
                              } Facebook pages have been reconnected.`,
                }) as any
            )
        },
    },
    {
        name: SocketEventType.ViewsDeactivated,
        onReceive: function (json) {
            const {event} = (json as unknown) as ViewsDeactivated
            const namesList = `<ul>${event.names
                .map((name) => `<li>${name}</li>`)
                .join('')}</ul>`
            const message =
                event.names.length === 1
                    ? `View "${event.names[0]}" has been deactivated.`
                    : `${event.names.length} views have been deactivated: ${namesList}`

            typeSafeReduxStore.dispatch(
                notificationsActions.notify({
                    status: NotificationStatus.Warning,
                    allowHTML: true,
                    message,
                }) as any
            )
        },
    },
    {
        name: SocketEventType.OutboundPhoneCallInitiated,
        onReceive: function (json) {
            const {event} = (json as unknown) as OutboundPhoneCallInitiated
            const {
                phone_ticket_id: phoneTicketId,
                original_path: originalPath,
            } = event

            if (window.location.pathname === originalPath) {
                history.push(`/app/ticket/${phoneTicketId}`)
            }
        },
    },
]
