import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import reducer, {initialState} from '../reducers'
import {getLastSameSourceTypeMessage} from '../utils'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('Ticket reducer', () => {
    it('should return the initial state', () => {
        expect(
            reducer(undefined, {})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should return correct loading state equal true', () => {
        let expected = initialState.setIn(['_internal', 'loading', 'deleteMessage'], true)

        expect(
            reducer(initialState, {type: types.DELETE_TICKET_MESSAGE_START})
        ).toEqualImmutable(
            expected
        )
    })

    it('should return same state if state.id if undefined or different from response', () => {
        const currentTicket = initialState.set('id', 'toto')
        expect(
            reducer(currentTicket, {type: types.SUBMIT_TICKET_SUCCESS, resp: {id: 'fake'}})
        ).toEqualImmutable(
            currentTicket
        )
    })

    // TODO ✅ : fetch_ticket_success

    it('should return same state if ticket_id is different', () => {
        expect(
            reducer(initialState, {type: types.FETCH_MESSAGE_SUCCESS, resp: {}})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should return clean ticket', () => {
        const currentTicket = initialState.set('subject', 'Hold the door!')

        expect(
            reducer(currentTicket, {type: types.CLEAR_TICKET})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should return clean ticket', () => {
        const currentTicket = initialState.set('subject', 'Hold the door!')

        expect(
            reducer(currentTicket, {type: types.CLEAR_TICKET})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should add tags to ticket', () => {
        const args = fromJS({tags: 'npm,drama'})
        const expected = initialState.set('tags', fromJS([
            {name: 'npm'},
            {name: 'drama'},
        ]))

        expect(
            reducer(initialState, {type: types.ADD_TICKET_TAGS, args})
        ).toEqual(
            expected
        )
    })

    it('should remove one tag', () => {
        const tags = fromJS([{name: 'npm'}, {name: 'drama'}])
        const currentTicket = initialState.set('tags', tags)
        const expected = initialState.set('tags', tags.delete(1))

        expect(
            reducer(currentTicket, {type: types.REMOVE_TICKET_TAG, args: fromJS({tag: 'drama'})})
        ).toEqualImmutable(
            expected
        )
    })

    it('should toggle priority', () => {
        const expected = initialState.set('priority', 'high')

        expect(
            reducer(initialState, {type: types.TOGGLE_PRIORITY, args: fromJS({})})
        ).toEqualImmutable(
            expected
        )
    })

    it('should update action.args.priority if exists', () => {
        const args = fromJS({priority: 'normal'})
        const expected = initialState.set('priority', 'normal')

        expect(
            reducer(initialState, {type: types.TOGGLE_PRIORITY, args})
        ).toEqualImmutable(
            expected
        )
    })

    it('should set assignee_user to null if args.assignee_user is undefined', () => {
        expect(
            reducer(initialState, {type: types.SET_AGENT, args: fromJS({})})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should set assignee_user if args.assignee_user exists', () => {
        const args = fromJS({assignee_user: 'Gordon Ramsay'})
        const expected = initialState.set('assignee_user', 'Gordon Ramsay')

        expect(
            reducer(initialState, {type: types.SET_AGENT, args})
        ).toEqualImmutable(
            expected
        )
    })

    it('should set new ticket status', () => {
        const args = fromJS({status: 'old'})
        const expected = initialState.set('status', 'old')

        expect(
            reducer(initialState, {type: types.SET_STATUS, args})
        ).toEqualImmutable(
            expected
        )
    })

    it('should set subject', () => {
        const args = fromJS({subject: 'the cake is a lie'})
        const expected = initialState.set('subject', 'the cake is a lie')

        expect(
            reducer(initialState, {type: types.SET_SUBJECT, args})
        ).toEqualImmutable(
            expected
        )
    })

    it('should setup a new ticket', () => {
        const expected = initialState

        expect(
            reducer(initialState, {type: types.CLEAR_TICKET})
        ).toEqualImmutable(
            expected
        )
    })

    it('should mark ticket dirty', () => {
        const expected = initialState.setIn(['state', 'dirty'], true)

        expect(
            reducer(initialState, {type: types.MARK_TICKET_DIRTY, dirty: true})
        ).toEqualImmutable(
            expected
        )
    })

    it('should remove correct message', () => {
        const currentTicket = initialState.set('messages', fromJS([{id: 'foo', txt: 'coucou'}]))

        expect(
            reducer(currentTicket, {type: types.DELETE_TICKET_MESSAGE_SUCCESS, messageId: 'foo'})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should handle SET_SPAM', () => {
        expect(
            reducer(initialState, {type: types.SET_SPAM, spam: true})
        ).toEqualImmutable(
            initialState.set('spam', true)
        )
    })

    it('should mark ticket dirty', () => {
        const expected = initialState.setIn(['state', 'dirty'], true)

        expect(
            reducer(initialState, {type: types.MARK_TICKET_DIRTY, dirty: true})
        ).toEqualImmutable(
            expected
        )
    })

    describe('function getLastSameSourceTypeMessage', () => {
        it('should return the last message of matching sourceType', () => {
            const messages = fromJS([
                {id: 1, source: {type: 'email'}},
                {id: 2, source: {type: 'chat'}},
                {id: 3, source: {type: 'email'}},
                {id: 4, source: {type: 'chat'}},
                {id: 5, source: {type: 'email'}}
            ])

            expect(getLastSameSourceTypeMessage(messages, 'chat')).toEqualImmutable(fromJS({
                id: 4,
                source: {type: 'chat'}
            }))
        })
    })

    it('should set ticket requester', () => {
        const requester = fromJS({
            id: 1,
            name: 'Pizza Pepperoni'
        })
        const expected = initialState.set('requester', requester)
        const args = fromJS({requester})

        expect(
            reducer(initialState, {type: types.SET_REQUESTER, args})
        ).toEqualImmutable(
            expected
        )
    })
})
