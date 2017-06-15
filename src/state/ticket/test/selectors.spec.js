import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {fromJS} from 'immutable'

describe('selectors', () => {
    describe('ticket', () => {
        let state

        beforeEach(() => {
            state = {
                ticket: initialState
            }
        })

        describe('getMessages()', () => {
            it('should get all of the ticket\'s messages', () => {
                const messages = fromJS([{'id': 1}, {'id': 2}, {'id': 3}])

                state.ticket = state.ticket.set('messages', messages)
                expect(selectors.getMessages(state).toJS()).toEqual(messages.toJS())
            })
        })

        describe('getReadMessages()', () => {
            it('should get only the read messages of the ticket', () => {
                const messages = fromJS([
                    {'id': 1, 'opened_datetime': true},
                    {'id': 2},
                    {'id': 3, 'opened_datetime': true}
                ])

                state.ticket = state.ticket.set('messages', messages)
                expect(selectors.getReadMessages(state).toJS()).toEqual(
                    messages.filter((message) => message.get('opened_datetime')).toJS()
                )
            })
        })

        describe('getLastReadMessage()', () => {
            it('should get only the last read messages of the ticket', () => {
                const messages = fromJS([
                    {'id': 1, 'opened_datetime': true, 'sent_datetime': 1},
                    {'id': 2},
                    {'id': 3, 'opened_datetime': true, 'sent_datetime': 3}
                ])

                state.ticket = state.ticket.set('messages', messages)
                expect(selectors.getLastReadMessage(state).toJS()).toEqual(
                    {'id': 3, 'opened_datetime': true, 'sent_datetime': 3}
                )
            })
        })
    })
})
