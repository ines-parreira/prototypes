import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import reducer, {makeNewMessage, initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('New message reducer', () => {
    it('should return the initial state', () => {
        expect(
            reducer(undefined, {})
        ).toEqualImmutable(
            initialState
        )
    })

    it('should return new state with attachment loading to true', () => {
        const expected = initialState.setIn(['_internal', 'loading', 'addAttachment'], true)

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_ADD_ATTACHMENT_START})
        ).toEqualImmutable(
            expected
        )
    })

    it('should merge correctly newMessage and state dirty', () => {
        const expected = initialState.mergeDeep({
            newMessage: {
                attachments: initialState.getIn(['newMessage', 'attachments']).concat(['resp']),
            },
            state: {
                dirty: true,
            }
        })
            .setIn(['_internal', 'loading', 'addAttachment'], false)

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS, resp: ['resp']})
        ).toEqualImmutable(
            expected
        )
    })

    it('should return state with dirty state and delete corect index attachments', () => {
        const fakeAttachments = initialState.mergeDeep({
            newMessage: {
                attachments: initialState.getIn(['newMessage', 'attachments']).concat(['test1', 'test2'])
            }
        })

        const expected = fakeAttachments
            .setIn(['newMessage', 'attachments'], fakeAttachments.getIn(['newMessage', 'attachments']).delete(0))
            .setIn(['state', 'dirty'], true)

        expect(
            reducer(fakeAttachments, {type: types.NEW_MESSAGE_DELETE_ATTACHMENT, index: 0})
        ).toEqualImmutable(
            expected
        )
    })

    it('should return state with new micro ID', () => {
        const expected = initialState.setIn(
            ['newMessage', 'macros'],
            initialState.getIn(['newMessage', 'macros']).push({id: '666'})
        )

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_RECORD_MACRO, macro: fromJS({id: '666'})})
        ).toEqual(
            expected
        )
    })

    it('should return loading state equal false', () => {
        const expected = initialState.setIn(['_internal', 'loading', 'submitMessage'], false)

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_SUBMIT_TICKET_ERROR})
        ).toEqualImmutable(
            expected
        )
    })

    it('should return same state if state.id is undefined or different from response', () => {
        const currentTicket = initialState.set('id', 'toto')
        expect(
            reducer(currentTicket, {type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS, resp: {id: 'fake'}})
        ).toEqualImmutable(
            currentTicket
        )
    })

    it('should return newState ticket is resetMessage is false', () => {
        const expected = initialState
            .merge(fromJS({}))
            .mergeDeep({
                state: {
                    dirty: false,
                }
            })

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS, resp: {}, resetMessage: false})
        ).toEqualImmutable(
            expected
        )
    })

    it('should return newState with a reset message', () => {
        const expected = initialState
            .mergeDeep({
                state: {
                    dirty: false,
                },
            })

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                resp: {
                    channel: 'email',
                    messages: [makeNewMessage('email', 'email')],
                },
                resetMessage: true
            })
        ).toEqualImmutable(
            expected
        )
    })

    it('should set source facebook', () => {
        const expected = initialState
            .setIn(['newMessage', 'channel'], 'facebook')
            .setIn(['newMessage', 'source', 'type'], 'facebook')
            .setIn(['newMessage', 'public'], true)

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_SET_SOURCE_TYPE, sourceType: 'facebook'})
        ).toEqualImmutable(
            expected
        )
    })

    it('should set source internal-note', () => {
        const expected = initialState.mergeDeep({
            newMessage: {
                source: {
                    type: 'internal-note'
                },
                public: false
            }
        })

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SET_SOURCE_TYPE,
                sourceType: 'internal-note',
                messages: fromJS([initialState.get('newMessage').setIn(['source', 'type'], 'email')]),
            })
        ).toEqualImmutable(
            expected
        )
    })

    describe('NEW_MESSAGE_SET_RECEIVERS action', () => {
        it('should set receivers', () => {
            const receiver = {
                id: 3,
                name: 'Dark Vador',
                address: 'dark.vador@gmail.com'
            }

            const expectedReceiver = fromJS(receiver)

            const expected = initialState.mergeDeep({
                newMessage: {
                    source: {
                        to: fromJS([expectedReceiver])
                    }
                },
            })

            expect(
                reducer(initialState, {
                    type: types.NEW_MESSAGE_SET_RECEIVERS,
                    receivers: {
                        to: [receiver],
                    }
                })
            ).toEqualImmutable(
                expected
            )
        })
    })

    it('should handle NEW_MESSAGE_SET_SENDER', () => {
        const action = {
            type: types.NEW_MESSAGE_SET_SENDER,
            sender: fromJS({
                name: 'Acme Support',
                address: 'support@acme.com'
            })
        }
        expect(
            reducer(initialState, action)
        ).toEqualImmutable(
            initialState.setIn(['newMessage', 'source', 'from'], action.sender)
        )
    })

    it('should handle NEW_MESSAGE_SET_SUBJECT', () => {
        const action = {
            type: types.NEW_MESSAGE_SET_SUBJECT,
            subject: 'Hello World!'
        }
        expect(reducer(initialState, action)).toMatchSnapshot()
    })
})
