import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ContentState} from 'draft-js'
import {fromJS, Map} from 'immutable'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import * as utils from 'utils'
import * as actions from 'state/newMessage/actions'
import * as types from 'state/newMessage/constants'
import {initialState, makeNewMessage} from 'state/newMessage/reducers'
import {initialState as ticketInitialState} from 'state/ticket/reducers'
import {RootState, StoreDispatch} from 'state/types'

import {integrationsState} from 'fixtures/integrations'
import {phoneNumbers} from 'fixtures/phoneNumber'
import {PhoneNumber} from 'models/phoneNumber/types'
import * as integrationSelectors from 'state/integrations/selectors'
import {PhoneIntegrationEvent} from 'constants/integrations/types/event'
import {getLastSenderChannel, getPreferredChannel} from 'state/ticket/utils'
import {
    emailTicket,
    instagramMedia,
    smoochTicket,
} from 'state/ticket/tests/fixtures'
import socketManager from 'services/socketManager/socketManager'
import {IntegrationType} from 'models/integration/types'
import {ticket} from 'fixtures/ticket'
import * as emailExtraUtils from 'state/newMessage/emailExtraUtils'
import {convertFromHTML} from 'utils/editor'
import {ReplyAreaState} from 'state/newMessage/types'
import {
    MacroActionType,
    MacroActionName,
    MacroAction,
} from 'models/macroAction/types'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import client from 'models/api/resources'
import {SearchType} from 'models/search/types'
import {SEARCH_ENDPOINT} from 'models/search/resources'

import {getReplyAreaStateSnapshot} from './testUtils'

type MockedRootState = {
    agents?: Map<any, any>
    integrations?: Map<any, any>
    ticket?: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    entities?: {
        phoneNumbers: Record<number, PhoneNumber>
    }
}

//$TsFixMe remove casting once ticket/reducers is migrated
const typeSafeTicketInitialState = ticketInitialState as Map<any, any>

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)
const mockedUploadFiles = jest.spyOn(utils, 'uploadFiles')

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

