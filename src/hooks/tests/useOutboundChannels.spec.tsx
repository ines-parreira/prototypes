// sort-imports-ignore
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TicketMessageSourceType } from 'business/types/ticket'
import { applications as mockApplications } from 'fixtures/applications'
import { channels as mockChannels } from 'fixtures/channels'
import { applicationsQueryKeys as mockApplicationsQueryKeys } from 'models/application/queries'
import { channelsQueryKeys as mockChannelsQueryKeys } from 'models/channel/queries'
import { Integration } from 'models/integration/types'
import { SourceAddress } from 'models/ticket/types'
import {
    Application,
    getApplications,
    getApplicationsByChannel,
} from 'services/applications'
import { ChannelIdentifier, getChannelBySlug } from 'services/channels'

import useOutboundChannels, {
    privateFunctions,
    useSendersForSelectedChannel,
} from '../useOutboundChannels'

const {
    getReplyChannelsForTicket,
    getLegacyReplySourcesForTicket,
    getSelectedChannel,
} = privateFunctions

jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient({
        cachedData: [
            [mockChannelsQueryKeys.list(), mockChannels],
            [mockApplicationsQueryKeys.list(), mockApplications],
        ],
    }),
}))

jest.mock('services/applications', () => ({
    getApplications: jest.fn(),
    getApplicationsByChannel: jest.fn(),
}))

jest.mock('state/newMessage/actions', () => ({
    prepare: jest.fn().mockImplementation((channel: ChannelIdentifier) => ({
        type: 'MOCKED_PREPARE_NEW_MESSAGE',
        payload: channel,
    })),
    setSender: jest.fn().mockImplementation((sender: SourceAddress) => ({
        type: 'MOCKED_SET_SENDER',
        payload: sender,
    })),
}))

const mockedGetApplications = getApplications as jest.Mock<Application[]>
const mockedGetApplicationsByChannel = getApplicationsByChannel as jest.Mock<
    Application[]
>
mockedGetApplications.mockReturnValue(mockApplications)
mockedGetApplicationsByChannel.mockReturnValue(mockApplications)

