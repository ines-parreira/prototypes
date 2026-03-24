// sort-imports-ignore
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import MockAdapter from 'axios-mock-adapter'
import { ContentState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { omit } from 'lodash'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
} from 'business/types/ticket'
import * as segmentTracker from '@repo/logging'
import { AttachmentEnum } from 'common/types'
import * as commonUtils from 'common/utils'
import { SHOPIFY_INTEGRATION_TYPE } from 'constants/integration'
import { channels as mockChannels } from 'fixtures/channels'
import { integrationsState } from 'fixtures/integrations'
import {
    addInternalNoteAction,
    setClosedStatusAction,
    setOpenStatusAction,
    setSubjectAction,
} from 'fixtures/macro'
import { phoneNumbers } from 'fixtures/newPhoneNumber'
import { ticket } from 'fixtures/ticket'
import client from 'models/api/resources'
import { channelsQueryKeys as mockChannelsQueryKeys } from 'models/channel/queries'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionName, MacroActionType } from 'models/macroAction/types'
import type { PhoneNumber } from 'models/phoneNumber/types'
import { SEARCH_ENDPOINT } from 'models/search/resources'
import { SearchType } from 'models/search/types'
import { ProductRecommendationScenario } from 'pages/convert/campaigns/types/CampaignAttachment'
import * as activityTracker from 'services/activityTracker'
import { ActivityEvents } from 'services/activityTracker'
import { AccountSettingType } from 'state/currentAccount/types'
import * as integrationSelectors from 'state/integrations/selectors'
import * as actions from 'state/newMessage/actions'
import * as types from 'state/newMessage/constants'
import {
    NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
    NEW_MESSAGE_DELETE_ATTACHMENT,
    NEW_MESSAGE_SUBMIT_TICKET_ERROR,
} from 'state/newMessage/constants'
import * as emailExtraUtils from 'state/newMessage/emailExtraUtils'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import { initialState, makeNewMessage } from 'state/newMessage/reducers'
import type { ReplyAreaState } from 'state/newMessage/types'
import { initialState as ticketInitialState } from 'state/ticket/reducers'
import {
    chatTicket,
    emailTicket,
    instagramMedia,
} from 'state/ticket/tests/fixtures'
import { getLastSenderChannel, getPreferredChannel } from 'state/ticket/utils'
import type { RootState, StoreDispatch } from 'state/types'
import { CancelToken } from 'tests/axiosRuntime'
import * as utils from 'utils'
import { convertFromHTML } from 'utils/editor'
import * as LDUtils from '@repo/feature-flags'

import { getReplyAreaStateSnapshot } from './testUtils'

const getLDClientSpy = jest.spyOn(LDUtils, 'getLDClient')
type MockedRootState = {
    integrations?: Map<any, any>
    ticket?: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    currentAccount?: Map<any, any>
    entities?: {
        newPhoneNumbers: Record<number, PhoneNumber>
    }
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)
const mockedUploadFiles = jest.spyOn(commonUtils, 'uploadFiles')

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [[mockChannelsQueryKeys.list(), mockChannels]],
    }),
}))

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => 'someRandomKey')

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryTimestamp: jest.fn(() => jest.fn()),
        }) as Record<string, unknown>,
)

