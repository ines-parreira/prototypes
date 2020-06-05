//@flow
import {fromJS} from 'immutable'

import {shouldTicketBeDisplayedInRecentChats} from '../recentChats'
import {TicketChannels, TicketStatuses} from '../ticket'

const defaultTicket = {
    id: 1,
    status: TicketStatuses.OPEN,
    channel: TicketChannels.CHAT,
    spam: false,
    trashed_datetime: '',
    deleted_datetime: '',
    assignee_user_id: null,
    customer: {
        id: 2,
        name: 'foo',
        email: 'bar',
    },
    last_message_datetime: '',
    is_unread: true,
    last_message_from_agent: null,
    last_message_body_text: null,
}

describe('Business', () => {
    describe('recentChats', () => {
        describe('shouldTicketBeDisplayedInRecentChats()', () => {
            const ticketAssignmentSettings = {
                autoAssignEnabled: fromJS({
                    data: {
                        auto_assign_to_teams: true,
                        assignment_channels: [TicketChannels.CHAT, TicketChannels.FACEBOOK_MESSENGER]
                    }
                }),
                autoAssignDisabled: fromJS({
                    data: {
                        auto_assign_to_teams: false,
                        assignment_channels: [TicketChannels.CHAT, TicketChannels.FACEBOOK_MESSENGER]
                    }
                }),
                channelsDontIncludeChat: fromJS({
                    data: {
                        auto_assign_to_teams: true,
                        assignment_channels: [TicketChannels.EMAIL]
                    }
                }),
            }

            const currentUser = fromJS({id: 1})

            it('should return true because the ticket is unassigned and the setting `auto_assign_to_teams` is disabled',
                () => {
                    const res = shouldTicketBeDisplayedInRecentChats(
                        defaultTicket,
                        ticketAssignmentSettings.autoAssignDisabled,
                        currentUser,
                        true
                    )

                    expect(res).toEqual(true)
                })

            it('should return true because the ticket is unassigned and the setting `assignment_channels` does not ' +
                'include the ticket\'s channel', () => {
                const res = shouldTicketBeDisplayedInRecentChats(
                    defaultTicket,
                    ticketAssignmentSettings.channelsDontIncludeChat,
                    currentUser,
                    true
                )

                expect(res).toEqual(true)
            })

            it('should return false because the ticket is closed', () => {
                const ticket = {
                    ...defaultTicket,
                    status: TicketStatuses.CLOSED,
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignDisabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })

            it('should return false because the ticket is marked as spam', () => {
                const ticket = {
                    ...defaultTicket,
                    spam: true,
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignDisabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })

            it('should return false because the ticket is trashed', () => {
                const ticket = {
                    ...defaultTicket,
                    trashed_datetime: '2019-01-01 00:00:00',
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignDisabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })

            it('should return false because the ticket is deleted', () => {
                const ticket = {
                    ...defaultTicket,
                    deleted_datetime: '2019-01-01 00:00:00',
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignDisabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })

            it('should return false because the ticket has been reassigned', () => {
                const ticket = {
                    ...defaultTicket,
                    assignee_user_id: 123,
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignDisabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })


            it('should return false because the ticket has been unassigned and the setting ' +
                '"auto_assign_to_teams" is enabled', () => {
                const res = shouldTicketBeDisplayedInRecentChats(
                    defaultTicket,
                    ticketAssignmentSettings.autoAssignEnabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })
        })
    })
})
