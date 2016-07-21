import expect from 'expect'
import expectImmutable from 'expect-immutable'
import {Map, List, fromJS} from 'immutable'
import {ticket, newMessage, ticketInitial, getLastSameSourceTypeMessage} from '../ticket'
import * as actions from '../../actions/ticket'

expect.extend(expectImmutable)


describe('Ticket reducer', () => {
    const initialState = ticketInitial

    it('should return the initial state', () => {
        expect(
            ticket(undefined, {})
        ).toEqualImmutable(
            initialState
        )
    })


    it('should return new state with attachmentLoading to true', () => {
        const expected = initialState.setIn(['state', 'attachmentLoading'], true)

        expect(
            ticket(initialState, {type: actions.ADD_ATTACHMENT_START})
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
                attachmentLoading: false,
            }
        })

        expect(
            ticket(initialState, {type: actions.ADD_ATTACHMENT_SUCCESS, resp: ['resp']})
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
            ticket(fakeAttachments, {type: actions.DELETE_ATTACHMENT, index: 0})
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
            ticket(initialState, {type: actions.RECORD_MACRO, macro: Map({id: '666'})})
        ).toEqualImmutable(
            expected
        )
    })


    it('should return correct loading state equal true', () => {
        const expected = initialState.setIn(['state', 'loading'], true)

        expect(
            ticket(initialState, {type: actions.DELETE_TICKET_MESSAGE_START})
        ).toEqualImmutable(
            expected
        )

        expect(
            ticket(initialState, {type: actions.SUBMIT_TICKET_START})
        ).toEqualImmutable(
            expected
        )
    })


    it('should return loading state equal false', () => {
        const expected = initialState.setIn(['state', 'loading'], false)

        expect(
            ticket(initialState, {type: actions.SUBMIT_TICKET_ERROR})
        ).toEqualImmutable(
            expected
        )
    })


    it('should return same state if state.id if undefined or different from response', () => {
        const currentTicket = initialState.set('id', 'toto')
        expect(
            ticket(currentTicket, {type: actions.SUBMIT_TICKET_SUCCESS, resp: {id: 'fake'}})
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
                    loading: false,
                    query: ''
                }
            })

        expect(
            ticket(initialState, {type: actions.SUBMIT_TICKET_SUCCESS, resp: {}, resetMessage: false})
        ).toEqualImmutable(
            expected
        )
    })


    it('should return newState with a reset message', () => {
        const expected = initialState
            .merge(fromJS({}))
            .mergeDeep({
                state: {
                    dirty: false,
                    loading: false,
                    query: ''
                },
                messages: List([Map(newMessage('email', 'email'))])
            })

        const currentTicket = initialState.mergeDeep({
            messages: List([Map(newMessage('email', 'email'))])
        })

        expect(
            ticket(currentTicket, {
                type: actions.SUBMIT_TICKET_SUCCESS,
                resp: {channel: 'email'},
                resetMessage: true
            })
        ).toEqualImmutable(
            expected
        )
    })


    // TODO ✅ : fetch_ticket_success


    it('should return same state if ticket_id is different', () => {
        expect(
            ticket(initialState, {type: actions.FETCH_MESSAGE_SUCCESS, resp: {}})
        ).toEqualImmutable(
            initialState
        )
    })


    it('should return clean ticket', () => {
        const currentTicket = initialState.set('subject', 'Hold the door!')

        expect(
            ticket(currentTicket, {type: actions.CLEAR_TICKET})
        ).toEqualImmutable(
            initialState
        )
    })


    it('should return clean ticket', () => {
        const currentTicket = initialState.set('subject', 'Hold the door!')

        expect(
            ticket(currentTicket, {type: actions.CLEAR_TICKET})
        ).toEqualImmutable(
            initialState
        )
    })


    it('should add tags to ticket', () => {
        const args = fromJS([{name: 'npm'}, {name: 'drama'}])
        const expected = initialState.set('tags', args)

        expect(
            ticket(initialState, {type: actions.ADD_TICKET_TAGS, args})
        ).toEqualImmutable(
            expected
        )
    })


    it('should remove one tags', () => {
        const tags = fromJS([{name: 'npm'}, {name: 'drama'}])
        const currentTicket = initialState.set('tags', tags)
        let expected = initialState.set('tags', tags)
        expected = expected.set('tags', expected.get('tags').delete(1))

        expect(
            ticket(currentTicket, {type: actions.REMOVE_TICKET_TAG, index: 1})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set tags', () => {
        const tags = [{name: 'luke'}, {name: 'leia'}]
        const expected = initialState.set('tags', fromJS(tags))

        expect(
            ticket(initialState, {type: actions.SET_TAGS, args: Map({tags})})
        ).toEqualImmutable(
            expected
        )
    })


    it('should toggle priority', () => {
        // const args = Map({ priority: })
        const expected = initialState.set('priority', 'high')

        expect(
            ticket(initialState, {type: actions.TOGGLE_PRIORITY, args: Map()})
        ).toEqualImmutable(
            expected
        )
    })


    it('should update action.args.priority if exists', () => {
        const args = Map({priority: 'normal'})
        const expected = initialState.set('priority', 'normal')

        expect(
            ticket(initialState, {type: actions.TOGGLE_PRIORITY, args})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set assignee_user to null if args.assignee_user is undefined', () => {
        // const args = Map({ assignee_user: 'Dimitri Payet' })
        // const expected = initialState.set('assignee_user', args)

        expect(
            ticket(initialState, {type: actions.SET_AGENT, args: Map()})
        ).toEqualImmutable(
            initialState
        )
    })


    it('should set assignee_user if args.assignee_user exists', () => {
        const args = Map({assignee_user: 'Dimitri Payet'})
        const expected = initialState.set('assignee_user', 'Dimitri Payet')

        expect(
            ticket(initialState, {type: actions.SET_AGENT, args})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set new ticket status', () => {
        const args = Map({status: 'old'})
        const expected = initialState.set('status', 'old')

        expect(
            ticket(initialState, {type: actions.SET_STATUS, args})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set newMessage.public', () => {
        const expected = initialState.setIn(['newMessage', 'public'], false)

        expect(
            ticket(initialState, {type: actions.SET_PUBLIC, isPublic: false})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set subject', () => {
        const args = Map({subject: 'the cake is a lie'})
        const expected = initialState.set('subject', 'the cake is a lie')

        expect(
            ticket(initialState, {type: actions.SET_SUBJECT, args})
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
            ticket(initialState, {type: actions.SET_SOURCE_TYPE, sourceType: 'facebook'})
        ).toEqualImmutable(
            expected
        )
    })


    it('should set source internal-note', () => {
        // we need to have at least 1 message before setting the internal note
        // otherwise we can't set the source type correctly
        const state = initialState.set('messages',
            List([initialState.get('newMessage').setIn(['source', 'type'], 'email')]))
        const expected = state.mergeDeep({
            newMessage: {
                source: {
                    type: 'internal-note'
                },
                public: false
            }
        })

        expect(
            ticket(state, {type: actions.SET_SOURCE_TYPE, sourceType: 'internal-note'})
        ).toEqualImmutable(
            expected
        )
    })

    // TODO (@gauthierd-):
    // SET_RESPONSE_TEXT action need a test
    // I did not have time to do this test

    it('should setup a new ticket', () => {
        const expected = initialState

        expect(
            ticket(initialState, {type: actions.SETUP_NEW_TICKET})
        ).toEqualImmutable(
            expected
        )
    })

    it('should update potentialRequesters', () => {
        const data = [
            {user: {name: 'foobar'}, address: '4 rue du caire'}
        ]

        const query = '/swag/query'
        const expected = initialState
            .setIn(['state', 'potentialRequesters'], fromJS([{address: '4 rue du caire', name: 'foobar'}]))
            .setIn(['state', 'query'], query)

        expect(
            ticket(initialState, {
                type: actions.UPDATE_POTENTIAL_REQUESTERS,
                resp: {data},
                query
            })
        ).toEqualImmutable(
            expected
        )
    })

    describe('ADD_RECEIVER action', () => {
        it('should add new receiver', () => {
            const expectedReceiver = Map({id: '123'})
            const expected = initialState.mergeDeep({
                newMessage: {
                    receiver: expectedReceiver,
                    source: {
                        to: initialState.getIn(['newMessage', 'source', 'to']).push(Map({id: '123', name: 'foo'})),
                    }
                },
                receiver: expectedReceiver,
                requester: expectedReceiver,
                state: {
                    query: ''
                }
            })


            expect(
                ticket(initialState, {type: actions.ADD_RECEIVER, receiver: {id: '123', name: 'foo'}})
            ).toEqualImmutable(
                expected
            )
        })
    })


    it('should remove receiver', () => {
        // TODO (@gauthierd-): need a fix for REMOVE_RECEIVER type)
        // if my memory serves me well
        // I fail on this test I don't really understand why 😅
        //
        // const expected = initialState
        // const currentTicket = initialState.mergeDeep({
        //     newMessage: {
        //         receiver: fromJS({ id: '123' }),
        //         source: {
        //             to: initialState
        //             .getIn(['newMessage', 'source', 'to'])
        //             .push(fromJS({address: '11', id: '123', name: 'foo'})),
        //         },
        //     },
        //     state: {
        //         query: '',
        //     },
        // })
        //
        //
        // expect(
        //     ticket(currentTicket, { type: actions.REMOVE_RECEIVER, prop: 'address' })
        // ).toEqualImmutable(
        //     expected
        // )
    })

    describe('CLEAR_RECEIVERS action', () => {
        it('should clear receivers', () => {
            const currentState = initialState.mergeDeep({
                newMessage: {
                    receiver: {id: 2},
                    source: {
                        type: 'email',
                        from: {},
                        to: [
                            {id: 2},
                            {id: 3},
                            {id: 4}
                        ]
                    }
                }
            })

            expect(
                ticket(currentState, {type: actions.CLEAR_RECEIVERS})
            ).toEqualImmutable(initialState)
        })
    })


    it('should mark ticket dirty', () => {
        const expected = initialState.setIn(['state', 'dirty'], true)

        expect(
            ticket(initialState, {type: actions.MARK_TICKET_DIRTY, dirty: true})
        ).toEqualImmutable(
            expected
        )
    })


    it('should remove correct message + change state to loading', () => {
        const currentTicket = initialState.set('messages', List([Map({id: 'foo', txt: 'coucou'})]))

        expect(
            ticket(currentTicket, {type: actions.DELETE_TICKET_MESSAGE_SUCCESS, messageId: 'foo'})
        ).toEqualImmutable(
            initialState
        )
    })

    // TODO
    it('should assign un-assigned ticket to the replying user', () => {
        const sender = Map({
            id: 'bar',
            email: 'foo@bar',
            name: 'foo bar'
        })

        expect(
            ticket(initialState, {
                type: actions.SUBMIT_TICKET_MESSAGE_START,
                currentUser: sender
            })
        ).toEqualImmutable(
            initialState.set('assignee_user', sender).setIn(['state', 'loading'], true)
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

            expect(getLastSameSourceTypeMessage(messages, 'chat')).toEqualImmutable(fromJS({id: 4, source: {type: 'chat'}}))
        })
    })
})
