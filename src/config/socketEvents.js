// @flow
import {fromJS} from 'immutable'
import _find from 'lodash/find'

import {shouldTicketBeDisplayedInRecentChats} from '../business/recentChats'

import * as agentsActions from '../state/agents/actions.ts'
import * as chatsActions from '../state/chats/actions.ts'
import * as infobarActions from '../state/infobar/actions.ts'
import * as integrationsActions from '../state/integrations/actions.ts'
import * as notificationsActions from '../state/notifications/actions.ts'
import * as ticketActions from '../state/ticket/actions'
import * as viewsActions from '../state/views/actions'

import * as viewsConstants from '../state/views/constants'
import * as currentAccountConstants from '../state/currentAccount/constants'

import * as currentAccountSelectors from '../state/currentAccount/selectors.ts'
import * as currentUserSelectors from '../state/currentUser/selectors.ts'
import {getTeams} from '../state/teams/selectors'

import {isCurrentlyOnTicket} from '../utils'
import {store as reduxStore} from '../init'
import {isViewSharedWithUser} from '../state/views/utils'
import * as socketEventTypes from '../services/socketManager/types.js'

import {MAX_RECENT_CHATS} from './recentChats'
import * as socketConstants from './socketConstants'

type SendEvent = {
    name: string,
    dataToSend: (
        value?: string | number[]
    ) => {
        clientId?: string,
        event?: string,
        dataType?: string,
        data?: any,
    },
    onLeave?: (value?: string) => void,
}

type ReceivedEvent = {
    name: string,
    onReceive: (event: $Values<socketEventTypes>) => void,
}

/**
 * Events that can be sent to server via socket
 * @enum name name of config (used to send the event)
 * @enum dataToSend function returning data that is sent to server when sending this event (bound to SocketManager instance)
 */
export const sendEvents: SendEvent[] = [
    {
        name: socketConstants.TICKET_VIEWED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.TICKET_VIEWED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.AGENT_TYPING_STARTED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_TYPING_STARTED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.AGENT_TYPING_STOPPED,
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_TYPING_STOPPED,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
    },
    {
        name: socketConstants.VIEWS_COUNTS_EXPIRED,
        dataToSend: function (viewIds) {
            return {
                event: socketConstants.VIEWS_COUNTS_EXPIRED,
                dataType: 'View',
                data: viewIds,
            }
        },
    },
    {
        name: socketConstants.AGENT_ACTIVE,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_ACTIVE,
                clientType: 'web',
            }
        },
    },
    {
        name: socketConstants.AGENT_INACTIVE,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.AGENT_INACTIVE,
            }
        },
    },
    {
        name: socketConstants.SID_UPDATED,
        dataToSend: function () {
            return {
                clientId: window.CLIENT_ID,
                event: socketConstants.SID_UPDATED,
            }
        },
    },
]

/**
 * Events describing a room to join on server via socket
 * @enum name name of config (used to send the event)
 * @enum dataToSend function returning data that is sent to server when sending this event (bound to SocketManager instance)
 * @enum [onLeave] callback executed after leaving room (bound to SocketManager instance)
 */
export const joinEvents: SendEvent[] = [
    {
        name: 'ticket',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Ticket',
                data: parseInt(id),
            }
        },
        onLeave: function (id) {
            return this.send(socketConstants.AGENT_TYPING_STOPPED, id)
        },
    },
    {
        name: 'customer',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Customer',
                data: parseInt(id),
            }
        },
    },
    {
        name: 'view',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'View',
                data: parseInt(id),
            }
        },
    },
    {
        name: 'integration',
        dataToSend: function (id) {
            return {
                clientId: window.CLIENT_ID,
                dataType: 'Integration',
                data: parseInt(id),
            }
        },
    },
]

/**
 * Events that can be received from server via socket
 * @enum event name of event received
 * @enum onReceive function executed when this event is received (bound to SocketManager instance)
 */
