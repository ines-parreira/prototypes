import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'
import {EditorState, ContentState, SelectionState} from 'draft-js'

import {
    TicketMessageSourceType,
    TicketChannel,
} from '../../../business/types/ticket'
import addMention from '../../../pages/common/draftjs/plugins/mentions/modifiers/addMention.js'
import reducer, {makeNewMessage, initialState} from '../reducers'
import * as types from '../constants'
import {GorgiasAction} from '../../types'
import * as responseUtils from '../responseUtils'
import * as emailExtraUtils from '../emailExtraUtils'
import {ticket} from '../../../fixtures/ticket'
import {newMessageResetFromMessage} from '../actions'
import {NewMessage, ReplyAreaState} from '../types'

import {getMessageContextSnapshot} from './testUtils'

const {addEmailExtraContent} = emailExtraUtils

jest.addMatchers(immutableMatchers)

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

describe('new message reducer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return the initial state', () => {
        expect(reducer(undefined, {} as GorgiasAction)).toEqualImmutable(
            initialState
        )
    })

    it('should return new state with attachment loading to true', () => {
        const expected = initialState.setIn(
            ['_internal', 'loading', 'addAttachment'],
            true
        )

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_ADD_ATTACHMENT_START,
            })
        ).toEqualImmutable(expected)
    })

    it('should merge correctly newMessage and state dirty', () => {
        const expected = initialState
            .mergeDeep({
                newMessage: {
                    attachments: (initialState.getIn([
                        'newMessage',
                        'attachments',
                    ]) as List<any>).concat(['resp']),
                },
                state: {
                    dirty: true,
                },
            })
            .setIn(['_internal', 'loading', 'addAttachment'], false)

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                resp: ['resp'],
            })
        ).toEqualImmutable(expected)
    })

    it('should return state with dirty state and delete corect index attachments', () => {
        const fakeAttachments = initialState.mergeDeep({
            newMessage: {
                attachments: (initialState.getIn([
                    'newMessage',
                    'attachments',
                ]) as List<any>).concat(['test1', 'test2']),
            },
        })

        const expected = fakeAttachments
            .setIn(
                ['newMessage', 'attachments'],
                (fakeAttachments.getIn(['newMessage', 'attachments']) as List<
                    any
                >).delete(0)
            )
            .setIn(['state', 'dirty'], true)

        expect(
            reducer(fakeAttachments, {
                type: types.NEW_MESSAGE_DELETE_ATTACHMENT,
                index: 0,
            })
        ).toEqualImmutable(expected)
    })

    it('should return state with new macro id', () => {
        const expected = initialState.setIn(
            ['newMessage', 'macros'],
            (initialState.getIn(['newMessage', 'macros']) as List<any>).push(
                fromJS({
                    id: '666',
                })
            )
        )

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_RECORD_MACRO,
                macro: fromJS({id: '666'}),
            })
        ).toEqual(expected)
    })

    it('should return state without adding a duplicated macro id', () => {
        const expected = initialState.setIn(
            ['newMessage', 'macros'],
            (initialState.getIn(['newMessage', 'macros']) as List<any>).push(
                fromJS({
                    id: '666',
                })
            )
        )

        expect(
            reducer(expected, {
                type: types.NEW_MESSAGE_RECORD_MACRO,
                macro: fromJS({id: '666'}),
            })
        ).toEqual(expected)
    })

    it('should return loading state equal false', () => {
        const expected = initialState.setIn(
            ['_internal', 'loading', 'submitMessage'],
            false
        )

        expect(
            reducer(initialState, {type: types.NEW_MESSAGE_SUBMIT_TICKET_ERROR})
        ).toEqualImmutable(expected)
    })

    it('should return same state if state.id is undefined or different from response', () => {
        const currentTicket = initialState.mergeDeep({
            id: 'toto',
            state: {forceUpdate: false},
        })
        expect(
            reducer(currentTicket, {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                resp: {id: 'fake'},
            })
        ).toEqualImmutable(currentTicket)
    })

    it('should return newState ticket is resetMessage is false', () => {
        const expected = initialState.merge(fromJS({})).mergeDeep({
            state: {
                dirty: false,
                forceUpdate: false,
            },
        })

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                resp: {},
                resetMessage: false,
            })
        ).toEqualImmutable(expected)
    })

    it('should return newState with a reset message', () => {
        const expected = initialState.mergeDeep({
            state: {
                dirty: false,
                forceUpdate: false,
            },
        })

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_SUCCESS,
                resp: {
                    channel: 'email',
                    messages: [
                        makeNewMessage(
                            TicketChannel.Email,
                            TicketMessageSourceType.Email
                        ),
                    ],
                },
                resetMessage: true,
            })
        ).toEqualImmutable(expected)
    })

    it('should set source facebook', () => {
        const expected = initialState
            .setIn(['newMessage', 'channel'], 'facebook')
            .setIn(['newMessage', 'source', 'type'], 'facebook')
            .setIn(['newMessage', 'public'], true)

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SET_SOURCE_TYPE,
                sourceType: TicketMessageSourceType.Facebook,
            })
        ).toEqualImmutable(expected)
    })

    it('should set source internal-note', () => {
        const expected = initialState.mergeDeep({
            newMessage: {
                source: {
                    type: 'internal-note',
                },
                public: false,
            },
        })

        expect(
            reducer(initialState, {
                type: types.NEW_MESSAGE_SET_SOURCE_TYPE,
                sourceType: TicketMessageSourceType.InternalNote,
                messages: fromJS([
                    (initialState.get('newMessage') as Map<any, any>).setIn(
                        ['source', 'type'],
                        'email'
                    ),
                ]),
            })
        ).toEqualImmutable(expected)
    })

    describe('NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START action', () => {
        it('should set firstNewMessage to false after posting a message', () => {
            expect(
                reducer(initialState, {
                    type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                    message: {channel: 'email'} as any,
                }).getIn(['state', 'firstNewMessage'])
            ).toEqual(false)
        })

        it('should compute the new source and channel', () => {
            const action = {
                type: types.NEW_MESSAGE_SUBMIT_TICKET_MESSAGE_START,
                resetMessage: true,
                message: {
                    channel: 'email',
                },
                messages: [
                    {
                        source: {
                            type: TicketMessageSourceType.FacebookMessenger,
                        },
                    },
                ],
            }
            const newState = reducer(
                initialState,
                (action as unknown) as GorgiasAction
            )
            expect(newState.getIn(['newMessage', 'source', 'type'])).toEqual(
                TicketMessageSourceType.FacebookMessenger
            )
            expect(newState.getIn(['newMessage', 'channel'])).toEqual(
                TicketMessageSourceType.FacebookMessenger
            )
        })
    })

    describe('SET_RESPONSE_TEXT action', () => {
        let addCacheSpy: jest.SpyInstance
        let updateEmailExtraOnUserInputSpy: jest.SpyInstance

        beforeEach(() => {
            addCacheSpy = jest.spyOn(responseUtils, 'addCache')
            updateEmailExtraOnUserInputSpy = jest.spyOn(
                emailExtraUtils,
                'updateEmailExtraOnUserInput'
            )
        })

        afterEach(() => {
            addCacheSpy.mockRestore()
            updateEmailExtraOnUserInputSpy.mockRestore()
        })

        it('should attach ids of any agent mentioned if in internal-note mode', () => {
            //@ts-ignore
            const editorState = EditorState.push(
                EditorState.createEmpty(),
                ContentState.createFromText('@Bob')
            )
            const newEditorState = addMention(
                editorState,
                fromJS({name: 'Bob', id: 8}),
                '@',
                '@',
                'SEGMENTED'
            )

            expect(
                reducer(
                    initialState.mergeDeep({
                        newMessage: {
                            source: {
                                type: 'internal-note',
                            },
                        },
                    }),
                    {
                        type: types.SET_RESPONSE_TEXT,
                        args: fromJS({
                            contentState: newEditorState.getCurrentContent(),
                        }),
                    }
                ).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([8]))
        })

        it('should not attach any ids if not in private-mode', () => {
            //@ts-ignore
            const editorState = EditorState.push(
                EditorState.createEmpty(),
                ContentState.createFromText('@Bob')
            )
            const newEditorState = addMention(
                editorState,
                fromJS({name: 'Bob', id: 8}),
                '@',
                '@',
                'SEGMENTED'
            )

            expect(
                reducer(
                    initialState.mergeDeep({
                        newMessage: {
                            source: {
                                type: 'facebook-message',
                            },
                        },
                    }),
                    {
                        type: types.SET_RESPONSE_TEXT,
                        args: fromJS({
                            contentState: newEditorState.getCurrentContent(),
                        }),
                    }
                ).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([]))
        })

        it('should not attach duplicate ids', () => {
            //@ts-ignore
            const editorState = EditorState.push(
                EditorState.createEmpty(),
                ContentState.createFromText('@Bob @Bob')
            )
            const newEditorState = addMention(
                editorState,
                fromJS({name: 'Bob', id: 8}),
                '@',
                '@',
                'SEGMENTED'
            )

            expect(
                reducer(
                    initialState.mergeDeep({
                        newMessage: {
                            source: {
                                type: 'internal-note',
                            },
                        },
                    }),
                    {
                        type: types.SET_RESPONSE_TEXT,
                        args: fromJS({
                            contentState: newEditorState.getCurrentContent(),
                        }),
                    }
                ).getIn(['newMessage', 'mention_ids'])
            ).toEqual(fromJS([8]))
        })

        it('should not add signature to email', () => {
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    contentState: ContentState.createFromText('Hello'),
                }),
            }

            expect(
                (reducer(
                    initialState.mergeDeep({
                        newMessage: {
                            source: {
                                type: 'email',
                            },
                        },
                    }),
                    action
                ).getIn([
                    'state',
                    'contentState',
                ]) as ContentState).getPlainText()
            ).toEqual('Hello')
        })

        it('should add cache', () => {
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    contentState: ContentState.createFromText('Hello'),
                }),
            }
            reducer(initialState, action)
            expect(addCacheSpy).toHaveBeenCalledTimes(1)
            const context = (addCacheSpy.mock.calls[0] as [
                responseUtils.MessageContext
            ])[0]
            expect(getMessageContextSnapshot(context)).toMatchSnapshot()
        })

        it('should restore emailExtraAdded from context', () => {
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    contentState: ContentState.createFromText('Hello'),
                }),
            }
            addCacheSpy.mockImplementation(
                (context: responseUtils.MessageContext) => {
                    return {
                        ...context,
                        emailExtraAdded: false,
                    }
                }
            )
            expect(
                reducer(
                    initialState.setIn(['state', 'emailExtraAdded'], false),
                    action
                )
            ).toMatchSnapshot()
        })

        it('should set emailExtraAdded from args', () => {
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    emailExtraAdded: false,
                }),
            }
            expect(
                reducer(
                    initialState.setIn(['state', 'emailExtraAdded'], true),
                    action
                )
            ).toMatchSnapshot()
        })

        it('should update content state when email extra data was updated', () => {
            const contentStateWithoutEmailExtra = ContentState.createFromText(
                ''
            )
            const contentState = addEmailExtraContent(
                contentStateWithoutEmailExtra,
                {
                    isForwarded: false,
                    replyThreadMessages: [],
                    signature: fromJS({text: 'Signature', html: 'Signature'}),
                    ticket,
                }
            )
            updateEmailExtraOnUserInputSpy.mockImplementation(() => {
                return contentStateWithoutEmailExtra
            })
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    contentState,
                }),
            }

            expect(
                reducer(
                    initialState.setIn(['state', 'contentState'], contentState),
                    action
                )
            ).toMatchSnapshot()
        })

        it('should return remove stripped_text and stripped_html if email extra was removed from the content state', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo bar baz'),
                {
                    isForwarded: false,
                    replyThreadMessages: [],
                    signature: fromJS({text: 'Signature', html: 'Signature'}),
                    ticket,
                }
            )
            const action = {
                type: types.SET_RESPONSE_TEXT,
                args: fromJS({
                    contentState: emailExtraUtils.deleteEmailExtraContent(
                        contentState
                    ),
                }),
            }
            expect(
                reducer(
                    initialState
                        .setIn(['state', 'contentState'], contentState)
                        .setIn(['newMessage', 'stripped_text'], 'stripped text')
                        .setIn(
                            ['newMessage', 'stripped_html'],
                            'stripped body'
                        ),
                    action
                )
            ).toMatchSnapshot()
        })
    })

    describe('NEW_MESSAGE_SET_RECEIVERS action', () => {
        it('should set receivers', () => {
            const receiver = {
                id: 3,
                name: 'Dark Vador',
                address: 'dark.vador@gmail.com',
            }

            const expectedReceiver = fromJS(receiver)

            const expected = initialState.mergeDeep({
                newMessage: {
                    source: {
                        to: fromJS([expectedReceiver]),
                    },
                },
            })

            expect(
                reducer(initialState, {
                    type: types.NEW_MESSAGE_SET_RECEIVERS,
                    receivers: {
                        to: [receiver],
                    } as any,
                })
            ).toEqualImmutable(expected)
        })
    })

    it('should handle NEW_MESSAGE_SET_SENDER', () => {
        const action = {
            type: types.NEW_MESSAGE_SET_SENDER,
            sender: fromJS({
                name: 'Acme Support',
                address: 'support@acme.com',
            }),
        }
        expect(reducer(initialState, action)).toEqualImmutable(
            initialState.setIn(['newMessage', 'source', 'from'], action.sender)
        )
    })

    it('should handle NEW_MESSAGE_SET_SUBJECT', () => {
        const action = {
            type: types.NEW_MESSAGE_SET_SUBJECT,
            subject: 'Hello World!',
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
                    url:
                        'https://uploads.gorgias.io/Zr1WE86rb6J4Mvgl/batman-b40a130a-5546-417a-b8bc-44a0aa59d7ba.jpg',
                },
            ])
            const action = {
                type: types.ADD_ATTACHMENTS,
                args: fromJS({attachments}),
            }

            expect(reducer(initialState, action)).toEqualImmutable(
                initialState.setIn(['newMessage', 'attachments'], attachments)
            )
        })
    })

    describe('NEW_MESSAGE_RESET_FROM_TICKET action', () => {
        const ticket = fromJS({
            events: [],
            messages: [{channel: 'email'}],
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
            trashed_datetime: null,
        })

        it('should not change existing message source type', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.setIn(
                ['newMessage', 'source', 'type'],
                'internal-note'
            )

            expect(
                reducer(state, action).getIn(['newMessage', 'source', 'type'])
            ).toEqual('internal-note')
        })

        it('should not make internal-note public', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.mergeDeep({
                newMessage: {
                    source: {type: 'internal-note'},
                    public: false,
                },
            })

            expect(reducer(state, action)).toEqualImmutable(
                initialState.mergeDeep({
                    newMessage: {
                        source: {type: 'internal-note'},
                        public: false,
                    },
                })
            )
        })

        it('should make email public', () => {
            const action = {
                type: types.NEW_MESSAGE_RESET_FROM_TICKET,
                ticket,
            }

            const state = initialState.mergeDeep({
                newMessage: {public: false},
            })

            expect(reducer(state, action)).toEqualImmutable(
                initialState.mergeDeep({
                    newMessage: {
                        source: {type: 'email'},
                        public: true,
                    },
                })
            )
        })
    })

    describe('NEW_MESSAGE_RESET_FROM_MESSAGE', () => {
        const createNewMessage = (contentState: ContentState): NewMessage => {
            return responseUtils.updateNewMessageWithContentState(
                {
                    body_text: '',
                    body_html: '',
                    attachments: [],
                    actions: fromJS([]),
                    channel: TicketChannel.Email,
                    macros: [],
                    public: true,
                    sender: fromJS({}),
                    source: {
                        type: TicketMessageSourceType.Email,
                        extra: {},
                    },
                },
                contentState
            )
        }
        const createReplyAreaState = (
            contentState: ContentState
        ): ReplyAreaState => {
            return {
                contentState,
                selectionState: SelectionState.createEmpty(
                    contentState.getFirstBlock().getKey()
                ),
                forceFocus: false,
                forceUpdate: false,
                firstNewMessage: false,
                appliedMacro: null,
                emailExtraAdded: true,
                dirty: true,
                cacheAdded: true,
            }
        }

        it('should reset the state from a message', () => {
            const contentState = ContentState.createFromText('foobar')
            const action = newMessageResetFromMessage({
                newMessage: createNewMessage(contentState),
                replyAreaState: createReplyAreaState(contentState),
            })

            expect(reducer(initialState, action).toJS()).toMatchSnapshot()
        })

        it('should remove email extra from the content', () => {
            const contentState = addEmailExtraContent(
                ContentState.createFromText('Foo'),
                {
                    signature: fromJS({text: 'Signature'}),
                    replyThreadMessages: [],
                    isForwarded: false,
                    ticket: ticket,
                }
            )
            const action = newMessageResetFromMessage({
                newMessage: createNewMessage(contentState),
                replyAreaState: createReplyAreaState(contentState),
            })

            expect(reducer(initialState, action).toJS()).toMatchSnapshot()
        })
    })

    describe('NEW_MESSAGE_SET_SOURCE_EXTRA', () => {
        it('should set source extra', () => {
            const action = {
                type: types.NEW_MESSAGE_SET_SOURCE_EXTRA,
                extra: {
                    foo: 'bar',
                },
            }
            expect(
                (reducer(initialState, action).getIn([
                    'newMessage',
                    'source',
                    'extra',
                ]) as Map<any, any>).toJS()
            ).toMatchSnapshot()
        })
    })
})
