//@flow
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import {EditorState, ContentState} from 'draft-js'

import {TicketMessageSourceTypes} from '../../../business/ticket'
import addMention from '../../../pages/common/draftjs/plugins/mentions/modifiers/addMention'
import reducer, {makeNewMessage, initialState} from '../reducers'
import * as types from '../constants'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')
//$FlowFixMe
jest.addMatchers(immutableMatchers)

describe('New message reducers', () => {
    it('should return the initial state', () => {
        expect(
            reducer(undefined, {})
        //$FlowFixMe
        ).toEqualImmutable(
            initialState
        )
    })

    it('should return new state with attachment loading to true', () => {
        const expected = initialState.setIn(['_internal', 'loading', 'addAttachment'], true)

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_ADD_ATTACHMENT_START})
        //$FlowFixMe
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
        //$FlowFixMe
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
        //$FlowFixMe
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
        //$FlowFixMe
        ).toEqualImmutable(
            expected
        )
    })

    it('should return same state if state.id is undefined or different from response', () => {
        const currentTicket = initialState.mergeDeep({id: 'toto', state: {forceUpdate: false}})
        expect(
            reducer(currentTicket, {type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS, resp: {id: 'fake'}})
        //$FlowFixMe
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
                    forceUpdate: false,
                }
            })

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS, resp: {}, resetMessage: false})
        //$FlowFixMe
        ).toEqualImmutable(
            expected
        )
    })

    it('should return newState with a reset message', () => {
        const expected = initialState
            .mergeDeep({
                state: {
                    dirty: false,
                    forceUpdate: false
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
        //$FlowFixMe
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
        //$FlowFixMe
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
        //$FlowFixMe
        ).toEqualImmutable(
            expected
        )
    })

    describe('NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START action', () => {
        it('should set firstNewMessage to false after posting a message', () => {
            expect(
                reducer(initialState, {
                    type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                    message: {channel: 'email'}
                }).getIn(['state', 'firstNewMessage'])
            ).toEqual(false)
        })

        it('should compute the new source and channel', () => {
            const action = {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                resetMessage: true,
                message: {
                    channel: 'email'
                },
                messages: [{
                    source: {
                        type: TicketMessageSourceTypes.FACEBOOK_MESSENGER
                    }
                }]
            }
            const newState = reducer(initialState, action)
            expect(newState.getIn(['newMessage', 'source', 'type'])).toEqual(TicketMessageSourceTypes.FACEBOOK_MESSENGER)
            expect(newState.getIn(['newMessage', 'channel'])).toEqual(TicketMessageSourceTypes.FACEBOOK_MESSENGER)
        })
    })

    describe('SET_RESPONSE_TEXT action', () => {
        it('should attach ids of any agent mentioned if in internal-note mode', () => {
            const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob'))
            const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

            expect(
                reducer(initialState.mergeDeep({
                    newMessage: {
                        source: {
                            type: 'internal-note'
                        }
                    },
                }), {
                    type: types.SET_RESPONSE_TEXT,
                    args: fromJS({contentState: newEditorState.getCurrentContent()})
                }).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([8]))
        })

        it('should not attach any ids if not in private-mode', () => {
            const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob'))
            const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

            expect(
                reducer(initialState.mergeDeep({
                    newMessage: {
                        source: {
                            type: 'facebook-message'
                        }
                    },
                }), {
                    type: types.SET_RESPONSE_TEXT,
                    args: fromJS({contentState: newEditorState.getCurrentContent()})
                }).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([]))
        })

        it('should not attach duplicate ids', () => {
            const editorState = EditorState.push(EditorState.createEmpty(), ContentState.createFromText('@Bob @Bob'))
            const newEditorState = addMention(editorState, fromJS({name: 'Bob', id: 8}), '@', '@', 'SEGMENTED')

            expect(
                reducer(initialState.mergeDeep({
                    newMessage: {
                        source: {
                            type: 'internal-note'
                        }
                    },
                }), {
                    type: types.SET_RESPONSE_TEXT,
                    args: fromJS({contentState: newEditorState.getCurrentContent()})
                }).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([8]))
        })

        it('should not add signature to email', () => {
            const action = {
                type: types.SET_RESPONSE_TEXT,
                state: initialState,
                args: fromJS({
                    contentState: ContentState.createFromText('Hello')
                }),
            }

            expect(reducer(
                initialState.mergeDeep({
                    newMessage: {
                        source: {
                            type: 'email'
                        }
                    },
                }),
                action
            ).getIn(['state', 'contentState']).getPlainText()).toEqual('Hello')
        })
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
            //$FlowFixMe
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
        //$FlowFixMe
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

    describe('ADD_ATTACHMENTS action', () => {
        it('should add attachments to newMessage', () => {
            const attachments = fromJS([
                {
                    content_type: 'image/jpeg',
                    name: 'batman.jpg',
                    size: '2563',
                    url: 'https://uploads.gorgias.io/Zr1WE86rb6J4Mvgl/batman-b40a130a-5546-417a-b8bc-44a0aa59d7ba.jpg'
                }
            ])
            const action = {
                type: types.ADD_ATTACHMENTS,
                args: fromJS({attachments})
            }

            expect(
                reducer(initialState, action)
            //$FlowFixMe
            ).toEqualImmutable(
                initialState.setIn(['newMessage', 'attachments'], attachments)
            )
        })
    })

    describe('NEW_MESSAGE_RESET_FROM_TICKET action', () => {
        const ticket = fromJS({
            events: [],
            messages: [
                {channel: 'email'}
            ],
            subject: '',
            via: 'helpdesk',
            channel: 'email',
            assignee_user: null,
            status: 'open',
            spam: false,
            sender: null,
            customer: null,
            receiver: null,
            priority: 'normal',
            tags: [],
            trashed_datetime: null
        })

        it('should not change existing message source type', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.setIn(['newMessage', 'source', 'type'], 'internal-note')

            expect(
                reducer(state, action).getIn(['newMessage', 'source', 'type'])
            ).toEqual(
                'internal-note'
            )
        })

        it('should not make internal-note public', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.mergeDeep({
                newMessage: {
                    source: {type: 'internal-note'},
                    public: false
                }
            })

            expect(
                reducer(state, action)
            //$FlowFixMe
            ).toEqualImmutable(
                initialState.mergeDeep({
                    newMessage: {
                        source: {type: 'internal-note'},
                        public: false
                    }
                })
            )
        })

        it('should make email public', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.mergeDeep({
                newMessage: {public: false}
            })

            expect(
                reducer(state, action)
            //$FlowFixMe
            ).toEqualImmutable(
                initialState.mergeDeep({
                    newMessage: {
                        source: {type: 'email'},
                        public: true
                    }
                })
            )
        })

        it('should reset the state from a message', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_MESSAGE,
                payload: {
                    contentState: ContentState.createFromText('foobar'),
                    newMessage: {
                        attachments: [],
                        body_html: '<div>foobar</div>',
                        body_text: 'foobar',
                        channel: 'email',
                        from_agent: true,
                        macros: [],
                        mention_ids: [],
                        public: true,
                        sender: fromJS({}),
                        source: {},
                        subject: 'foo',
                        via: 'helpdesk',
                    },
                },
            }

            expect(reducer(initialState, action).toJS()).toMatchSnapshot()
        })
    })
})
