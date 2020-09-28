import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ContentState} from 'draft-js'
import {fromJS, Map} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {TicketMessageSourceType} from '../../../business/types/ticket'
import * as utils from '../../../utils'
import * as actions from '../actions'
import * as types from '../constants'
import {initialState} from '../reducers'
import {initialState as ticketInitialState} from '../../ticket/reducers'
import {StoreDispatch, RootState} from '../../types'

import {integrationsState} from '../../../fixtures/integrations.js'
import * as integrationSelectors from '../../integrations/selectors'
import {getLastSenderChannel, getPreferredChannel} from '../../ticket/utils.js'
import {
    smoochTicket,
    emailTicket,
    instagramMedia,
} from '../../ticket/tests/fixtures.js'
import socketManager from '../../../services/socketManager/socketManager'
import {Integration} from '../../../models/integration/types'

type MockedRootState = {
    agents?: Map<any, any>
    integrations?: Map<any, any>
    ticket?: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
}

//$TsFixMe remove casting once ticket/fixtures is migrated
const typeSafeSmoochTicket = smoochTicket as Map<any, any>
const typeSafeEmailTicket = emailTicket as Map<any, any>
const typeSafeInstagramMedia = instagramMedia as Map<any, any>

//$TsFixMe remove casting once ticket/reducers is migrated
const typeSafeTicketInitialState = ticketInitialState as Map<any, any>

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)
const mockedUploadFiles = jest.spyOn(utils, 'uploadFiles')

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

jest.mock('../../../services/socketManager/socketManager', () => {
    return {
        join: jest.fn(),
        leave: jest.fn(),
        send: jest.fn(),
    }
})