jest.mock('services/activityTracker')

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
                const from = chatTicket.getIn([
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
                    ticket: chatTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'chat',
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
                const _chatTicket = chatTicket.deleteIn(['messages', 1]) // delete last message from agent
                const from = _chatTicket.getIn([
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
                    ticket: _chatTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'chat',
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
                    channels,
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
                        'email',
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
                        'email',
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
                        'email',
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
                        },
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
                        'email',
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
                    channels,
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
                        'email',
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
                        'internal-note',
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
                    (integration) => integration.meta.verified === false,
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
                        }),
                    )

                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email',
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
                const senderChannel = integrationsState.integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address'),
                )

                expect(senderChannel?.meta.verified).toBe(true)
                expect(senderChannel?.meta.address).not.toEqual(
                    (unverifiedChannel as unknown as { address: unknown })
                        .address,
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
                        ]),
                    )
                    .setIn(
                        ['messages', 1, 'source', 'from'],
                        fromJS({
                            name: unexistingChannel.name,
                            address: unexistingChannel.address,
                        }),
                    )

                store = mockStore({
                    integrations: fromJS(integrationsState),
                    ticket: _emailTicket,
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        'email',
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
                const senderChannel = integrationsState.integrations.find(
                    (integration) =>
                        integration.meta.address === sender.get('address'),
                )

                expect(senderChannel?.meta.verified).toBe(true)
                expect(senderChannel?.meta.address).not.toEqual(
                    unexistingChannel.address,
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
                    channels,
                )
                const expectedChannel = fromJS({
                    name: from.get('name'),
                    address: from.get('address'),
                })

                store.dispatch(actions.setSender(expectedChannel))
                expect(getLastSenderChannel()).toEqual(expectedChannel)
            })

            it('should handle phone channel', () => {
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    entities: { newPhoneNumbers: phoneNumbers },
                    ticket: fromJS({ messages: [] }),
                    newMessage: initialState.set(
                        'newMessage',
                        makeNewMessage(
                            TicketChannel.Phone,
                            TicketMessageSourceType.Phone,
                        ),
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toMatchSnapshot()
            })

            it('should handle the default integration setting', () => {
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    currentAccount: fromJS({
                        settings: [
                            {
                                id: 1,
                                type: AccountSettingType.DefaultIntegration,
                                data: {
                                    email: 15,
                                },
                            },
                        ],
                    }),
                    ticket: emailTicket.set('messages', fromJS([])),
                    newMessage: initialState.set(
                        'newMessage',
                        makeNewMessage(
                            TicketChannel.Email,
                            TicketMessageSourceType.Email,
                        ),
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: fromJS({
                            name: 'Acme Contact',
                            address: 'contact@acme.com',
                        }),
                    },
                ])
            })

            it('should use the default behaviour if default integration setting is missing', () => {
                store = mockStore({
                    integrations: fromJS(integrationsState),
                    currentAccount: fromJS({
                        settings: [],
                    }),
                    ticket: emailTicket.set('messages', fromJS([])),
                    newMessage: initialState.set(
                        'newMessage',
                        makeNewMessage(
                            TicketChannel.Email,
                            TicketMessageSourceType.Email,
                        ),
                    ),
                })
                store.dispatch(actions.setSender())

                expect(store.getActions()).toEqual([
                    {
                        type: types.NEW_MESSAGE_SET_SENDER,
                        sender: fromJS({
                            name: 'Acme Support',
                            address: 'support@acme.gorgias.io',
                        }),
                    },
                ])
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
                        actions.prepare(TicketMessageSourceType.EmailForward),
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should set all attachments of the ticket as attachment of the newMessage', () => {
                    const attachments = fromJS([{ url: 'foo' }, { url: 'bar' }])
                    const attachments2 = fromJS([
                        { url: 'baz' },
                        { url: 'far' },
                    ])

                    store = mockStore({
                        ticket: emailTicket
                            .setIn(['messages', 0, 'attachments'], attachments)
                            .setIn(
                                ['messages', 1, 'attachments'],
                                attachments2,
                            ),
                        newMessage: initialState,
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward),
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should not set an attachment in the newMessage if it is already there', () => {
                    const attachments = fromJS([{ url: 'foo' }, { url: 'bar' }])
                    const newMessageAttachments = fromJS([{ url: 'foo' }])

                    store = mockStore({
                        ticket: emailTicket.setIn(
                            ['messages', 0, 'attachments'],
                            attachments,
                        ),
                        newMessage: initialState.setIn(
                            ['newMessage', 'attachments'],
                            newMessageAttachments,
                        ),
                        integrations: fromJS(integrationsState),
                    })
                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.EmailForward),
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should cast chat react player videos content into hypertexts when newMessage source is not `chat`', () => {
                    const text = 'Hello, world!'
                    const newContentState = ContentState.createFromText(text)

                    let newMessage = initialState
                    newMessage = newMessage
                        .setIn(['newMessage', 'source', 'type'], 'chat')
                        .setIn(['state', 'contentState'], newContentState)

                    store = mockStore({
                        ticket: chatTicket,
                        newMessage,
                    })

                    const castGorgiasVideosForUnsupportedSourcesSpy =
                        jest.spyOn(
                            utils,
                            'castGorgiasVideosForUnsupportedSources',
                        )

                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.Email),
                    )

                    expect(
                        castGorgiasVideosForUnsupportedSourcesSpy,
                    ).toHaveBeenCalledWith({
                        html: '<div>Hello, world!</div>',
                        hyperlinksSupported: true,
                    })

                    store.dispatch(actions.prepare(TicketMessageSourceType.Sms))

                    expect(
                        castGorgiasVideosForUnsupportedSourcesSpy,
                    ).toHaveBeenCalledWith({
                        html: '<div>Hello, world!</div>',
                        hyperlinksSupported: false,
                    })

                    expect(store.getActions()).toMatchSnapshot()
                })
            })

            describe('instagram comment', () => {
                it('should not add prefix if there is no receiver name', () => {
                    store = mockStore({
                        ticket: instagramMedia,
                        newMessage: initialState.setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment',
                        ),
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment,
                        ),
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should not add prefix if there is text already', () => {
                    let newMessage = initialState
                    newMessage = newMessage
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment',
                        )
                        .setIn(
                            ['newMessage', 'source', 'to'],
                            fromJS([{ address: 'as6d5as', name: 'instauser' }]),
                        )
                        .setIn(
                            ['state', 'contentState'],
                            ContentState.createFromText('foo'),
                        )

                    store = mockStore({
                        ticket: instagramMedia,
                        newMessage,
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment,
                        ),
                    )

                    expect(store.getActions()).toMatchSnapshot()
                })

                it('should add prefix', () => {
                    let newMessage = initialState
                    newMessage = newMessage
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            'instagram-comment',
                        )
                        .setIn(
                            ['newMessage', 'source', 'to'],
                            fromJS([{ address: 'as6d5as', name: 'instauser' }]),
                        )

                    store = mockStore({
                        ticket: instagramMedia,
                        newMessage,
                    })
                    store.dispatch(
                        actions.prepare(
                            TicketMessageSourceType.InstagramComment,
                        ),
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
                        'deleteEmailExtraContent',
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
                        fromJS([ticket.messages[0]]),
                    )
                    deleteEmailExtraContentSpy.mockImplementation(
                        () => userInputContentState,
                    )
                    store = mockStore({
                        ticket: storeTicket,
                        newMessage: initialState
                            .setIn(
                                ['state', 'contentState'],
                                contentStateWithEmailExtra,
                            )
                            .setIn(
                                ['newMessage', 'source', 'from'],
                                fromJS({
                                    address:
                                        integrationsState.integrations[1].meta
                                            .address,
                                }),
                            )
                            .setIn(
                                ['newMessage', 'source', 'extra', 'forward'],
                                true,
                            ),
                        integrations: (
                            fromJS(integrationsState) as Map<any, any>
                        ).setIn(
                            ['integrations', '1', 'meta', 'signature'],
                            signature,
                        ),
                    })

                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.InternalNote),
                    )

                    expect(deleteEmailExtraContentSpy).toHaveBeenLastCalledWith(
                        contentStateWithEmailExtra,
                    )

                    const setResponseTextAction = store
                        .getActions()
                        .find(
                            (action: { type: string }) =>
                                action.type === types.SET_RESPONSE_TEXT,
                        ) as { args: Map<any, any> }
                    expect(setResponseTextAction.args).toEqual(
                        fromJS({
                            contentState: userInputContentState,
                            emailExtraAdded: false,
                            forceFocus: true,
                            forceUpdate: true,
                        }),
                    )
                })

                it('should not set emailExtraAdded property when email extra content was not removed', () => {
                    const contentState =
                        ContentState.createFromText('Foo\nBar\nBaz')
                    deleteEmailExtraContentSpy.mockImplementation(
                        () => contentState,
                    )
                    store = mockStore({
                        ticket: emailTicket,
                        newMessage: initialState.setIn(
                            ['state', 'contentState'],
                            contentState,
                        ),
                        integrations: fromJS(integrationsState),
                    })

                    store.dispatch(
                        actions.prepare(TicketMessageSourceType.InternalNote),
                    )

                    const setResponseTextAction = store
                        .getActions()
                        .find(
                            (action: { type: string }) =>
                                action.type === types.SET_RESPONSE_TEXT,
                        ) as { args: Map<any, any> }
                    expect(setResponseTextAction.args).toEqual(
                        fromJS({
                            contentState: contentState,
                            forceFocus: true,
                            forceUpdate: true,
                        }),
                    )
                })
            })
        })

        describe('setResponseText()', () => {
            it('should always pass the args to the reducer', () => {
                store = mockStore({
                    ticket: emailTicket,
                    newMessage: initialState,
                })

                const contentState = ContentState.createFromText('foo')
                store.dispatch(
                    actions.setResponseText(fromJS({ contentState })),
                )

                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('prepareTicketDataToSend()', () => {
            let data: ReturnType<typeof actions.prepareTicketDataToSend>
            let addEmailExtraContentSpy: jest.SpyInstance<
                ReturnType<typeof emailExtraUtils.addEmailExtraContent>
            >
            let logEventSpy: jest.SpyInstance<
                ReturnType<typeof segmentTracker.logEvent>
            >
            const currentUser = fromJS({
                id: 1,
                name: 'Steve',
                first_name: 'Steve',
            })
            const storeState: Partial<RootState> = {
                integrations: fromJS(integrationsState),
                newMessage: fromJS({
                    state: { contentState: ContentState.createFromText('Hi ') },
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
                '<div>Extra <strong>content</strong></div>',
            )
            const discount_code_1 = {
                id: 3,
                code: 'DISCO',
                title: 'Completely Irrelevant',
                summary: 'Good discount',
                shareable_url: 'https://acme.gorgias.io/sth',
            }
            const discount_code_2 = {
                id: 4,
                code: 'FREEBIE',
                title: 'Freebie title',
                summary: 'Freebie discount',
                shareable_url: 'https://acme.gorgias.io/freebie',
            }

            beforeEach(() => {
                addEmailExtraContentSpy = jest
                    .spyOn(emailExtraUtils, 'addEmailExtraContent')
                    .mockImplementation(() => emailExtraContentState)
                logEventSpy = jest.spyOn(segmentTracker, 'logEvent')
            })

            afterEach(() => {
                addEmailExtraContentSpy.mockRestore()
                logEventSpy.mockRestore()
            })

            it('should add email extra to the message when source type is email', () => {
                const { dispatch, getState } = mockStore(storeState)
                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(addEmailExtraContentSpy.mock.calls).toMatchSnapshot()
                expect(data?.newMessage).toMatchSnapshot()
                expect(
                    getReplyAreaStateSnapshot(
                        data?.replyAreaState as ReplyAreaState,
                    ),
                ).toMatchSnapshot()
            })

            it('should not add email extra to the message when source type is not email', () => {
                const { dispatch, getState } = mockStore({
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
                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket,
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(addEmailExtraContentSpy).not.toHaveBeenCalled()
                expect(data?.newMessage).toMatchSnapshot()
                expect(
                    getReplyAreaStateSnapshot(
                        data?.replyAreaState as ReplyAreaState,
                    ),
                ).toMatchSnapshot()
            })

            it('should transform empty message with macro to internal note', () => {
                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage?.set('body_text', ''),
                    ticket: storeState.ticket?.setIn(
                        ['state', 'appliedMacro'],
                        { name: 'Macro 1' },
                    ),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
            })

            it('should replace empty message with intenal note text from internal note action', () => {
                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage?.set('body_text', ''),
                    ticket: storeState.ticket?.setIn(
                        ['state', 'appliedMacro'],
                        { name: 'Macro 1' },
                    ),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([addInternalNoteAction]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
            })

            it('should add discount codes to meta', () => {
                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage
                        ?.setIn(
                            ['newMessage', 'body_text'],
                            'Your discount code is DISCO',
                        )
                        .setIn(
                            ['state', 'inserted_discounts'],
                            fromJS([discount_code_1]),
                        )
                        .setIn(['state', 'emailExtraAdded'], true),
                    ticket: storeState.ticket?.set(
                        'customer',
                        fromJS({
                            id: 12,
                            integrations: {
                                123: {
                                    customer: { id: 34 },
                                    __integration_type__:
                                        SHOPIFY_INTEGRATION_TYPE,
                                },
                                456: {
                                    customer: { id: 56 },
                                    __integration_type__: 'whatever',
                                },
                                789: {
                                    customer: { id: 78 },
                                    __integration_type__:
                                        SHOPIFY_INTEGRATION_TYPE,
                                },
                            },
                        }),
                    ),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
                expect(logEventSpy).toHaveBeenCalledWith(
                    segmentTracker.SegmentEvent.InsertDiscountCodeAdded,
                    expect.objectContaining({
                        customer: {
                            gorgias_id: 12,
                            integrations: [
                                { customer_id: 34, id: '123' },
                                { customer_id: 78, id: '789' },
                            ],
                        },
                        discount: {
                            id: 3,
                            code: 'DISCO',
                            title: 'Completely Irrelevant',
                        },
                    }),
                )
            })

            it('should add discount codes to meta only if in message body', () => {
                const discountCodes = [discount_code_1, discount_code_2]

                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage
                        ?.setIn(
                            ['newMessage', 'body_text'],
                            'Only FREEBIE in body text',
                        )
                        .setIn(
                            ['state', 'inserted_discounts'],
                            fromJS(discountCodes),
                        )
                        .setIn(['state', 'emailExtraAdded'], true),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
                expect(logEventSpy).toHaveBeenCalledWith(
                    segmentTracker.SegmentEvent.InsertDiscountCodeAdded,
                    expect.objectContaining({
                        discount: {
                            id: 4,
                            code: 'FREEBIE',
                            title: 'Freebie title',
                        },
                    }),
                )
            })

            it('should not add discount codes to meta if discount in old messages', () => {
                const discountCodes = [discount_code_1]

                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage
                        ?.setIn(
                            ['newMessage', 'body_text'],
                            // only the old message matches the discount code
                            'Current message ends here. On Thu, Feb 16, 2023, at 02:43 PM, Acme Support <somemail> wrote: old FREEBIE discount',
                        )
                        .setIn(
                            ['newMessage', 'stripped_text'],

                            'Current message ends here.',
                        )
                        .setIn(
                            ['state', 'inserted_discounts'],
                            fromJS(discountCodes),
                        )
                        .setIn(['state', 'emailExtraAdded'], true),
                    ticket: storeState.ticket?.setIn(
                        ['channel'],
                        TicketChannel.Email,
                    ),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket.set('subject', 'Foo subject'),
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
                expect(logEventSpy).not.toBeCalled()
            })

            it('should not add discount codes to meta if discount in old messages and agent expands mail', () => {
                const discountCodes = [discount_code_1]

                const { dispatch, getState } = mockStore({
                    ...storeState,
                    newMessage: storeState.newMessage
                        ?.setIn(
                            ['newMessage', 'body_text'],
                            'Current message ends here. On Thu, Feb 16, 2023, at 02:43 PM, Acme Support <somemail> wrote: old FREEBIE discount',
                        )
                        .setIn(
                            ['newMessage', 'body_html'],
                            'Current message ends here. On Thu, Feb 16, 2023, at 02:43 PM, Acme Support <a>somemail</a>&gt; wrote: old FREEBIE discount',
                        )
                        .setIn(
                            ['state', 'inserted_discounts'],
                            fromJS(discountCodes),
                        )
                        .setIn(['state', 'emailExtraAdded'], true),
                    ticket: storeState.ticket?.setIn(
                        ['channel'],
                        TicketChannel.Email,
                    ),
                })

                const { ticket, newMessage } = getState() as RootState
                data = actions.prepareTicketDataToSend(
                    dispatch,
                    getState as () => RootState,
                    ticket,
                    newMessage,
                    '',
                    fromJS([]),
                    currentUser,
                )
                expect(data?.newMessage).toMatchSnapshot()
                expect(logEventSpy).not.toBeCalled()
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
                    }),
                )

                expect(store.getActions()).toMatchSnapshot()
            })
        })

        describe('prepareTicketMessage', () => {
            const defaultState = {
                ticket: emailTicket,
                newMessage: initialState
                    .setIn(
                        ['newMessage', 'channel'],
                        TicketMessageSourceType.Facebook,
                    )
                    .setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.FacebookComment,
                    )
                    .setIn(['newMessage', 'body_text'], 'text'),
                currentUser: fromJS({
                    id: 1,
                    name: 'foo',
                }),
                integrations: fromJS(integrationsState),
            }

            it('should prepare next new message after we submitted an instagram comment', () => {
                store = mockStore({
                    ...defaultState,
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
                        }),
                    ),
                })

                return (
                    store
                        //@ts-ignore
                        .dispatch(actions.prepareTicketMessage())
                        .then(({ messageToSend, replyAreaState }) => {
                            expect(messageToSend).toMatchSnapshot()
                            expect(
                                getReplyAreaStateSnapshot(replyAreaState),
                            ).toMatchSnapshot()
                        })
                )
            })

            it('should not add include_thread to source.extra when emailThreadSizeFF is false', async () => {
                getLDClientSpy.mockReturnValueOnce({
                    variation: () => false,
                } as any)

                store = mockStore({
                    ...defaultState,
                    ticket: emailTicket.set('id', 12),
                    newMessage: initialState
                        .setIn(['newMessage', 'channel'], TicketChannel.Email)
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            TicketMessageSourceType.Email,
                        )
                        .setIn(['newMessage', 'body_text'], 'text email'),
                })

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage(),
                )

                // The source.extra should be an empty object or just contain original properties
                // but must not have include_thread property
                expect(messageToSend.source.extra).not.toEqual({
                    include_thread: true,
                })
            })

            it('should add include_thread=false when emailThreadSizeFF is true and email extra was added (thread visible in composer)', async () => {
                getLDClientSpy.mockReturnValueOnce({
                    variation: () => true,
                } as any)

                const contentState = ContentState.createFromText('My reply')

                store = mockStore({
                    ...defaultState,
                    ticket: emailTicket.set('id', 12),
                    newMessage: initialState
                        .setIn(['newMessage', 'channel'], TicketChannel.Email)
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            TicketMessageSourceType.Email,
                        )
                        .setIn(['newMessage', 'body_text'], 'text email')
                        .setIn(['state', 'contentState'], contentState)
                        .setIn(['state', 'emailExtraAdded'], true),
                })

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        emailThreadSizeFF: true,
                    }),
                )

                expect(messageToSend.source.extra?.include_thread).toBe(false)
            })

            it('should add include_thread=true when emailThreadSizeFF is true and email extra was NOT initially visible', async () => {
                getLDClientSpy.mockReturnValueOnce({
                    variation: () => true,
                } as any)

                const contentState = ContentState.createFromText('My reply')

                store = mockStore({
                    ...defaultState,
                    ticket: emailTicket.set('id', 12),
                    newMessage: initialState
                        .setIn(['newMessage', 'channel'], TicketChannel.Email)
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            TicketMessageSourceType.Email,
                        )
                        .setIn(['newMessage', 'body_text'], 'text email')
                        .setIn(['state', 'contentState'], contentState)
                        .setIn(['state', 'emailExtraAdded'], false),
                })

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        emailThreadSizeFF: true,
                    }),
                )

                // Thread was not initially visible (emailExtraAdded=false before prepareTicketDataToSend),
                // so backend can safely rebuild from database.
                expect(messageToSend.source.extra?.include_thread).toBe(true)
            })

            it('should add include_thread=false when emailThreadSizeFF is false (legacy behavior)', async () => {
                getLDClientSpy.mockReturnValueOnce({
                    variation: () => false,
                } as any)

                const contentState = ContentState.createFromText('My reply')

                store = mockStore({
                    ...defaultState,
                    ticket: emailTicket.set('id', 12),
                    newMessage: initialState
                        .setIn(['newMessage', 'channel'], TicketChannel.Email)
                        .setIn(
                            ['newMessage', 'source', 'type'],
                            TicketMessageSourceType.Email,
                        )
                        .setIn(['newMessage', 'body_text'], 'text email')
                        .setIn(['state', 'contentState'], contentState)
                        .setIn(['state', 'emailExtraAdded'], true),
                })

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        emailThreadSizeFF: false,
                    }),
                )

                expect(messageToSend.source.extra?.include_thread).toBe(false)
            })

            it('should reject with TicketMessageActionValidationError on action validation error', async () => {
                store = mockStore({
                    ...defaultState,
                    newMessage: initialState,
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
                        actions.prepareTicketMessage({
                            macroActions: fromJS([macroAction]),
                        }),
                    ),
                ).rejects.toBeInstanceOf(TicketMessageActionValidationError)
            })

            it('should reject with TicketMessageInvalidSendDataError on send data validation error', async () => {
                store = mockStore({
                    ...defaultState,
                    newMessage: defaultState.newMessage
                        .setIn(['newMessage', 'body_text'], '')
                        .setIn(['newMessage', 'attachments'], fromJS([{}])),
                })

                await expect(
                    store.dispatch(actions.prepareTicketMessage()),
                ).rejects.toBeInstanceOf(TicketMessageInvalidSendDataError)
            })

            it('should create actions with setStatus=close action when status is closed and no macro actions', async () => {
                store = mockStore(defaultState)

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        status: TicketStatus.Closed,
                    }),
                )
                const actionsToSend = messageToSend.actions?.toJS()

                expect(actionsToSend).toEqual([
                    actions
                        .formatAction(
                            fromJS(setClosedStatusAction),
                            fromJS(
                                utils.getActionTemplate(
                                    setClosedStatusAction.name,
                                ),
                            ),
                            {},
                        )
                        .toJS(),
                ])
            })

            it('should push setStatus=close action to the macro actions when status is closed', async () => {
                store = mockStore(defaultState)

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        status: TicketStatus.Closed,
                        macroActions: fromJS([setSubjectAction]),
                    }),
                )
                const actionsToSend = messageToSend.actions?.toJS()

                expect(actionsToSend).toEqual([
                    actions
                        .formatAction(
                            fromJS(setSubjectAction),
                            fromJS(
                                utils.getActionTemplate(setSubjectAction.name),
                            ),
                            {},
                        )
                        .toJS(),
                    actions
                        .formatAction(
                            fromJS(setClosedStatusAction),
                            fromJS(
                                utils.getActionTemplate(
                                    setClosedStatusAction.name,
                                ),
                            ),
                            {},
                        )
                        .toJS(),
                ])
            })

            it('should replace setStatus action in the macro actions with close when status is closed', async () => {
                store = mockStore(defaultState)

                const { messageToSend } = await store.dispatch(
                    actions.prepareTicketMessage({
                        status: TicketStatus.Closed,
                        macroActions: fromJS([setOpenStatusAction]),
                    }),
                )
                const actionsToSend = messageToSend.actions?.toJS()

                expect(actionsToSend).toEqual([
                    actions
                        .formatAction(
                            fromJS(setClosedStatusAction),
                            fromJS(
                                utils.getActionTemplate(
                                    setClosedStatusAction.name,
                                ),
                            ),
                            {},
                        )
                        .toJS(),
                ])
            })

            describe('should build the correct payload when using new channels as source', () => {
                it('should remove source.type', async () => {
                    const source = {
                        extra: {},
                        type: 'tiktok-shop',
                        from: {
                            address: 'theshop',
                            name: 'The Shop',
                        },
                        to: [
                            {
                                address: 'messagereceiver',
                                name: 'John Doe',
                            },
                        ],
                    }

                    const store = mockStore({
                        ...defaultState,
                        newMessage: initialState.set(
                            'newMessage',
                            fromJS({
                                channel: 'tiktok-shop',
                                source,
                            }),
                        ),
                    })

                    const { messageToSend } = await store.dispatch(
                        actions.prepareTicketMessage(),
                    )

                    expect(messageToSend.source.type).toBeUndefined()
                    expect(messageToSend.source).toEqual(omit(source, 'type'))
                })

                it('should append the appropriate integration_id', async () => {
                    const source = {
                        type: 'tiktok-shop',
                        from: {
                            address: 'theshop',
                            name: 'The Shop',
                        },
                        to: [
                            {
                                address: 'messagereceiver',
                                name: 'John Doe',
                            },
                        ],
                    }

                    const store = mockStore({
                        ...defaultState,
                        newMessage: initialState.set(
                            'newMessage',
                            fromJS({
                                channel: 'tiktok-shop',
                                source,
                            }),
                        ),
                        integrations: fromJS({
                            integrations: [
                                {
                                    type: 'app',
                                    id: 123,
                                    meta: {
                                        address: 'theshop',
                                    },
                                },
                            ],
                        }),
                    })

                    const { messageToSend } = await store.dispatch(
                        actions.prepareTicketMessage(),
                    )

                    expect(messageToSend.integration_id).toEqual(123)
                })
            })
        })

        describe('sendTicketMessage', () => {
            it('should submit new message', () => {
                mockServer
                    .onPost('/api/tickets/12/messages/')
                    .reply(201, { ticket_id: 12, messages: [] })
                store = mockStore({
                    ticket: ticketInitialState.set('id', 12),
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
                        .then(({ messageId, messageToSend }) =>
                            //@ts-ignore
                            actions.sendTicketMessage(messageId, messageToSend),
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
                    } as any),
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
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        fileList,
                    ),
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
                    ticket: ticketInitialState.set('id', 2),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        fileList,
                    ),
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
                    }),
                )
                store = mockStore({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        fileList,
                    ),
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
                    }),
                )
                store = mockStore({
                    newMessage: initialState,
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(
                        ticketInitialState.set('id', 1),
                        fileList,
                    ),
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
                        TicketMessageSourceType.FacebookComment,
                    ),
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(ticketInitialState.set('id', 1), {
                        0: fileBaz,
                    } as unknown as FileList),
                )

                expect(mockedUploadFiles).not.toHaveBeenCalled()
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })

            it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_ERROR when adding more than 1 attachment in a facebook comment', (done) => {
                mockedUploadFiles.mockReturnValue(Promise.resolve([]))
                store = mockStore({
                    newMessage: initialState.setIn(
                        ['newMessage', 'source', 'type'],
                        TicketMessageSourceType.FacebookComment,
                    ),
                    ticket: ticketInitialState.set('id', 1),
                })
                store.dispatch(
                    actions.addAttachments(ticketInitialState.set('id', 1), {
                        0: fileFoo,
                        1: fileBar,
                    } as unknown as FileList),
                )

                expect(mockedUploadFiles).not.toHaveBeenCalled()
                setImmediate(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    done()
                })
            })
        })

        describe('restoreNewMessageDraft', () => {
            it('should inject draft data to newMessage', () => {
                store = mockStore({
                    newMessage: initialState,
                })
                store.dispatch(
                    actions.restoreNewMessageDraft({
                        attachments: fromJS([
                            {
                                content_type: 'image/jpeg',
                                name: 'E-pZxm5XoAAmsSo.jpg',
                                size: 106372,
                                url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-pZxm5XoAAmsSo-7586849a-2cb8-470e-b941-00065b5d79fc.jpg',
                            },
                        ]),
                        source: fromJS({
                            type: TicketMessageSourceType.Email,
                        }),
                    }),
                )
                expect(store.getActions()).toMatchSnapshot()
            })
        })
    })

    describe('addProductCardAttachments()', () => {
        const attachment = {
            content_type: AttachmentEnum.Product,
            name: 'bar',
            size: 0,
            url: 'https://cdn.shopify.com/s/files/1/1781/7573/products/candy.jpg?v=1575311784',
            extra: {
                product_id: 1,
                variant_id: 2,
                price: '1.00',
                variant_name: 'baz',
                product_link:
                    'https://storegorgias3.myshopify.com/products/bonbon-acidule?variant=31128766349335',
                currency: 'USD',
                featured_image:
                    'https://cdn.shopify.com/s/files/1/1781/7573/products/candy.jpg?v=1575311784',
            },
        } as const

        it('should dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments', (done) => {
            mockedUploadFiles.mockReturnValue(Promise.resolve([]))
            store = mockStore({
                newMessage: initialState,
                ticket: ticketInitialState.set('id', 1),
            })
            store.dispatch(
                actions.addAttachment(
                    ticketInitialState.set('id', 1),
                    attachment,
                ),
            )

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should not dispatch NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS when successfully adding attachments in another ticket', (done) => {
            store = mockStore({
                newMessage: initialState,
                ticket: ticketInitialState.set('id', 2),
            })
            store.dispatch(
                actions.addAttachment(
                    ticketInitialState.set('id', 1),
                    attachment,
                ),
            )

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('add product recommendation attachment', () => {
        const discountAttachment = {
            content_type: AttachmentEnum.DiscountOffer,
        }
        const productAttachment = {
            content_type: AttachmentEnum.Product,
            name: 'bar',
            size: 0,
            url: 'https://cdn.shopify.com/s/files/1/1781/7573/products/candy.jpg?v=1575311784',
            extra: {
                product_id: 1,
                variant_id: 2,
                price: '1.00',
                variant_name: 'baz',
                product_link:
                    'https://storegorgias3.myshopify.com/products/bonbon-acidule?variant=31128766349335',
                currency: 'USD',
                featured_image:
                    'https://cdn.shopify.com/s/files/1/1781/7573/products/candy.jpg?v=1575311784',
            },
        } as const

        const productRecommendationAttachment = {
            content_type: AttachmentEnum.ProductRecommendation,
            name: 'Similar Browsed Products',
            extra: {
                id: '01J4VH71YJ704QXCP4WDST3ZT3',
                scenario: ProductRecommendationScenario.SimilarSeen,
            },
        } as const

        it('should dispatch NEW_MESSAGE_DELETE_ATTACHMENT of product attachments on adding product recommendation attachment', (done) => {
            store = mockStore({
                newMessage: initialState.setIn(
                    ['newMessage', 'attachments'],
                    fromJS([
                        productAttachment,
                        discountAttachment,
                        productAttachment,
                    ]),
                ),
                ticket: ticketInitialState.set('id', 1),
            })
            store.dispatch(
                actions.addAttachment(
                    ticketInitialState.set('id', 1),
                    productRecommendationAttachment,
                ),
            )

            setImmediate(() => {
                expect(store.getActions()).toEqual([
                    {
                        type: NEW_MESSAGE_DELETE_ATTACHMENT,
                        index: 2,
                    },
                    {
                        type: NEW_MESSAGE_DELETE_ATTACHMENT,
                        index: 0,
                    },
                    {
                        type: NEW_MESSAGE_ADD_ATTACHMENT_SUCCESS,
                        resp: [productRecommendationAttachment],
                    },
                ])
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
                        user: { id: 4, name: 'Marie Curie' },
                        customer: { id: 4, name: 'Marie Curie' },
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
                        user: { id: 4, name: 'Marie Curie' },
                        customer: { id: 4, name: 'Marie Curie' },
                    },
                ],
                object: 'list',
                uri: '',
                meta: {},
            })
            store = mockStore({})
            const source = CancelToken.source()
            source.cancel()

            return store
                .dispatch(
                    actions.updatePotentialCustomers(
                        'foo',
                        SearchType.UserChannelEmail,
                        source.token,
                    ),
                )
                .then((res) => expect(res).toMatchSnapshot())
        })
    })

    describe('submitTicket()', () => {
        it('should format custom fields correctly', async () => {
            mockServer.onPost('/api/tickets/').reply(200, { data: { id: 1 } })

            const customFields = {
                1: {
                    id: 1,
                    value: 'hello',
                    hasError: true,
                },
                2: {
                    id: 2,
                    value: '',
                },
                3: {
                    id: 3,
                },
            }

            store = mockStore({
                ticket: fromJS({
                    ...ticketInitialState.toJS(),
                    custom_fields: customFields,
                }),
                newMessage: initialState,
            })

            await store.dispatch(
                actions.submitTicket(
                    fromJS({
                        ...ticketInitialState.toJS(),
                        custom_fields: customFields,
                    }),
                    TicketStatus.Open,
                    undefined,
                    fromJS({}),
                    true,
                ),
            )

            expect(
                (
                    JSON.parse(mockServer.history.post[0].data) as {
                        custom_fields: unknown
                    }
                ).custom_fields,
            ).toEqual([{ id: 1, value: 'hello' }])
        })

        it('should log an activity event when submitting a ticket', async () => {
            store = mockStore({
                ticket: fromJS({
                    ...ticketInitialState.toJS(),
                }),
                newMessage: initialState,
            })

            mockServer.onPost('/api/tickets/').reply(200, { id: 1 })
            const logActivityEventSpy = jest.spyOn(
                activityTracker,
                'logActivityEvent',
            )

            await store.dispatch(
                actions.submitTicket(
                    ticketInitialState,
                    TicketStatus.Open,
                    undefined,
                    fromJS({}),
                    true,
                    '123',
                ),
            )

            expect(logActivityEventSpy).toHaveBeenCalledWith(
                ActivityEvents.UserCreatedTicket,
                {
                    entityType: 'ticket',
                    entityId: 1,
                    temporaryId: '123',
                },
            )
        })

        it('should catch error and dispatch NEW_MESSAGE_SUBMIT_TICKET_ERROR action', async () => {
            mockServer.onPost('/api/tickets/').reply(400, undefined)

            await store.dispatch(
                actions.submitTicket(
                    ticketInitialState,
                    TicketStatus.Open,
                    undefined,
                    fromJS({}),
                    true,
                ),
            )

            expect((store.getActions().pop() as { type: string }).type).toBe(
                NEW_MESSAGE_SUBMIT_TICKET_ERROR,
            )
        })
    })

    describe('translation actions', () => {
        it('creates SET_TRANSLATION_STATE action', () => {
            const contentState = ContentState.createFromText('Translated text')
            const action = actions.setTranslationState({
                translatedContentState: contentState,
            })

            expect(action.type).toBe(types.SET_TRANSLATION_STATE)
            expect(action.payload).toEqual({
                translatedContentState: contentState,
            })
        })

        it('creates CLEAR_TRANSLATION_STATE action', () => {
            const action = actions.clearTranslationState()

            expect(action.type).toBe(types.CLEAR_TRANSLATION_STATE)
        })
    })

    describe('setActiveCustomerAsReceiver', () => {
        it('should set email receiver based on active customer', () => {
            store = mockStore({
                ticket: emailTicket
                    .setIn(['channel'], TicketChannel.Email)
                    .setIn(['customer', 'name'], 'Marc')
                    .setIn(
                        ['customer', 'channels'],
                        fromJS([
                            {
                                address: 'marc.wall@gmail.com',
                                type: 'email',
                            },
                        ]),
                    ),
                newMessage: initialState,
            })
            store.dispatch(actions.setActiveCustomerAsReceiver())

            expect(store.getActions()).toEqual([
                {
                    type: types.NEW_MESSAGE_SET_RECEIVERS,
                    receivers: {
                        to: [{ name: 'Marc', address: 'marc.wall@gmail.com' }],
                    },
                    replaceAll: false,
                },
            ])
        })

        it('should use customer email when no channel with type Email exists', () => {
            store = mockStore({
                ticket: emailTicket
                    .setIn(['channel'], TicketChannel.Email)
                    .setIn(['customer', 'name'], 'Marc')
                    .setIn(['customer', 'email'], 'marc.wall@gmail.com')
                    .setIn(
                        ['customer', 'channels'],
                        fromJS([
                            {
                                address: '123456789',
                                type: 'phone',
                            },
                        ]),
                    ),
                newMessage: initialState,
            })
            store.dispatch(actions.setActiveCustomerAsReceiver())

            expect(store.getActions()).toEqual([
                {
                    type: types.NEW_MESSAGE_SET_RECEIVERS,
                    receivers: {
                        to: [{ name: 'Marc', address: 'marc.wall@gmail.com' }],
                    },
                    replaceAll: false,
                },
            ])
        })

        it('should not set receiver when customer has no name', () => {
            store = mockStore({
                ticket: emailTicket
                    .setIn(['channel'], TicketChannel.Email)
                    .setIn(['customer', 'name'], '')
                    .setIn(['customer', 'email'], 'john@example.com')
                    .setIn(
                        ['customer', 'channels'],
                        fromJS([
                            {
                                address: 'john@example.com',
                                type: 'email',
                            },
                        ]),
                    ),
                newMessage: initialState,
            })
            store.dispatch(actions.setActiveCustomerAsReceiver())

            expect(store.getActions()).toEqual([])
        })

        it('should not set receiver when customer has no email', () => {
            store = mockStore({
                ticket: emailTicket
                    .setIn(['channel'], TicketChannel.Email)
                    .setIn(['customer', 'name'], 'Bob'),
                newMessage: initialState,
            })
            store.dispatch(actions.setActiveCustomerAsReceiver())

            expect(store.getActions()).toEqual([])
        })

        it('should return early when ticket channel is not Email', () => {
            store = mockStore({
                ticket: emailTicket
                    .setIn(['channel'], TicketChannel.Phone)
                    .setIn(['customer', 'name'], 'Marc')
                    .setIn(['customer', 'email'], 'marc.wall@gmail.com'),
                newMessage: initialState,
            })
            store.dispatch(actions.setActiveCustomerAsReceiver())

            expect(store.getActions()).toEqual([])
        })
    })
})