jest.mock('services/socketManager/socketManager', () => {
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
        mockServer = new MockAdapter(client)
    })

    describe('new message', () => {
        const channels = integrationSelectors.getEmailChannels({
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
                const from = smoochTicket.getIn([
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
                const _emailTicket = emailTicket.set('messages', fromJS([]))
                const preferred = getPreferredChannel(
                    TicketMessageSourceType.Email,
                    channels
                )
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
                const from = emailTicket.getIn([
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
                const _emailTicket = emailTicket.deleteIn(['messages', 1])
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
                const _emailTicket = emailTicket
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
                const _emailTicket = emailTicket.deleteIn(['messages', 1])
                const from = getPreferredChannel(
                    TicketMessageSourceType.Email,
                    channels
                )
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
                            name: unverifiedChannel?.name,
                            address: (
                                unverifiedChannel as unknown as {
                                    address: unknown
                                }
                            ).address,
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
                const senderChannel = integrationsState.integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address')
                )

                expect(senderChannel?.meta.verified).toBe(true)
                expect(senderChannel?.meta.address).not.toEqual(
                    (unverifiedChannel as unknown as {address: unknown}).address
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
                const senderChannel = integrationsState.integrations.find(
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
                    ticket: emailTicket,
                    newMessage: initialState,
                })
                expect(getLastSenderChannel()).toBe(null)
                store.dispatch(actions.setSender())

                // it should still be null because we didn't specify a sender param
                expect(getLastSenderChannel()).toBe(null)

                const from = getPreferredChannel(
                    TicketMessageSourceType.Email,
                    channels
                )
                const expectedChannel = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })

                store.dispatch(actions.setSender(expectedChannel))
                expect(getLastSenderChannel()).toEqual(expectedChannel)
            })

            it('should handle phone channel', () => {
                const phoneIntegration = integrationsState.integrations.find(
                    (integration) => integration.type === IntegrationType.Phone
                )

                store = mockStore({
                    integrations: fromJS(integrationsState),
                    entities: {phoneNumbers},
                    ticket: fromJS({
                        events: [
                            {
                                type: PhoneIntegrationEvent.IncomingPhoneCall,
                                data: {integration: {id: phoneIntegration?.id}},
                            },
                        ],
                    }),
                    newMessage: initialState.set(
                        'newMessage',
                        makeNewMessage(
                            TicketChannel.Phone,
                            TicketMessageSourceType.Phone
                        )
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toMatchSnapshot()
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
                        ticket: emailTicket,
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
                        ticket: emailTicket
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
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward)
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            describe('instagram comment', () => {
                it('should not add prefix if there is no receiver name', () => {
                    store = mockStore({
                        ticket: instagramMedia,
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
                        ticket: instagramMedia,
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
                        ticket: instagramMedia,
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
                        ticket: emailTicket,
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(actions.prepare(sourceType))

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            describe('internal note', () => {
                let deleteEmailExtraContentSpy: jest.SpyInstance<
                    ReturnType<typeof emailExtraUtils.deleteEmailExtraContent>
                >

                beforeEach(() => {
                    deleteEmailExtraContentSpy = jest.spyOn(
                        emailExtraUtils,
                        'deleteEmailExtraContent'
                    )
                })

                afterEach(() => {
                    deleteEmailExtraContentSpy.mockRestore()
                })

                it('should remove email extra from the response', () => {
                    const contentStateWithEmailExtra =
                        ContentState.createFromText('Foo\nBar\nBaz')
                    const userInputContentState =
                        ContentState.createFromText('Foo')
                    const signature = fromJS({
                        text: 'Bar\nBaz',
                    })
                    const storeTicket = emailTicket.set(
                        'messages',
                        fromJS([ticket.messages[0]])
                    )
                    deleteEmailExtraContentSpy.mockImplementation(
                        () => userInputContentState
                    )
                    store = mockStore({
                        ticket: storeTicket,
                        newMessage: initialState
                            .setIn(
                                ['state', 'contentState'],
                                contentStateWithEmailExtra
                            )
                            .setIn(
                                ['newMessage', 'source', 'from'],
                                fromJS({
                                    address:
                                        integrationsState.integrations[1].meta
                                            .address,
                                })
                            )
                            .setIn(
                                ['newMessage', 'source', 'extra', 'forward'],
                                true
                            ),
                        integrations: (
                            fromJS(integrationsState) as Map<any, any>
                        ).setIn(
                            ['integrations', '1', 'meta', 'signature'],
                            signature
                        ),
                    })

                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.InternalNote)
                    )

                    expect(deleteEmailExtraContentSpy).toHaveBeenLastCalledWith(
                        contentStateWithEmailExtra
                    )

                    const setResponseTextAction = store
                        .getActions()
                        .find(
                            (action: {type: string}) =>
                                action.type === types.SET_RESPONSE_TEXT
                        ) as {args: Map<any, any>}
                    expect(setResponseTextAction.args).toEqual(
                        fromJS({
                            contentState: userInputContentState,
                            emailExtraAdded: false,
                            forceFocus: true,
                            forceUpdate: true,
                        })
                    )
                })

                it('should not set emailExtraAdded property when email extra content was not removed', () => {
                    const contentState =
                        ContentState.createFromText('Foo\nBar\nBaz')
                    deleteEmailExtraContentSpy.mockImplementation(
                        () => contentState
                    )
                    store = mockStore({
                        ticket: emailTicket,
                        newMessage: initialState.setIn(
                            ['state', 'contentState'],
                            contentState
                        ),
                        integrations: fromJS(integrationsState),
                    })

                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.InternalNote)
                    )

                    const setResponseTextAction = store
                        .getActions()
                        .find(
                            (action: {type: string}) =>
                                action.type === types.SET_RESPONSE_TEXT
                        ) as {args: Map<any, any>}
                    expect(setResponseTextAction.args).toEqual(
                        fromJS({
                            contentState: contentState,
                            forceFocus: true,
                            forceUpdate: true,
                        })
                    )
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
                    ticket: emailTicket,
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
                            contentState:
                                ContentState.createFromText('\n\nsignature'),
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
            let data: ReturnType<typeof actions.prepareTicketDataToSend>
            let addEmailExtraContentSpy: jest.SpyInstance<
                ReturnType<typeof emailExtraUtils.addEmailExtraContent>
            >
            const currentUser = fromJS({
                id: 1,
                name: 'Steve',
                first_name: 'Steve',
            })
            const storeState: Partial<RootState> = {
                integrations: fromJS(integrationsState),
                newMessage: fromJS({
                    state: {contentState: ContentState.createFromText('Hi ')},
                    newMessage: {
                        source: {
                            type: TicketMessageSourceType.Email,
                            from: {
                                address: 'support@acme.gorgias.io',
                            },
                        },
                    },
                }),
                currentUser,
                ticket: fromJS({
                    messages: [ticket.messages[0]],
                    status: 'open',
                    channel: '',
                }),
            }
            const emailExtraContentState = convertFromHTML(
                '<div>Extra <strong>content</strong></div>'
            )

            beforeEach(() => {
                addEmailExtraContentSpy = jest
                    .spyOn(emailExtraUtils, 'addEmailExtraContent')
                    .mockImplementation(() => emailExtraContentState)
            })

            afterEach(() => {
                addEmailExtraContentSpy.mockRestore()
            })

            it('should add email extra to the message when source type is email', () => {
                const {dispatch, getState} = mockStore(storeState)
                const {ticket, newMessage} = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser
                )
                expect(addEmailExtraContentSpy.mock.calls).toMatchSnapshot()
                expect(data?.newMessage).toMatchSnapshot()
                expect(
                    getReplyAreaStateSnapshot(
                        data?.replyAreaState as ReplyAreaState
                    )
                ).toMatchSnapshot()
            })

            it('should not add email extra to the message when source type is not email', () => {
                const {dispatch, getState} = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage?.mergeIn(['newMessage'], {
                        ...(
                            storeState.newMessage?.get('newMessage') as Map<
                                string,
                                unknown
                            >
                        ).toJS(),
                        body_text: 'original text',
                        body_html: 'original html',
                        source: {
                            type: TicketMessageSourceType.FacebookMessage,
                        },
                    }),
                })
                const {ticket, newMessage} = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket,
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser
                )
                expect(addEmailExtraContentSpy).not.toHaveBeenCalled()
                expect(data?.newMessage).toMatchSnapshot()
                expect(
                    getReplyAreaStateSnapshot(
                        data?.replyAreaState as ReplyAreaState
                    )
                ).toMatchSnapshot()
            })
        })

        describe('addEmailExtra()', () => {
            it('should dispatch NEW_MESSAGE_ADD_EMAIL_EXTRA action', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                const contentState = ContentState.createFromText('foo')
                const signature = fromJS({
                    text: 'Cheers, Steve',
                    html: 'Cheers, <strong>Steve</strong>',
                })
                store.dispatch(
                    actions.addEmailExtra({
                        contentState,
                        emailExtraArgs: {
                            ticket,
                            signature,
                            replyThreadMessages: [],
                            isForwarded: true,
                        },
                    })
                )

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

                return (
                    store
                        //@ts-ignore
                        .dispatch(actions.prepareTicketMessage())
                        .then(({messageToSend, replyAreaState}) => {
                            expect(messageToSend).toMatchSnapshot()
                            expect(
                                getReplyAreaStateSnapshot(replyAreaState)
                            ).toMatchSnapshot()
                        })
                )
            })

            it('should reject with TicketMessageActionValidationError on action validation error', async () => {
                store = mockStore({
                    ticket: emailTicket,
                    newMessage: initialState,
                    currentUser: fromJS({
                        id: 1,
                        name: 'foo',
                    }),
                    integrations: fromJS(integrationsState),
                })

                const macroAction: MacroAction = {
                    title: 'foo action',
                    name: MacroActionName.ShopifyCancelLastOrder,
                    type: MacroActionType.User,
                    arguments: {
                        body_text: 'Foo',
                    },
                }

                await expect(
                    store.dispatch(
                        actions.prepareTicketMessage(
                            null,
                            fromJS([macroAction])
                        )
                    )
                ).rejects.toBeInstanceOf(TicketMessageActionValidationError)
            })

            it('should reject with TicketMessageInvalidSendDataError on send data validation error', async () => {
                store = mockStore({
                    ticket: emailTicket,
                    newMessage: initialState
                        .setIn(
                            ['newMessage', 'channel'],
                            TicketMessageSourceType.Facebook
                        )
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            TicketMessageSourceType.FacebookComment
                        )
                        .setIn(['newMessage', 'body_text'], '')
                        .setIn(['newMessage', 'attachments'], [{}]),
                    currentUser: fromJS({
                        id: 1,
                        name: 'foo',
                    }),
                    integrations: fromJS(integrationsState),
                })

                await expect(
                    store.dispatch(actions.prepareTicketMessage(null, null))
                ).rejects.toBeInstanceOf(TicketMessageInvalidSendDataError)
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
                const blob = new Blob(['foo'], {
                    type: 'any',
                }) as unknown as Record<string, unknown> & {
                    slice: (i: number, j: number, type: string) => File
                }
                blob.name = name
                return blob.slice(0, blob.size as number, type)
            }
            const fileFoo = createFile('foo', 'image/png')
            const fileBar = createFile('bar', 'video/mp4')
            const fileList = {
                0: fileFoo,
            } as unknown as FileList
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
                        {
                            0: fileBaz,
                        } as unknown as FileList
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
                        {
                            0: fileFoo,
                            1: fileBar,
                        } as unknown as FileList
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

    describe('addProductCardAttachments()', () => {
        const cardDetail = {
            currency: 'USD',
            fullProductTitle: 'foo',
            imageUrl:
                'https://cdn.shopify.com/s/files/1/1781/7573/products/candy.jpg?v=1575311784',
            link: 'https://storegorgias3.myshopify.com/products/bonbon-acidule?variant=31128766349335',
            price: '1.00',
            productTitle: 'bar',
            variantTitle: 'baz',
            productId: 1,
            variantId: 2,
        }
        it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments', (done) => {
            mockedUploadFiles.mockReturnValue(Promise.resolve([]))
            store = mockStore({
                newMessage: initialState,
                ticket: typeSafeTicketInitialState.set('id', 1),
            })
            store.dispatch(
                actions.addProductCardAttachments(
                    typeSafeTicketInitialState.set('id', 1),
                    cardDetail
                )
            )

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should not dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments in another ticket', (done) => {
            store = mockStore({
                newMessage: initialState,
                ticket: typeSafeTicketInitialState.set('id', 2),
            })
            store.dispatch(
                actions.addProductCardAttachments(
                    typeSafeTicketInitialState.set('id', 1),
                    cardDetail
                )
            )

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('updatePotentialCustomers', () => {
        it('should return a list of potential customer on success', () => {
            mockServer.onPost(SEARCH_ENDPOINT).reply(200, {
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
            mockServer.onPost(SEARCH_ENDPOINT).reply(200, {
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
                .dispatch(
                    actions.updatePotentialCustomers(
                        'foo',
                        SearchType.UserChannelEmail,
                        source.token
                    )
                )
                .then((res) => expect(res).toMatchSnapshot())
        })
    })
})
