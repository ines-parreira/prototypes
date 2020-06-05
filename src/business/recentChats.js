// @flow
import {fromJS, type Map} from 'immutable'

import {TicketStatuses, type TicketChannel, type TicketStatus} from './ticket'


/**
 * Return whether or not a ticket update received via websockets should be displayed in the current user's recent chats.
 * @param ticket: the ticket we received via websocket
 * @param ticketAssignmentSetting: the ticket assignment setting of the current account
 * @param currentUser: the current user
 * @param currentUserIsAvailable: whether or not the current user is available
 * @returns {boolean}: whether or not a ticket update received via websockets should be displayed in the current
 *  user's recent chats
 */
export function shouldTicketBeDisplayedInRecentChats(
    ticket: RecentChatTicket,
    ticketAssignmentSetting: Map<*, *>,
    currentUser: Map<*, *>,
    currentUserIsAvailable: boolean
) {
    const ticketShouldBeHidden = ticket.status === TicketStatuses.CLOSED
        || ticket.spam
        || !!ticket.trashed_datetime
        || !!ticket.deleted_datetime
    if (ticketShouldBeHidden) {
        return false
    }

    const ticketHasBeenReassigned = ticket.assignee_user_id && ticket.assignee_user_id !== currentUser.get('id')
    if (ticketHasBeenReassigned) {
        return false
    }

    const autoAssignEnabled = ticketAssignmentSetting.getIn(['data', 'auto_assign_to_teams'])
    const channelSetForTicketAssignmentSettings = ticketAssignmentSetting
        .getIn(['data', 'assignment_channels'], fromJS([]))
        .includes(ticket.channel)
    const autoAssignIsEnabledForTicketChannel = autoAssignEnabled && channelSetForTicketAssignmentSettings

    const ticketIsAssigned = !!ticket.assignee_user_id

    return ticketIsAssigned || (!autoAssignIsEnabledForTicketChannel && currentUserIsAvailable)
}

// Types
export type RecentChatTicket = {
    id: number,
    channel: TicketChannel,
    customer: {
        id: number,
        name: string,
        email: string
    },
    last_message_datetime: string,
    is_unread: boolean,
    status: TicketStatus,
    assignee_user_id: ?number,
    spam: boolean,
    trashed_datetime: string,
    deleted_datetime: string,

    last_message_from_agent: ?boolean,
    last_message_body_text: ?string
}