export const receivedEvents: ReceivedEvent[] = [
    {
        name: 'customer-updated',
        onReceive: function (json: socketEventTypes.CustomerUpdatedEvent) {
            reduxStore.dispatch(ticketActions.mergeCustomer(json.customer))
        },
    },
    {
        name: 'user-location-updated',
        onReceive: function (json: socketEventTypes.UserLocationUpdatedEvent) {
            reduxStore.dispatch(
                agentsActions.setAgentsLocations(json.locations)
            )
        },
    },
    {
        name: 'user-typing-status-updated',
        onReceive: function (
            json: socketEventTypes.UserTypingStatusUpdatedEvent
        ) {
            reduxStore.dispatch(
                agentsActions.setAgentsTypingStatuses(json.locations)
            )
        },
    },
    {
        name: 'ticket-updated',
        onReceive: function (json: socketEventTypes.TicketUpdatedEvent) {
            if (isCurrentlyOnTicket(json.ticket.id)) {
                this.send(socketConstants.TICKET_VIEWED, json.ticket.id)
            }

            reduxStore.dispatch(ticketActions.mergeTicket(json.ticket))
        },
    },
    {
        name: 'ticket-message-created',
        onReceive: function (json: socketEventTypes.TicketMessageCreatedEvent) {
            if (isCurrentlyOnTicket(json.ticket.id)) {
                this.send(socketConstants.TICKET_VIEWED, json.ticket.id)
            }

            reduxStore.dispatch(ticketActions.mergeTicket(json.ticket))
        },
    },
    {
        name: 'ticket-message-action-failed',
        onReceive: function (
            json: socketEventTypes.TicketMessageActionFailedEvent
        ) {
            reduxStore.dispatch(
                ticketActions.handleMessageActionError(json.ticket_id)
            )
        },
    },
    {
        name: 'ticket-message-failed',
        onReceive: function (json: socketEventTypes.TicketMessageFailedEvent) {
            reduxStore.dispatch(ticketActions.handleMessageError(json))
        },
    },
    {
        name: 'action-executed',
        onReceive: function (json: socketEventTypes.ActionExecutedEvent) {
            reduxStore.dispatch(infobarActions.handleExecutedAction(json))
        },
    },
    {
        name: 'view-created',
        onReceive: function (json: socketEventTypes.ViewCreatedEvent) {
            reduxStore.dispatch({
                type: viewsConstants.CREATE_VIEW_SUCCESS,
                resp: json.view,
            })
        },
    },
    {
        name: 'view-updated',
        onReceive: function (json: socketEventTypes.ViewUpdatedEvent) {
            const state = reduxStore.getState()
            const currentUser = currentUserSelectors.getCurrentUser(state)
            const teams = getTeams(state)
            const {view} = json

            if (isViewSharedWithUser(view, currentUser, teams)) {
                reduxStore.dispatch({
                    type: viewsConstants.UPDATE_VIEW_SUCCESS,
                    resp: view,
                })
            } else {
                reduxStore.dispatch(viewsActions.deleteViewSuccess(view.id))
            }
        },
    },
    {
        name: 'view-deleted',
        onReceive: function (json: socketEventTypes.ViewDeletedEvent) {
            reduxStore.dispatch(viewsActions.deleteViewSuccess(json.view.id))
        },
    },
    {
        name: 'views-count-updated',
        onReceive: function (json: socketEventTypes.ViewCountUpdatedEvent) {
            reduxStore.dispatch(viewsActions.handleViewsCount(json.counts))
        },
    },
    {
        name: socketConstants.ACCOUNT_UPDATED,
        onReceive: function (json: socketEventTypes.AccountUpdatedEvent) {
            const state = reduxStore.getState()
            const newAccountStatus = json?.account?.status?.status || 'active'
            const notification = json?.account?.status?.notification
            const currentAccountStatus =
                state.currentAccount?.status?.status || 'active'

            reduxStore.dispatch(
                notificationsActions.handleUsageBanner({
                    newAccountStatus,
                    currentAccountStatus,
                    notification,
                })
            )

            const oldTicketAssignmentSetting = currentAccountSelectors.getTicketAssignmentSettings(
                state
            )

            const account = json.account
            const newTicketAssignmentSetting = fromJS(
                _find(
                    account.settings || [],
                    (setting) =>
                        setting.type ===
                        currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT
                ) || {}
            )

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
                )
                const newAssignmentChannels = newTicketAssignmentSetting.getIn(
                    ['data', 'assignment_channels'],
                    fromJS([])
                )
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
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }

            reduxStore.dispatch({
                type: currentAccountConstants.UPDATE_ACCOUNT_SUCCESS,
                resp: account,
            })
        },
    },
    {
        name: socketConstants.SID_UPDATED,
        onReceive: function () {
            this.send(socketConstants.SID_UPDATED)
        },
    },
    {
        name: socketConstants.TICKET_MESSAGE_CHAT_CREATED,
        onReceive: function (
            json: socketEventTypes.TicketMessageChatCreatedEvent
        ) {
            const ticket = json.data
            // send browser notifications only for new customer messages
            const shouldNotify = !ticket.last_message_from_agent

            const state = reduxStore.getState()
            const {currentUser} = state

            const ticketAssignmentSetting = currentAccountSelectors.getTicketAssignmentSettings(
                state
            )
            const currentUserIsAvailable = currentUserSelectors.isAvailable(
                state
            )

            // mark the chat as read because the agent is viewing the ticket
            if (isCurrentlyOnTicket(ticket.id)) {
                this.send(socketConstants.TICKET_VIEWED, ticket.id)
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
                reduxStore.dispatch(chatsActions.addChat(ticket, shouldNotify))
                return
            }

            reduxStore.dispatch(chatsActions.removeChat(ticket.id))

            let {chats} = reduxStore.getState()

            if (chats.get('tickets').size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }
        },
    },
    {
        name: socketConstants.TICKET_CHAT_UPDATED,
        onReceive: function (json: socketEventTypes.TicketChatUpdatedEvent) {
            const ticket = json.data
            const state = reduxStore.getState()
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
                reduxStore.dispatch(chatsActions.addChat(ticket, false))
                return
            }

            reduxStore.dispatch(chatsActions.removeChat(ticket.id))

            let {chats} = reduxStore.getState()

            if (chats.get('tickets').size < MAX_RECENT_CHATS) {
                chatsActions.fetchChatsThrottled(reduxStore.dispatch)
            }
        },
    },
    {
        name: socketConstants.EMAIL_INTEGRATION_VERIFIED,
        onReceive: function (
            json: socketEventTypes.EmailIntegrationVerifiedEvent
        ) {
            integrationsActions.onVerify(
                reduxStore.dispatch,
                json.integration_id
            )
        },
    },
    {
        name: socketConstants.FACEBOOK_INTEGRATIONS_RECONNECTED,
        onReceive: function ({
            event,
        }: socketEventTypes.FacebookIntegrationsReconnected) {
            reduxStore.dispatch(integrationsActions.fetchIntegrations())

            reduxStore.dispatch(
                notificationsActions.notify({
                    status: 'success',
                    message:
                        event.total === 1
                            ? 'One Facebook page has been reconnected.'
                            : `${event.total} Facebook pages have been reconnected.`,
                })
            )
        },
    },
    {
        name: socketConstants.VIEWS_DEACTIVATED,
        onReceive: function ({event}: socketEventTypes.ViewsDeactivated) {
            const namesList = `<ul>${event.names
                .map((name) => `<li>${name}</li>`)
                .join('')}</ul>`
            const message =
                event.names.length === 1
                    ? `View "${event.names[0]}" has been deactivated.`
                    : `${event.names.length} views have been deactivated: ${namesList}`

            reduxStore.dispatch(
                notificationsActions.notify({
                    status: 'warning',
                    allowHTML: true,
                    message,
                })
            )
        },
    },
]