describe('useOutboundChannels', () => {
    const renderHookWithStore = (store: Store) =>
        renderHook(() => useOutboundChannels(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

    describe('should return a list of new channels that can be used to create or reply to a ticket', () => {
        it('should include only new channels if legacy integrations are not present', () => {
            const store = configureMockStore()({
                integrations: fromJS({ integrations: [] }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.channels).toEqual([
                getChannelBySlug('tiktok-shop'),
            ])
        })

        it('should include only legacy channels if no applications are present', () => {
            mockedGetApplications.mockReturnValueOnce([])
            const store = configureMockStore()({
                integrations: fromJS({
                    integrations: [{ type: 'email' }],
                }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.channels).toEqual(['email'])
        })

        it('should include both new and legacy channels if legacy integrations present', () => {
            const store = configureMockStore()({
                integrations: fromJS({
                    integrations: [{ type: 'email' }, { type: 'sms' }],
                }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.channels).toEqual([
                'email',
                'sms',
                getChannelBySlug('tiktok-shop'),
            ])
        })
    })

    describe('should allow managing the currently selected channel', () => {
        it('should have a default selected channel', () => {
            const store = configureMockStore()({
                integrations: fromJS({
                    integrations: [{ type: 'email' }],
                }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.selectedChannel).toEqual('email')
        })

        it('should allow changing the selected channel (via newMessage.prepare) to a legacy channel', () => {
            const store = configureMockStore([thunk])({
                ticket: fromJS({ messages: [] }),
                integrations: fromJS({
                    integrations: [
                        {
                            type: 'email',
                            meta: { address: 'test@gorgias.com' },
                        },
                    ],
                }),
            })
            const { result } = renderHookWithStore(store)

            expect(result.current?.selectedChannel).toEqual('email')

            result?.current.selectChannel(TicketMessageSourceType.Email)
            expect(store.getActions()).toEqual([
                {
                    type: 'MOCKED_PREPARE_NEW_MESSAGE',
                    payload: 'email',
                },
            ])
        })

        it('should allow changing the selected channel (via newMessage.prepare) to a new channel', () => {
            const store = configureMockStore([thunk])({
                ticket: fromJS({ messages: [] }),
                integrations: fromJS({
                    integrations: [
                        {
                            type: 'email',
                            meta: { address: 'test@gorgias.com' },
                        },
                    ],
                }),
            })
            const { result } = renderHookWithStore(store)

            expect(result.current?.selectedChannel).toEqual('email')

            result?.current.selectChannel(getChannelBySlug('tiktok-shop'))
            expect(store.getActions()).toEqual([
                {
                    type: 'MOCKED_PREPARE_NEW_MESSAGE',
                    payload: 'tiktok-shop',
                },
            ])
        })
    })
})

describe('getReplyChannelsForTicket()', () => {
    it('should return an empty array if no applications are installed', () => {
        expect(getReplyChannelsForTicket({}, [])).toEqual([])
        expect(getReplyChannelsForTicket({ id: 1 }, [])).toEqual([])
    })

    it('should NOT return legacy channels', () => {
        const newChannel = getChannelBySlug('tiktok-shop')
        const legacyChannel = getChannelBySlug('email')

        const applications = [
            {
                channel_id: newChannel!.id,
                messaging_config: {
                    supports_ticket_initiation: true,
                },
            },
            {
                channel_id: legacyChannel!.id,
                messaging_config: {
                    supports_ticket_initiation: false,
                },
            },
        ] as Application[]

        const ticket = {}
        const channels = getReplyChannelsForTicket(ticket, applications)

        expect(channels).toEqual([newChannel])
        expect(channels).not.toContain(legacyChannel)
    })

    describe('if the ticket is new', () => {
        it('should only return the channels that have aplications that can initiate tickets', () => {
            const expectedChannel = getChannelBySlug('tiktok-shop')
            const excludedChannel = getChannelBySlug(
                'google-business-messenger',
            )
            const applications = [
                {
                    channel_id: expectedChannel!.id,
                    messaging_config: {
                        supports_ticket_initiation: true,
                    },
                },
                {
                    channel_id: excludedChannel!.id,
                    messaging_config: {
                        supports_ticket_initiation: false,
                    },
                },
            ] as Application[]

            const ticket = {}
            const channels = getReplyChannelsForTicket(ticket, applications)

            expect(channels).toEqual([expectedChannel])
            expect(channels).not.toContain(excludedChannel)
        })
    })

    describe('if the ticket exists', () => {
        it('should only return the channels that have aplications that can reply to tickets tickets AND are included in the reply options', () => {
            const expectedChannel = getChannelBySlug('tiktok-shop')
            const excludedChannel = getChannelBySlug(
                'google-business-messenger',
            )

            const applications = [
                {
                    channel_id: expectedChannel!.id,
                    messaging_config: {
                        supports_replies: true,
                    },
                },
                {
                    channel_id: excludedChannel!.id,
                    messaging_config: {
                        supports_replies: false,
                    },
                },
            ] as Application[]

            const ticket = {
                id: 3,
                reply_options: {
                    [expectedChannel!.slug]: {
                        answerable: true,
                    },
                },
            }
            const channels = getReplyChannelsForTicket(ticket, applications)

            expect(channels).toEqual([expectedChannel])
            expect(channels).not.toContain(excludedChannel)
        })

        it('should NOT return the channels that have aplications BUT are missing from reply_options', () => {
            const excludedChannel = getChannelBySlug('tiktok-shop')
            const applications = [
                {
                    channel_id: excludedChannel!.id,
                    messaging_config: {
                        supports_replies: true,
                    },
                },
            ] as Application[]

            const ticket = {
                id: 3,
                reply_options: {},
            }
            const channels = getReplyChannelsForTicket(ticket, applications)

            expect(channels).not.toContain(excludedChannel)
        })
    })
})

describe('getLegacyReplySourcesForTicket()', () => {
    it('should ONLY return legacy channels', () => {
        const integrations = [
            {
                type: 'email',
            },
            {
                type: 'app',
            },
            {
                type: 'tiktok-shop',
            },
        ] as Integration[]

        const ticket = {}
        const sources = getLegacyReplySourcesForTicket(ticket, integrations)

        expect(sources).toEqual(['email'])
        expect(sources).not.toContain('app')
        expect(sources).not.toContain('tiktok-shop')
    })

    describe('if the ticket is new', () => {
        it('should return an empty array if no other integrations exist', () => {
            expect(getLegacyReplySourcesForTicket({}, [])).toEqual([])
        })

        it('should only return the legacy channels that can initiate tickets', () => {
            const expectedSources = [
                'email',
                'phone',
                'sms',
                'whatsapp-message',
            ]

            const excludedSources = [
                'facebook-mention',
                'facebook-messenger',
                'facebook-recommendations',
            ]

            const integrations = [
                { type: 'email' },
                { type: 'phone' },
                { type: 'whatsapp' },
                { type: 'sms' },
                { type: 'facebook' },
                { type: 'twitter' },
            ] as Integration[]

            const ticket = {}
            const sources = getLegacyReplySourcesForTicket(ticket, integrations)

            expect(sources).toEqual(expectedSources)
            excludedSources.forEach((excludedSource) => {
                expect(sources).not.toContain(excludedSource)
            })
        })

        it('should return email source for all email integration types', () => {
            const emailSource = ['email']
            const emailIntegrations = [{ type: 'email' }] as Integration[]
            const gmailIntegrations = [{ type: 'gmail' }] as Integration[]
            const outlookIntegrations = [{ type: 'outlook' }] as Integration[]
            const ticket = {}
            expect(
                getLegacyReplySourcesForTicket(ticket, emailIntegrations),
            ).toEqual(emailSource)
            expect(
                getLegacyReplySourcesForTicket(ticket, gmailIntegrations),
            ).toEqual(emailSource)
            expect(
                getLegacyReplySourcesForTicket(ticket, outlookIntegrations),
            ).toEqual(emailSource)
        })

        it('should not return duplicates', () => {
            const emailSource = ['email']
            const ticket = {}
            const integrations = [
                { type: 'email' },
                { type: 'gmail' },
                { type: 'outlook' },
            ] as Integration[]

            expect(
                getLegacyReplySourcesForTicket(ticket, integrations),
            ).toEqual(emailSource)
        })
    })

    describe('if the ticket exists', () => {
        it('should return just "internal-note" if no other integrations exist', () => {
            expect(
                getLegacyReplySourcesForTicket(
                    {
                        id: 1,
                        reply_options: {
                            'internal-note': { answerable: true },
                        },
                    },
                    [],
                ),
            ).toEqual(['internal-note'])
        })

        it('should only return the legacy channels that have integrations and that are included in reply_options, ', () => {
            const expectedSources = [
                'internal-note',
                'email',
                'email-forward',
                'sms',
                'whatsapp-message',
            ]

            const excludedSources = ['phone', 'facebook-mention']

            const integrations = [
                { type: 'email' },
                { type: 'sms' },
                { type: 'whatsapp' },
                { type: 'facebook' },
                { type: 'twitter' },
            ] as Integration[]

            const ticket = {
                id: 3,
                reply_options: {
                    'internal-note': { answerable: true },
                    email: { answerable: true },
                    sms: { answerable: true },
                    'whatsapp-message': { answerable: true },
                },
            }
            const sources = getLegacyReplySourcesForTicket(ticket, integrations)

            expect(sources).toEqual(expectedSources)
            excludedSources.forEach((excludedSource) => {
                expect(sources).not.toContain(excludedSource)
            })
        })

        it('should NOT return the sources that have integrations BUT are missing from reply_options', () => {
            const excludedSources = ['internal-note', 'email', 'sms', 'phone']

            const integrations = [
                { type: 'email' },
                { type: 'sms' },
                { type: 'phone' },
            ] as Integration[]

            const ticket = {
                id: 3,
                reply_options: {},
            }
            const sources = getLegacyReplySourcesForTicket(ticket, integrations)

            expect(sources).toEqual([])
            excludedSources.forEach((excludedSource) => {
                expect(sources).not.toContain(excludedSource)
            })
        })

        it('should always include email-forward if email is present', () => {
            const emailSources = ['email', 'email-forward']

            const emailIntegrations = [{ type: 'email' }] as Integration[]
            const gmailIntegrations = [{ type: 'gmail' }] as Integration[]
            const outlookIntegrations = [{ type: 'outlook' }] as Integration[]

            const ticket = {
                id: 3,
                reply_options: {
                    email: { answerable: true },
                },
            }

            expect(
                getLegacyReplySourcesForTicket(ticket, emailIntegrations),
            ).toEqual(emailSources)
            expect(
                getLegacyReplySourcesForTicket(ticket, gmailIntegrations),
            ).toEqual(emailSources)
            expect(
                getLegacyReplySourcesForTicket(ticket, outlookIntegrations),
            ).toEqual(emailSources)
        })

        it('should split yotpo review into public and private replies', () => {
            const yotpoSources = [
                'yotpo-review-public-comment',
                'yotpo-review-private-comment',
            ]
            const yotpoIntegration = [{ type: 'yotpo' }] as Integration[]
            const ticket = {
                id: 3,
                reply_options: {
                    'yotpo-review': { answerable: true },
                },
            }

            expect(
                getLegacyReplySourcesForTicket(ticket, yotpoIntegration),
            ).toEqual(yotpoSources)
        })

        it('should not return duplicates', () => {
            const ticket = {
                id: 3,
                reply_options: {
                    'internal-note': { answerable: true },
                    email: { answerable: true },
                },
            }

            const integrations = [
                { type: 'email' },
                { type: 'gmail' },
                { type: 'outlook' },
            ] as Integration[]

            expect(
                getLegacyReplySourcesForTicket(ticket, integrations),
            ).toEqual(['internal-note', 'email', 'email-forward'])
        })
    })
})

describe('getSelectedChannel()', () => {
    it('should infer the selected channel from a given ticket message source', () => {
        expect(
            getSelectedChannel({ type: TicketMessageSourceType.Email }),
        ).toEqual('email')

        expect(
            getSelectedChannel({
                type: TicketMessageSourceType.Email,
                extra: { forward: true },
            }),
        ).toEqual('email-forward')

        expect(
            getSelectedChannel({
                type: 'tiktok-shop' as TicketMessageSourceType,
            }),
        ).toEqual(getChannelBySlug('tiktok-shop'))
    })
})

describe('useSendersForSelectedChannel()', () => {
    const renderHookWithStore = (store: Store) =>
        renderHook(() => useSendersForSelectedChannel(), {
            wrapper: ({ children }) => (
                <Provider store={store}>{children}</Provider>
            ),
        })

    describe('should return a list of senders (integrations) to use as source', () => {
        it('should return an empty list of senders if no channel is selected', () => {
            jest.mock('hooks/useOutboundChannels', () => ({
                useOutboundChannels: () => ({
                    selectedChannel: null,
                }),
            }))
            const store = configureMockStore()({
                integrations: fromJS({
                    integrations: [{ type: 'email' }],
                }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.senders).toEqual([])
        })

        it('should return a list of available senders when a channel is selected', () => {
            const store = configureMockStore()({
                newMessage: fromJS({
                    newMessage: {
                        source: {
                            type: 'tiktok-shop',
                        },
                    },
                }),
                integrations: fromJS({
                    integrations: [
                        {
                            id: 123,
                            type: 'app',
                            application_id: '64785607477d0a11fc731bfa',
                            name: 'The Shop',
                            meta: {
                                address: 'theshop',
                            },
                        },
                    ],
                }),
            })
            const { result } = renderHookWithStore(store)
            expect(result.current?.senders).toEqual([
                {
                    address: 'theshop',
                    name: 'The Shop',
                    displayName: 'The Shop (theshop)',
                    channel: 'tiktok-shop',
                    isDeactivated: false,
                    isDefault: false,
                },
            ])
        })

        describe('should allow managing the currently selected sender', () => {
            it('should have a default selected channel', () => {
                const store = configureMockStore()({
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                type: 'tiktok-shop',
                                from: {
                                    address: 'sendershop',
                                    name: 'Sender Shop',
                                },
                            },
                        },
                    }),
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 123,
                                type: 'app',
                                application_id: '64785607477d0a11fc731bfa',
                                name: 'Sender Shop',
                                meta: {
                                    address: 'sendershop',
                                },
                            },
                        ],
                    }),
                })
                const { result } = renderHookWithStore(store)
                expect(result.current?.selectedSender).toEqual({
                    address: 'sendershop',
                    name: 'Sender Shop',
                    displayName: 'Sender Shop (sendershop)',
                    channel: 'tiktok-shop',
                    isDeactivated: false,
                    isDefault: false,
                })
            })

            it('should allow changing the selected channel (via dispatch of newMessage.setSender) to another sender', () => {
                const store = configureMockStore()({
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                type: 'tiktok-shop',
                                from: {
                                    address: 'sendershop',
                                    name: 'Sender Shop',
                                },
                            },
                        },
                    }),
                    integrations: fromJS({
                        integrations: [
                            {
                                id: 123,
                                type: 'app',
                                application_id: '64785607477d0a11fc731bfa',
                                name: 'Sender Shop',
                                meta: {
                                    address: 'sendershop',
                                },
                            },
                        ],
                    }),
                })
                const { result } = renderHookWithStore(store)
                expect(result.current?.selectedSender).toEqual({
                    address: 'sendershop',
                    name: 'Sender Shop',
                    displayName: 'Sender Shop (sendershop)',
                    channel: 'tiktok-shop',
                    isDeactivated: false,
                    isDefault: false,
                })
                result?.current.selectSender({
                    address: 'anothershop',
                    name: 'Another Shop',
                    displayName: 'Another Shop (anothershop)',
                    channel: 'tiktok-shop',
                })
                expect(store.getActions()).toEqual([
                    {
                        type: 'MOCKED_SET_SENDER',
                        payload: 'anothershop',
                    },
                ])
            })
        })
    })
})
