import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('chats', () => {
        it('initial state', () => {
            expect(reducer(undefined, {})).toEqualImmutable(initialState)
        })

        it('should handle SET_CHATS', () => {
            const state = initialState.set(
                'tickets',
                fromJS([{id: 1, is_unread: true}])
            )
            const action = {
                type: types.SET_CHATS,
                tickets: [
                    {
                        id: 1,
                        channel: 'chat',
                        last_message_datetime: '2013-05-10 12:10',
                    },
                    {
                        id: 2,
                        channel: 'facebook-messenger',
                        last_message_datetime: '2013-05-10 12:11',
                    },
                ],
            }

            expect(reducer(state, action).toJS()).toMatchSnapshot()
        })

        it('should handle ADD_CHAT', () => {
            const state = initialState.set(
                'tickets',
                fromJS([{id: 1, is_unread: true}])
            )
            const action = {
                type: types.ADD_CHAT,
                ticket: {
                    id: 1,
                    channel: 'chat',
                    last_message_datetime: '2013-05-10 12:10',
                },
            }

            expect(reducer(state, action).toJS()).toMatchSnapshot()
        })

        it('should handle REMOVE_CHAT', () => {
            const action = {
                type: types.REMOVE_CHAT,
                ticketId: 1,
            }
            const state = initialState.set(
                'tickets',
                fromJS([{id: 1}, {id: 2}])
            )

            expect(reducer(state, action).toJS()).toMatchSnapshot()
        })

        it('should handle MARK_CHAT_AS_READ', () => {
            const action = {
                type: types.MARK_CHAT_AS_READ,
                ticketId: 1,
            }
            const state = initialState.set(
                'tickets',
                fromJS([{id: 1, is_unread: true}])
            )

            expect(reducer(state, action).toJS()).toMatchSnapshot()
        })
    })
})