describe('actions', () => {
    let mockServer: MockAdapter
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>

    beforeEach(() => {
        mockServer = new MockAdapter(axios)
    })

    describe('new message', () => {
        const channels = integrationSelectors.getChannels({
            integrations: fromJS(integrationsState),
        } as RootState)

        describe('setSender action', () => {
            it('with address', () => {
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: emailTicket,
                    newMessage: initialState,
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toMatchSnapshot()
            })

            it('`from` field from last message from agent (chat, messenger)', () => {
                const from = typeSafeSmoochTicket.getIn([
                    'messages',
                    1,
                    'source',
                    'from',
                ]) as Map<any, any>
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: typeSafeSmoochTicket,
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
                const _smoochTicket = typeSafeSmoochTicket.deleteIn([
                    'messages',
                    1,
                ]) // delete last message from agent
                const from = _smoochTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ]) as Map<any, any>
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore({
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
                const _emailTicket = typeSafeEmailTicket.set(
                    'messages',
                    fromJS([])
                )
                const preferred = getPreferredChannel('email', channels) as Map<
                    any,
                    any
                >
                const expectedSender = fromJS({
                    name: preferred.get('name'),
                    address: preferred.get('address'),
                }) as Map<any, any>
                store = mockStore({
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
                const from = typeSafeEmailTicket.getIn([
                    'messages',
                    1,
                    'source',
                    'from',
                ]) as Map<any, any>
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                }) as Map<any, any>
                store = mockStore({
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
                const _emailTicket = typeSafeEmailTicket.deleteIn([
                    'messages',
                    1,
                ])
                const from = _emailTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    1,
                ]) as Map<any, any>
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore({
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
                const _emailTicket = typeSafeEmailTicket
                    .deleteIn(['messages', 1])
                    .updateIn(
                        ['messages', 0, 'source'],
                        (source: Map<any, any>) => {
                            return source
                                .set('cc', source.get('to'))
                                .set('to', fromJS([]))
                        }
                    )
                const from = _emailTicket.getIn([
                    'messages',
                    0,
                    'source',
                    'cc',
                    1,
                ]) as Map<any, any>
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore({
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
                const _emailTicket = typeSafeEmailTicket.deleteIn([
                    'messages',
                    1,
                ])
                const from = getPreferredChannel('email', channels) as Map<
                    any,
                    any
                >
                const expectedSender = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })
                store = mockStore({
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
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: typeSafeEmailTicket,
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
                const unverifiedChannel = (integrationsState as {
                    integrations: Integration[]
                }).integrations.find(
                    (integration) => integration.meta.verified === false
                ) as Integration

                const _emailTicket = typeSafeEmailTicket
                    .deleteIn(['messages', 1]) // delete last message from agent
                    .setIn(
                        ['messages', 0, 'source', 'to', 0],
                        fromJS({
                            name: unverifiedChannel.name,
                            address: ((unverifiedChannel as unknown) as {
                                address: unknown
                            }).address,
                        })
                    )

                store = mockStore({
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

                const setSenderAction = storeActions[0] as Record<
                    string,
                    unknown
                >
                const sender = setSenderAction.sender as Map<any, any>
                //$TsFixMe remove casting once fixtures/integrations is migrated
                const senderChannel = (integrationsState as {
                    integrations: Integration[]
                }).integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address')
                )

                expect(senderChannel?.meta.verified).toBe(true)
                expect(senderChannel?.meta.address).not.toEqual(
                    ((unverifiedChannel as unknown) as {address: unknown})
                        .address
                )
            })

            it('should use any verified channel if there is no matching channel', () => {
                const unexistingChannel = {
                    name: 'an integration which does not exist',
                    address: 'notexist@gorgi.us',
                }
                const _emailTicket = typeSafeEmailTicket
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

                store = mockStore({
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

                const setSenderAction = storeActions[0] as Record<
                    string,
                    unknown
                >
                const sender = setSenderAction.sender as Map<any, any>
                //$TsFixMe remove casting once fixtures/integrations is migrated
                const senderChannel = (integrationsState as {
                    integrations: Integration[]
                }).integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address')
                )

                expect(senderChannel?.meta.verified).toBe(true)
                expect(senderChannel?.meta.address).not.toEqual(
                    unexistingChannel.address
                )
            })

            it('should persist the sender channel in the localStorage', () => {
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: typeSafeEmailTicket,
                    newMessage: initialState,
                })
                expect(getLastSenderChannel()).toBe(null)
                store.dispatch(actions.setSender())

                // it should still be null because we didn't specify a sender param
                expect(getLastSenderChannel()).toBe(null)

                const from = getPreferredChannel('email', channels) as Map<
                    any,
                    any
                >
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
                    store = mockStore({
                        ticket: typeSafeEmailTicket,
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward)
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should set all attachments of the ticket as attachment of the newMessage', () => {
                    const attachments = fromJS([{url: 'foo'}, {url: 'bar'}])
                    const attachments2 = fromJS([{url: 'baz'}, {url: 'far'}])

                    store = mockStore({
                        ticket: typeSafeEmailTicket
                            .setIn(['messages', 0, 'attachments'], attachments)
                            .setIn(
                                ['messages', 1, 'attachments'],
                                attachments2
                            ),
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward)
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should not set an attachment in the newMessage if it is already there', () => {
                    const attachments = fromJS([{url: 'foo'}, {url: 'bar'}])
                    const newMessageAttachments = fromJS([{url: 'foo'}])

                    store = mockStore({
                        ticket: typeSafeEmailTicket.setIn(
                            ['messages', 0, 'attachments'],
                            attachments
                        ),
                        newMessage: initialState.setIn(
                            ['newMessage', 'attachments'],
                            newMessageAttachments
                        ),
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward)
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            describe('instagram comment', () => {
                it('should not add prefix if there is no receiver name', () => {
                    store = mockStore({
                        ticket: typeSafeInstagramMedia,
                        newMessage: initialState.setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment'
                        ),
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment
                        )
                    )

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

                    store = mockStore({
                        ticket: typeSafeInstagramMedia,
                        newMessage,
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment
                        )
                    )

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

                    store = mockStore({
                        ticket: typeSafeInstagramMedia,
                        newMessage,
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment
                        )
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            it('other types', () => {
                const sourceTypes = [
                    TicketMessageSourceType.Email,
                    TicketMessageSourceType.Chat,
                    TicketMessageSourceType.FacebookComment,
                    TicketMessageSourceType.FacebookMessage,
                ]

                sourceTypes.forEach((sourceType) => {
                    store = mockStore({
                        ticket: typeSafeEmailTicket,
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
                ;(socketManager.join as jest.Mock).mockReset()
                ;(socketManager.leave as jest.Mock).mockReset()
                ;(socketManager.send as jest.Mock).mockReset()
            })

            it('should always pass the args to the reducer', () => {
                store = mockStore({
                    ticket: typeSafeEmailTicket,
                    newMessage: initialState,
                })

                const contentState = ContentState.createFromText('foo')
                store.dispatch(actions.setResponseText(fromJS({contentState})))

                expect(store.getActions()).toMatchSnapshot()
            })

            it('should send typing event when the user is typing', () => {
                store = mockStore({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.Chat
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
                expect(
                    (socketManager.send as jest.Mock).mock.calls.length
                ).toBe(1)
            })

            it('should not send a typing event when the user is typing in an internal note', () => {
                store = mockStore({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.InternalNote
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
                expect(
                    (socketManager.send as jest.Mock).mock.calls.length
                ).toBe(0)
            })

            it('should not send a typing event when the reply area only contains a signature', () => {
                store = mockStore({
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
                expect(
                    (socketManager.send as jest.Mock).mock.calls.length
                ).toBe(0)
            })

            it('should send an end typing event on ticket when the user is not typing but is in the room', () => {
                store = mockStore({
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
                expect(
                    (socketManager.join as jest.Mock).mock.calls.length
                ).toBe(0)
                expect(
                    (socketManager.send as jest.Mock).mock.calls.length
                ).toBe(1)
            })

            it('should not send an end typing event when the user is not typing and not in ticket', () => {
                store = mockStore({
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
                expect(
                    (socketManager.send as jest.Mock).mock.calls.length
                ).toBe(0)
            })
        })

        describe('prepareTicketDataToSend()', () => {
            let data: Record<string, unknown> = {}

            beforeEach(() => {
                const contentState = ContentState.createFromText('Hi ')
                store = mockStore({
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
                        fromJS([]),
                        fromJS({})
                    ) as Record<string, unknown>
                })
            })

            it('should add plain text signature to message', () => {
                expect.assertions(1)
                if (!data) {
                    throw new Error('data should not be null or undefined')
                }
                // BUG because generateRandomKey is mocked newlines not added
                expect((data.newMessage as {body_text: string}).body_text).toBe(
                    'Hi cheers, Steve'
                )
            })

            it('should add html signature to message', () => {
                expect.assertions(1)
                if (!data) {
                    throw new Error('data should not be null or undefined')
                }
                // BUG because generateRandomKey is mocked <br>s are not added
                expect((data.newMessage as {body_html: string}).body_html).toBe(
                    '<div>Hi cheers, <strong>Steve</strong></div>'
                )
            })
        })

        describe('addSignature()', () => {
            it('should dispatch NEW_MESSAGE_ADD_SIGNATURE action', () => {
                store = mockStore({
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
                    ticket: typeSafeInstagramMedia.set('id', 12),
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

                return (
                    store
                        //@ts-ignore
                        .dispatch(actions.prepareTicketMessage())
                        .then(({messageToSend}) => {
                            expect(messageToSend).toMatchSnapshot()
                        })
                )
            })
        })

        describe('sendTicketMessage', () => {
            it('should submit new message', () => {
                mockServer
                    .onPost('/api/tickets/12/messages/')
                    .reply(201, {ticket_id: 12, messages: []})
                store = mockStore({
                    ticket: typeSafeTicketInitialState.set('id', 12),
                    newMessage: initialState,
                    currentUser: fromJS({
                        id: 1,
                        name: 'foo',
                    }),
                    integrations: fromJS(integrationsState),
                })

                return (
                    store
                        //@ts-ignore
                        .dispatch(actions.prepareTicketMessage())
                        .then(({messageId, messageToSend}) =>
                            //@ts-ignore
                            actions.sendTicketMessage(messageId, messageToSend)
                        )
                        .then(() => {
                            expect(store.getActions()).toMatchSnapshot()
                        })
                )
            })
        })

        describe('newMessageResetFromMessage', () => {
            it('should send the message data to reset the state', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                store.dispatch(
                    actions.newMessageResetFromMessage({
                        body_text: 'foo',
                    } as any)
                )
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('addAttachments()', () => {
            const createFile = (name: string, type: string): File => {
                const blob = (new Blob(['foo'], {
                    type: 'any',
                }) as unknown) as Record<string, unknown> & {
                    slice: (i: number, j: number, type: string) => File
                }
                blob.name = name
                return blob.slice(0, blob.size as number, type)
            }
            const fileFoo = createFile('foo', 'image/png')
            const fileBar = createFile('bar', 'video/mp4')
            const fileList = ({
                0: fileFoo,
            } as unknown) as FileList
            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve([]))
                store = mockStore({
                    newMessage: initialState,
                    ticket: typeSafeTicketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        fileList
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should not dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments in another ticket', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve([]))
                store = mockStore({
                    newMessage: initialState,
                    ticket: typeSafeTicketInitialState.set('id', 2),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        fileList
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
                store = mockStore({
                    newMessage: initialState,
                    ticket: typeSafeTicketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        fileList
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
                store = mockStore({
                    newMessage: initialState,
                    ticket: typeSafeTicketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        fileList
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
                mockedUploadFiles.mockReturnValue(Promise.resolve([]))
                store = mockStore({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.FacebookComment
                    ),
                    ticket: typeSafeTicketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        ({
                            0: fileBaz,
                        } as unknown) as FileList
                    )
                )

                expect(mockedUploadFiles).toHaveBeenNthCalledWith(1, fileList)
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR when adding more than 1 attachement in a facebook comment', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve([]))
                store = mockStore({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.FacebookComment
                    ),
                    ticket: typeSafeTicketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        typeSafeTicketInitialState.set('id', 1),
                        ({
                            0: fileFoo,
                            1: fileBar,
                        } as unknown) as FileList
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

    describe('updatePotentialCustomers', () => {
        it('should return a list of potential customer on success', () => {
            mockServer.onPost('/api/search/').reply(200, {
                data: [
                    {
                        id: 11,
                        address: 'marie@gorgias.io',
                        type: 'email',
                        user: {id: 4, name: 'Marie Curie'},
                        customer: {id: 4, name: 'Marie Curie'},
                    },
                ],
                object: 'list',
                uri: '',
                meta: {},
            })
            store = mockStore({})

            return store
                .dispatch(actions.updatePotentialCustomers('foo'))
                .then((res) => expect(res).toMatchSnapshot())
        })

        it('should resolve when cancelled', () => {
            mockServer.onPost('/api/search/').reply(200, {
                data: [
                    {
                        id: 11,
                        address: 'marie@gorgias.io',
                        type: 'email',
                        user: {id: 4, name: 'Marie Curie'},
                        customer: {id: 4, name: 'Marie Curie'},
                    },
                ],
                object: 'list',
                uri: '',
                meta: {},
            })
            store = mockStore({})
            const source = axios.CancelToken.source()
            source.cancel()

            return store
                .dispatch(actions.updatePotentialCustomers('foo', source.token))
                .then((res) => expect(res).toMatchSnapshot())
        })
    })
})
