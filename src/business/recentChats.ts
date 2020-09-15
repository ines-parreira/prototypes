import {fromJS, Map, List} from 'immutable'

import {TicketStatus} from './types/ticket'
import {RecentChatTicket} from './types/recentChats'

/**
 * Return whether or not a ticket update received via websockets should be displayed in the current user's recent chats.
 */
export function shouldTicketBeDisplayedInRecentChats(
    ticket: RecentChatTicket,
    ticketAssignmentSetting: Map<any, any>,
    currentUser: Map<any, any>,
    currentUserIsAvailable: boolean
) {
    const ticketShouldBeHidden =
        ticket.status === TicketStatus.Closed ||
        ticket.spam ||
        !!ticket.trashed_datetime ||
        !!ticket.deleted_datetime
    if (ticketShouldBeHidden) {
        return false
    }

    const ticketHasBeenReassigned =
        ticket.assignee_user_id &&
        ticket.assignee_user_id !== currentUser.get('id')
    if (ticketHasBeenReassigned) {
        return false
    }

    const autoAssignEnabled = ticketAssignmentSetting.getIn([
        'data',
        'auto_assign_to_teams',
    ]) as boolean
    const channelSetForTicketAssignmentSettings = (ticketAssignmentSetting.getIn(
        ['data', 'assignment_channels'],
        fromJS([])
    ) as List<any>).includes(ticket.channel)
    const autoAssignIsEnabledForTicketChannel =
        autoAssignEnabled && channelSetForTicketAssignmentSettings

    const ticketIsAssigned = !!ticket.assignee_user_id

    return (
        ticketIsAssigned ||
        (!autoAssignIsEnabledForTicketChannel && currentUserIsAvailable)
    )
}
