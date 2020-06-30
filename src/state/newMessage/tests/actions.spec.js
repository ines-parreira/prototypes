//@flow
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ContentState} from 'draft-js'
import {fromJS} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {TicketMessageSourceTypes} from '../../../business/ticket'
import * as utils from '../../../utils'
import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'
import {initialState as ticketInitialState} from '../../ticket/reducers'
import type {StoreAction} from '../../types'

import {integrationsState} from '../../../fixtures/integrations'
import * as integrationSelectors from '../../integrations/selectors'
import {getLastSenderChannel, getPreferredChannel} from '../../ticket/utils'
import {
    smoochTicket,
    emailTicket,
    instagramMedia,
} from '../../ticket/tests/fixtures'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
const mockedUploadFiles = jest.spyOn(utils, 'uploadFiles')

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

jest.mock('../../../services/socketManager', () => {
    return {
        join: jest.fn(),
        leave: jest.fn(),
        send: jest.fn(),
    }
})

import socketManager from '../../../services/socketManager'

describe('actions', () => {
    describe('new message', () => {
        const channels = integrationSelectors.getChannels({
            integrations: fromJS(integrationsState),
        })
        let store

        describe('setSender action', () => {
            it('with address', () => {
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: emailTicket,
                    newMessage: initialState,
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toMatchSnapshot()
            })

            it('`from` field from last message from agent (chat, messenger)', () => {
                const from = smoochTicket.getIn([
                    'messages',
                    1,
                    'source',
                    'from',
                ])
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: smoochTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'chat'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('`to` field from last message from customer (chat, messenger)', () => {
                const _smoochTicket = smoochTicket.deleteIn(['messages', 1]) // delete last message from agent
                const from = _smoochTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _smoochTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'chat'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('preferred channel', () => {
                // remove messages, to simulate a new ticket
                const _emailTicket = emailTicket.set('messages', fromJS([]))
                const preferred = getPreferredChannel('email', channels)
                const expectedSender = fromJS({
                    name: preferred.get('name'),
                    address: preferred.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('`from` field from last message from agent', () => {
                const from = emailTicket.getIn([
                    'messages',
                    1,
                    'source',
                    'from',
                ])
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('`to` field from last message from customer (email found in `to`)', () => {
                // delete last message from agent
                const _emailTicket = emailTicket.deleteIn(['messages', 1])
                const from = _emailTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    1,
                ])
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('should return channel in `cc` field from last message from customer (email found in `cc`)', () => {
                // delete last message from agent
                // and move `To` addresses in `Cc` and remove `To` addresses
                const _emailTicket = emailTicket
                    .deleteIn(['messages', 1])
                    .updateIn(['messages', 0, 'source'], (source) => {
                        return source
                            .set('cc', source.get('to'))
                            .set('to', fromJS([]))
                    })
                const from = _emailTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'cc',
                    1,
                ])
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('preferred email (email not found in `to`)', () => {
                // remove address that can match
                const _emailTicket = emailTicket.deleteIn(['messages', 1])
                const from = getPreferredChannel('email', channels)
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: expectedSender,
                    },
                ])
            })

            it('empty name and address (internal-note)', () => {
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'internal-note'
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: fromJS({
                            name: '',
                            address: '',
                        }),
                    },
                ])
            })

            it('should reject any channel which is not verified and replace it with any verified channel', () => {
                const unverifiedChannel = integrationsState.integrations.find(
                    (integration) => integration.meta.verified === false
                )

                const _emailTicket = emailTicket
                    .deleteIn(['messages', 1]) // delete last message from agent
                    .setIn(
                        ['messages', 0, 'source', 'to', 0],
                        fromJS({
                            name: unverifiedChannel.name,
                            address: unverifiedChannel.address,
                        })
                    )

                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                const storeActions = store.getActions()

                expect(storeActions.length).toEqual(1)

                const setSenderAction = storeActions[0]
                const sender = setSenderAction.sender
                const senderChannel = integrationsState.integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address')
                )

                expect(senderChannel.meta.verified).toBe(true)
                expect(senderChannel.meta.address).not.toEqual(
                    unverifiedChannel.address
                )
            })

            it('should use any verified channel if there is no matching channel', () => {
                const unexistingChannel = {
                    name: 'an integration which does not exist',
                    address: 'notexist@gorgi.us',
                }
                const _emailTicket = emailTicket
                    .setIn(
                        ['messages', 0, 'source', 'to'],
                        fromJS([
                            {
                                name: unexistingChannel.name,
                                address: unexistingChannel.address,
                            },
                        ])
                    )
                    .setIn(
                        ['messages', 1, 'source', 'from'],
                        fromJS({
                            name: unexistingChannel.name,
                            address: unexistingChannel.address,
                        })
                    )

                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email'
                    ),
                })
                store.dispatch(actions.setSender())

                const storeActions = store.getActions()

                expect(storeActions.length).toEqual(1)

                const setSenderAction = storeActions[0]
                const sender = setSenderAction.sender
                const senderChannel = integrationsState.integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address')
                )

                expect(senderChannel.meta.verified).toBe(true)
                expect(senderChannel.meta.address).not.toEqual(
                    unexistingChannel.address
                )
            })

            it('should persist the sender channel in the localStorage', () => {
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    ticket: emailTicket,
                    newMessage: initialState,
                })
                expect(getLastSenderChannel()).toBe(null)
                store.dispatch(actions.setSender())

                // it should still be null because we didn't specify a sender param
                expect(getLastSenderChannel()).toBe(null)

                const from = getPreferredChannel('email', channels)
                const expectedChannel = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })

                store.dispatch(actions.setSender(expectedChannel))
                expect(getLastSenderChannel()).toEqual(expectedChannel)
            })
        })

        describe('setSubject()', () => {
            it('default value', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                store.dispatch(actions.setSubject())

                expect(store.getActions()).toMatchSnapshot()
            })

            it('given value', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                store.dispatch(actions.setSubject('hello world'))

                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('prepare()', () => {
            describe('email-forward', () => {
                it('should prepare an email forward', () => {
                    store = mockStore<*, StoreAction>({
                        ticket: emailTicket,
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(actions.prepare('email-forward'))

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should set all attachments of the ticket as attachment of the newMessage', () => {
                    const attachments = fromJS([{url: 'foo'}, {url: 'bar'}])
                    const attachments2 = fromJS([{url: 'baz'}, {url: 'far'}])

                    store = mockStore<*, StoreAction>({
                        ticket: emailTicket
                            .setIn(['messages', 0, 'attachments'], attachments)
                            .setIn(
                                ['messages', 1, 'attachments'],
                                attachments2
                            ),
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(actions.prepare('email-forward'))

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should not set an attachment in the newMessage if it is already there', () => {
                    const attachments = fromJS([{url: 'foo'}, {url: 'bar'}])
                    const newMessageAttachments = fromJS([{url: 'foo'}])

                    store = mockStore<*, StoreAction>({
                        ticket: emailTicket.setIn(
                            ['messages', 0, 'attachments'],
                            attachments
                        ),
                        newMessage: initialState.setIn(
                            ['newMessage', 'attachments'],
                            newMessageAttachments
                        ),
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(actions.prepare('email-forward'))

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            describe('instagram comment', () => {
                it('should not add prefix if there is no receiver name', () => {
                    store = mockStore<*, StoreAction>({
                        ticket: instagramMedia,
                        newMessage: initialState.setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment'
                        ),
                    })
                    store.dispatch(actions.prepare('instagram-comment'))

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should not add prefix if there is text already', () => {
                    let newMessage = initialState
                    newMessage = newMessage
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment'
                        )
                        .setIn(
                            ['newMessage', 'source', 'to'],
                            fromJS([{address: 'as6d5as', name: 'instauser'}])
                        )
                        .setIn(
                            ['state', 'contentState'],
                            ContentState.createFromText('foo')
                        )

                    store = mockStore<*, StoreAction>({
                        ticket: instagramMedia,
                        newMessage,
                    })
                    store.dispatch(actions.prepare('instagram-comment'))

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should add prefix', () => {
                    let newMessage = initialState
                    newMessage = newMessage
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment'
                        )
                        .setIn(
                            ['newMessage', 'source', 'to'],
                            fromJS([{address: 'as6d5as', name: 'instauser'}])
                        )

                    store = mockStore<*, StoreAction>({
                        ticket: instagramMedia,
                        newMessage,
                    })
                    store.dispatch(actions.prepare('instagram-comment'))

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            it('other types', () => {
                const sourceTypes = [
                    'email',
                    'chat',
                    'facebook-comment',
                    'facebook-message',
                ]

                sourceTypes.forEach((sourceType) => {
                    store = mockStore<*, StoreAction>({
                        ticket: emailTicket,
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(actions.prepare(sourceType))

                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })

        describe('setResponseText()', () => {
            beforeEach(() => {
                socketManager.join.mockReset()
                socketManager.leave.mockReset()
                socketManager.send.mockReset()
            })

            it('should always pass the args to the reducer', () => {
                store = mockStore<*, StoreAction>({
                    ticket: emailTicket,
                    newMessage: initialState,
                })

                const contentState = ContentState.createFromText('foo')
                store.dispatch(actions.setResponseText(fromJS({contentState})))

                expect(store.getActions()).toMatchSnapshot()
            })

            it('should send typing event when the user is typing', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceTypes.CHAT
                    ),
                    ticket: fromJS({id: 1}),
                    agents: fromJS({
                        all: [
                            {
                                id: 1,
                            },
                        ],
                    }),
                })

                store.dispatch(
                    actions.setResponseText(
                        fromJS({
                            contentState: ContentState.createFromText('foo'),
                        })
                    )
                )

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(1)
            })

            it('should not send a typing event when the user is typing in an internal note', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceTypes.INTERNAL_NOTE
                    ),
                    ticket: fromJS({id: 1}),
                })

                store.dispatch(
                    actions.setResponseText(
                        fromJS({
                            contentState: ContentState.createFromText('foo'),
                        })
                    )
                )

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })

            it('should not send a typing event when the reply area only contains a signature', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    agents: fromJS({
                        all: [
                            {
                                id: 1,
                            },
                        ],
                    }),
                })

                store.dispatch(
                    actions.setResponseText(
                        fromJS({
                            contentState: ContentState.createFromText(
                                '\n\nsignature'
                            ),
                        })
                    )
                )

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })

            it('should send an end typing event on ticket when the user is not typing but is in the room', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    agents: fromJS({
                        typingStatuses: {
                            '1': {
                                Ticket: [1],
                            },
                        },
                        all: [
                            {
                                id: 1,
                            },
                        ],
                    }),
                    currentUser: fromJS({
                        id: 1,
                    }),
                })

                store.dispatch(
                    actions.setResponseText(
                        fromJS({
                            contentState: ContentState.createFromText(''),
                        })
                    )
                )

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.join.mock.calls.length).toBe(0)
                expect(socketManager.send.mock.calls.length).toBe(1)
            })

            it('should not send an end typing event when the user is not typing and not in ticket', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: fromJS({id: 1}),
                    agents: fromJS({
                        typingStatuses: {},
                        all: [
                            {
                                id: 1,
                            },
                        ],
                    }),
                    currentUser: fromJS({
                        id: 1,
                    }),
                })

                store.dispatch(
                    actions.setResponseText(
                        fromJS({
                            contentState: ContentState.createFromText(''),
                        })
                    )
                )

                expect(store.getActions()).toMatchSnapshot()
                expect(socketManager.send.mock.calls.length).toBe(0)
            })
        })

        describe('prepareTicketDataToSend()', () => {
            let data: ?Object = {}

            beforeEach(() => {
                const contentState = ContentState.createFromText('Hi ')
                store = mockStore<*, StoreAction>({
                    integrations: fromJS(integrationsState),
                    newMessage: fromJS({
                        state: {contentState},
                        newMessage: {
                            source: {
                                type: 'email',
                                from: {
                                    address: 'support@acme.gorgias.io',
                                },
                            },
                        },
                    }),
                    currentUser: fromJS({
                        first_name: 'Steve',
                    }),
                    ticket: fromJS({
                        messages: [],
                        status: 'open',
                        channel: '',
                    }),
                })

                store.dispatch((dispatch, getState) => {
                    data = actions.prepareTicketDataToSend(
                        dispatch,
                        getState,
                        getState().ticket,
                        getState().newMessage,
                        '',
                        [],
                        fromJS({})
                    )
                })
            })

            it('should add plain text signature to message', () => {
                expect.assertions(1)
                if (!data) {
                    throw new Error('data should not be null or undefined')
                }
                // BUG because generateRandomKey is mocked newlines not added
                expect(data.newMessage.body_text).toBe('Hi cheers, Steve')
            })

            it('should add html signature to message', () => {
                expect.assertions(1)
                if (!data) {
                    throw new Error('data should not be null or undefined')
                }
                // BUG because generateRandomKey is mocked <br>s are not added
                expect(data.newMessage.body_html).toBe(
                    '<div>Hi cheers, <strong>Steve</strong></div>'
                )
            })
        })

        describe('addSignature()', () => {
            it('should dispatch NEW_MESSAGE_ADD_SIGNATURE action', () => {
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                })
                const contentState = ContentState.createFromText('foo')
                const signature = fromJS({
                    text: 'Cheers, Steve',
                    html: 'Cheers, <strong>Steve</strong>',
                })
                store.dispatch(actions.addSignature(contentState, signature))

                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('prepareTicketMessage', () => {
            it('should prepare next new message after we submitted an instagram comment', () => {
                store = mockStore({
                    ticket: instagramMedia.set('id', 12),
                    newMessage: initialState.setIn(
                        ['newMessage', 'source'],
                        fromJS({
                            type: 'instagram-comment',
                            to: [
                                {
                                    name: 'messagereceiver',
                                },
                            ],
                        })
                    ),
                    currentUser: fromJS({
                        id: 1,
                        name: 'foo',
                    }),
                    integrations: fromJS(integrationsState),
                })

                return store
                    .dispatch(actions.prepareTicketMessage())
                    .then(({messageToSend}) => {
                        expect(messageToSend).toMatchSnapshot()
                    })
            })
        })

        describe('sendTicketMessage', () => {
            let mockServer

            beforeEach(() => {
                mockServer = new MockAdapter(axios)
            })

            it('should submit new message', () => {
                mockServer
                    .onPost('/api/tickets/12/messages/')
                    .reply(201, {ticket_id: 12, messages: []})
                store = mockStore({
                    ticket: ticketInitialState.set('id', 12),
                    newMessage: initialState,
                    currentUser: fromJS({
                        id: 1,
                        name: 'foo',
                    }),
                    integrations: fromJS(integrationsState),
                })

                return store
                    .dispatch(actions.prepareTicketMessage())
                    .then(({messageId, messageToSend}) =>
                        actions.sendTicketMessage(messageId, messageToSend)
                    )
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                    })
            })
        })

        describe('newMessageResetFromMessage', () => {
            it('should send the message data to reset the state', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                store.dispatch(
                    actions.newMessageResetFromMessage({body_text: 'foo'})
                )
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('addAttachments()', () => {
            const createFile = (name: string, type: string): File => {
                const blob: any = new Blob(['foo'], {type: 'any'})
                blob.name = name
                return blob.slice(0, blob.size, type)
            }
            const fileFoo = createFile('foo', 'image/png')
            const fileBar = createFile('bar', 'video/mp4')
            const fileList: FileList = ({
                //$FlowFixMe
                0: fileFoo,
            }: any)
            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve())
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        (fileList: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should not dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments in another ticket', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve())
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 2),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        (fileList: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR when failing to add attachment', (done) => {
                mockedUploadFiles.mockReturnValue(
                    Promise.reject({
                        response: {},
                    })
                )
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        (fileList: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR with a reason  when error code is 413', (done) => {
                mockedUploadFiles.mockReturnValue(
                    Promise.reject({
                        response: {
                            status: 413,
                        },
                    })
                )
                store = mockStore<*, StoreAction>({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        (fileList: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR when source is facebook comment and file has wrong type', (done) => {
                const fileBaz = createFile('baz', 'baz')
                mockedUploadFiles.mockReturnValue(Promise.resolve())
                store = mockStore<*, StoreAction>({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceTypes.FACEBOOK_COMMENT
                    ),
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        ({
                            //$FlowFixMe
                            0: fileBaz,
                        }: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR when adding more than 1 attachement in a facebook comment', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve())
                store = mockStore<*, StoreAction>({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceTypes.FACEBOOK_COMMENT
                    ),
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        ({
                            //$FlowFixMe
                            0: fileFoo,
                            //$FlowFixMe
                            1: fileBar,
                        }: any)
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })
        })
    })
})
