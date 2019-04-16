import _find from 'lodash/find'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'

import {CLOSED_STATUS, OPEN_STATUS} from '../../constants/ticket'
import {TICKET_CHAT_UPDATED} from '../socketConstants'
import * as socketEvents from '../socketEvents'
import * as chatActions from '../../state/chats/actions'


jest.mock('../../state/chats/actions', () => {
    const _identity = require('lodash/identity')

    return {
        addChat: jest.fn(() => _identity),
        removeChat: jest.fn(() => _identity),
        fetchChatsThrottled: jest.fn(() => _identity)
    }
})

jest.mock('../../init', () => {
    const {fromJS} = require('immutable')
    const {MAX_RECENT_CHATS} = require('../recentChats')
    const configureMockStore = require('redux-mock-store').default
    const thunk = require('redux-thunk').default

    const mockStore = configureMockStore([thunk])

    return {
        store: mockStore({
            currentUser: fromJS({id: 1}),
            chats: fromJS({
                tickets: Array(MAX_RECENT_CHATS - 1).fill({
                    id: 0
                })
            })
        })
    }
})

describe('Config: socketEvents', () => {
    describe('sendEvents', () => {
        const {sendEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(sendEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(sendEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            sendEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('dataToSend')

                const dataToSend = event.dataToSend()
                expect(_isObject(dataToSend)).toBe(true)
                expect(dataToSend).toHaveProperty('event')
            })
        })
    })

    describe('joinEvents', () => {
        const {joinEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(joinEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(joinEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            joinEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('dataToSend')

                const dataToSend = event.dataToSend()
                expect(_isObject(dataToSend)).toBe(true)
                expect(dataToSend).toHaveProperty('dataType')
                expect(dataToSend).toHaveProperty('data')
            })
        })
    })

    describe('receivedEvents', () => {
        const {receivedEvents} = socketEvents

        it('is array', () => {
            expect(_isArray(receivedEvents)).toBe(true)
        })

        it('is array of objects', () => {
            expect(_isObject(receivedEvents[0])).toBe(true)
        })

        it('structure of objects', () => {
            receivedEvents.forEach((event) => {
                expect(event).toHaveProperty('name')
                expect(event).toHaveProperty('onReceive')
            })
        })

        describe('TICKET_CHAT_UPDATED handler', () => {
            const ticketChatUpdatedHandler = _find(receivedEvents, {name: TICKET_CHAT_UPDATED})

            it('should add the ticket to recent chats', () => {
                const ticket = {
                    status: OPEN_STATUS,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.addChat).toHaveBeenCalledWith(ticket, false)
            })

            it('should remove the ticket from recent chats because it is closed', () => {
                const ticket = {
                    id: 1,
                    status: CLOSED_STATUS,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            it('should remove the ticket from recent chats because it is marked as spam', () => {
                const ticket = {
                    id: 1,
                    status: OPEN_STATUS,
                    spam: true,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            it('should remove the ticket from recent chats because it is trashed', () => {
                const ticket = {
                    id: 1,
                    status: OPEN_STATUS,
                    spam: false,
                    trashed_datetime: '2019-01-01 00:00:00',
                    deleted_datetime: null,
                    assignee_user_id: null
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            it('should remove the ticket from recent chats because it is deleted', () => {
                const ticket = {
                    id: 1,
                    status: OPEN_STATUS,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: '2019-01-01 00:00:00',
                    assignee_user_id: null
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            it('should remove the ticket from recent chats because it has been reassigned', () => {
                const ticket = {
                    id: 1,
                    status: OPEN_STATUS,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: 123
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.removeChat).toHaveBeenCalledWith(ticket.id)
            })

            // todo(@martin): uncomment this when we have a good way for patching the global `reduxStore`
            // it('should NOT fetch chats from the API because a ticket was removed from recent chats but there is now ' +
            //     'still more than MAX_RECENT_CHATS recent chats available in the state', () => {
            //     const ticket = {
            //         id: 1,
            //         status: OPEN_STATUS,
            //         spam: false,
            //         trashed_datetime: null,
            //         deleted_datetime: null,
            //         assignee_user_id: 123
            //     }
            //
            //     ticketChatUpdatedHandler.onReceive({data: ticket})
            //     expect(chatActions.fetchChatsThrottled).not.toHaveBeenCalled()
            // })

            it('should fetch chats from the API because a ticket was removed from recent chats and there is now ' +
                'a free slot available in the recent chats section', () => {
                const ticket = {
                    id: 1,
                    status: OPEN_STATUS,
                    spam: false,
                    trashed_datetime: null,
                    deleted_datetime: null,
                    assignee_user_id: 123
                }

                ticketChatUpdatedHandler.onReceive({data: ticket})
                expect(chatActions.fetchChatsThrottled).toHaveBeenCalled()
            })
        })
    })
})
