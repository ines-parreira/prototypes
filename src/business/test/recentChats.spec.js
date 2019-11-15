import {fromJS} from 'immutable'

import {shouldTicketBeDisplayedInRecentChats} from '../recentChats'
import {TicketChannels, TicketStatuses} from '../ticket'


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
                    const ticket = {
                        status: TicketStatuses.OPEN,
                        channel: TicketChannels.CHAT,
                        spam: false,
                        trashed_datetime: null,
                        deleted_datetime: null,
                        assignee_user_id: null
                    }

                    const res = shouldTicketBeDisplayedInRecentChats(
                        ticket,
                        ticketAssignmentSettings.autoAssignDisabled,
                        currentUser,
                        true
                    )

                    expect(res).toEqual(true)
                })

            it('should return true because the ticket is unassigned and the setting `assignment_channels` does not ' +
                'include the ticket\'s channel', () => {
                const ticket = {
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.channelsDontIncludeChat,
                    currentUser,
                    true
                )

                expect(res).toEqual(true)
            })

            it('should return false because the ticket is closed', () => {
                const ticket = {
                    id: 1,
                    status: TicketStatuses.CLOSED,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
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
                    id: 1,
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: true,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
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
                    id: 1,
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: '2019-01-01 00:00:00',
                    deleted_datetime: null,
                    assignee_user_id: null
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
                    id: 1,
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: '2019-01-01 00:00:00',
                    assignee_user_id: null
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
                    id: 1,
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: 123
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
                const ticket = {
                    id: 1,
                    status: TicketStatuses.OPEN,
                    channel: TicketChannels.CHAT,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                const res = shouldTicketBeDisplayedInRecentChats(
                    ticket,
                    ticketAssignmentSettings.autoAssignEnabled,
                    currentUser,
                    true
                )

                expect(res).toEqual(false)
            })
        })
    })
})
