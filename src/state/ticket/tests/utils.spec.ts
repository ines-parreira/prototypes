import { fromJS, List, Map } from 'immutable'
import { omit } from 'lodash'

import { appQueryClient } from 'api/queryClient'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from 'business/types/ticket'
import { channels as mockChannels } from 'fixtures/channels'
import { integrationsState } from 'fixtures/integrations'
import {
    addInternalNoteAction,
    addTagsAction,
    httpAction,
    setClosedStatusAction,
    setOpenStatusAction,
    setSubjectAction,
    shopifyAction,
} from 'fixtures/macro'
import {
    GorgiasContactFormTicketMeta,
    Source,
    TicketMessage,
} from 'models/ticket/types'
import { UseListVoiceCalls, voiceCallsKeys } from 'models/voiceCall/queries'
import { VoiceCall } from 'models/voiceCall/types'
import { getPersonLabelFromSource } from 'pages/tickets/common/utils'
import * as channelsService from 'services/channels'
import {
    AccountSettingDefaultIntegration,
    AccountSettingType,
} from 'state/currentAccount/types'
import { getEmailChannels } from 'state/integrations/selectors'
import { TICKET_CHANNEL_NAMES } from 'state/ticket/constants'
import { RootState } from 'state/types'
import * as utils from 'utils'

import {
    buildFirstTicketMessage,
    getNewMessageSender,
    getOutboundCallFrom,
    getPendingMessageIndex,
    getPreferredChannel,
    getSourceTypeOfResponse,
    guessReceiversFromTicket,
    humanizeAddress,
    humanizeChannel,
    isReceiver,
    isSupportAddress,
    mergeActions,
    mergeInternalNoteActions,
    persistLastSenderChannel,
    Receivers,
    receiversStateFromValue,
    ReceiversValue,
    receiversValueFromState,
} from '../utils'
import {
    chatContactFormTicket,
    chatTicket,
    emailTicket,
    facebookPost,
    helpCenterContactFormTicketViaSendgridWithInternalNote,
    helpCenterContactFormTicketViaSengrid,
    helpCenterContactFormViaApi,
    helpCenterContactFormViaApiNoSelectedEmail,
    helpCenterContactFormViaApiUnavailableEmail,
    smsTicket,
    standaloneContactFormViaApi,
    standaloneContactFormViaApiNoSelectedEmail,
    standaloneContactFormViaApiUnavailableEmail,
    standaloneContactFormViaSengrid,
    standaloneContactFormViaSengridNoSelectedEmail,
    twitterQuotedTweet,
    twitterTweet,
    whatsAppTicket,
} from './fixtures'

const customers = {
    email: [
        {
            name: 'Support',
            address: 'support@acme.com',
        },
        {
            name: 'Nicolas',
            address: 'nico@las.com',
        },
        {
            name: 'Julie',
            address: 'ju@lie.com',
        },
        {
            name: 'Fabien',
            address: 'fa@bien.com',
        },
    ],
    chat: [
        {
            name: 'Support',
            address: '0987654321',
        },
        {
            name: 'Nicolas',
            address: '1234567890',
        },
        {
            name: 'Julie',
            address: '2345678901',
        },
    ],
}

const ticket = fromJS({
    customer: {
        name: 'Patrick',
        channels: [
            {
                address: 'nico@las.com',
                id: 5,
                preferred: false,
                type: 'email',
            },
            {
                address: 'support@acme.com',
                id: 6,
                preferred: false,
                type: 'email',
            },
            {
                address: 'ju@lie.com',
                id: 4,
                preferred: true,
                type: 'email',
            },
            {
                address: '0987654321',
                id: 7,
                preferred: true,
                type: 'chat',
            },
        ],
    },
    messages: [
        {
            from_agent: false,
            source: {
                type: 'chat',
                to: [customers.chat[0]],
                from: customers.chat[1],
            },
        },
        {
            from_agent: true,
            source: {
                type: 'chat',
                to: [customers.chat[1]],
                from: customers.chat[0],
            },
        },
        {
            from_agent: true,
            source: {
                type: 'internal-note',
            },
        },
        {
            from_agent: false,
            source: {
                type: 'email',
                to: [customers.email[0]],
                from: customers.email[1],
            },
        },
        {
            from_agent: true,
            source: {
                type: 'email',
                to: [customers.email[1], customers.email[2]],
                cc: [customers.email[3]],
                from: customers.email[0],
            },
        },
        {
            from_agent: true,
            source: {
                type: 'internal-note',
            },
        },
    ],
}) as Map<any, any>

const receiversExample = guessReceiversFromTicket(
    ticket,
    TicketMessageSourceType.Email,
)
const receiversValueExample = {
    to: [
        {
            name: customers.email[1].name,
            label: getPersonLabelFromSource(
                customers.email[1],
                TicketMessageSourceType.Email,
            ),
            value: customers.email[1].address,
        },
        {
            name: customers.email[2].name,
            label: getPersonLabelFromSource(
                customers.email[2],
                TicketMessageSourceType.Email,
            ),
            value: customers.email[2].address,
        },
    ],
    cc: [
        {
            name: customers.email[3].name,
            label: getPersonLabelFromSource(
                customers.email[3],
                TicketMessageSourceType.Email,
            ),
            value: customers.email[3].address,
        },
    ],
}
const receiversStateExample = {
    to: [
        {
            name: receiversValueExample.to[0].name,
            address: receiversValueExample.to[0].value,
        },
        {
            name: receiversValueExample.to[1].name,
            address: receiversValueExample.to[1].value,
        },
    ],
    cc: [
        {
            name: receiversValueExample.cc[0].name,
            address: receiversValueExample.cc[0].value,
        },
    ],
} as Receivers
const channels = getEmailChannels({
    integrations: fromJS(integrationsState),
} as RootState)
const integrations = fromJS([])

describe('ticket utils', () => {
    describe('getSourceTypeOfResponse()', () => {
        it('should return message source type "internal-note" for Twilio ticket that has no message', () => {
            const messages: unknown[] = []
            const via = TicketVia.Twilio

            expect(getSourceTypeOfResponse(messages, via, 1)).toEqual(
                TicketMessageSourceType.InternalNote,
            )
        })

        it('should return message source type "internal-note" for Twilio ticket that has one internal note', () => {
            const messages = [
                { source: { type: TicketMessageSourceType.InternalNote } },
            ]
            const via = TicketVia.Twilio

            expect(getSourceTypeOfResponse(messages, via, 1)).toEqual(
                TicketMessageSourceType.InternalNote,
            )
        })
    })

    describe('guessReceiversFromTicket()', () => {
        it('guess receivers empty', () => {
            const updatedTicket = ticket.delete('messages').delete('customer')
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email,
            )

            expect(receivers).toEqual({
                to: [],
            })
        })

        it('guess receivers email', () => {
            const receivers = guessReceiversFromTicket(
                ticket,
                TicketMessageSourceType.Email,
            )

            expect(receivers).toEqual({
                to: [customers.email[1], customers.email[2]],
                cc: [customers.email[3]],
            })
        })

        it('guess receivers email inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket.setIn(
                ['messages', 4, 'from_agent'],
                false,
            )
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email,
            )

            expect(receivers).toEqual({
                to: [customers.email[0]],
                cc: [customers.email[3]],
            })
        })

        it('guess receivers chat', () => {
            const receivers = guessReceiversFromTicket(
                ticket,
                TicketMessageSourceType.Chat,
            )

            expect(receivers).toEqual({
                to: [customers.chat[1]],
            })
        })

        it('guess receivers with source.from.name set to null in chat tickets', () => {
            const updatedCustomer = {
                name: 'Patrick',
                channels: [
                    {
                        address: '0987654321',
                        id: 7,
                        preferred: true,
                        type: 'chat',
                    },
                    {
                        address: '1234567890',
                        id: 8,
                        preferred: false,
                        type: 'chat',
                    },
                ],
            }
            const updatedTicket = fromJS({
                customer: updatedCustomer,
                messages: [
                    {
                        from_agent: false,
                        source: {
                            type: 'chat',
                            to: [{ name: '', address: '' }],
                            from: { name: null, address: '1234567890' },
                        },
                    },
                ],
            }) as Map<any, any>
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Chat,
            )

            expect(receivers).toEqual({
                to: [{ name: null, address: '1234567890' }],
            })
        })

        it('guess receivers chat inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket.setIn(
                ['messages', 1, 'from_agent'],
                false,
            )
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Chat,
            )

            expect(receivers).toEqual({
                to: [customers.chat[0]],
            })
        })

        it('guess receivers from customer email', () => {
            const updatedTicket = ticket.delete('messages')
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email,
            )

            const receiver = {
                ...customers.email[2],
                name: updatedTicket.getIn(['customer', 'name']),
            }

            expect(receivers).toEqual({
                to: [receiver],
            })
        })

        it('guess receivers from customer chat', () => {
            const updatedTicket = ticket.delete('messages')
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Chat,
            )

            const receiver = {
                ...customers.chat[0],
                name: updatedTicket.getIn(['customer', 'name']),
            }

            expect(receivers).toEqual({
                to: [receiver],
            })
        })
    })

    describe('receiversValueFromState()', () => {
        expect(
            receiversValueFromState(
                receiversExample,
                TicketMessageSourceType.Email,
            ),
        ).toEqual(receiversValueExample)
    })

    describe('receiversStateFromValue()', () => {
        it('should return receivers from value', () => {
            expect(
                receiversStateFromValue(
                    receiversValueExample as unknown as ReceiversValue,
                    TicketMessageSourceType.Email,
                ),
            ).toEqual(receiversStateExample)
        })
    })

    describe('getPreferredChannel()', () => {
        it('should return preferred', () => {
            const expected = channels.find((channel: Map<any, any>) => {
                return (channel.get('type') === 'email' &&
                    channel.get('preferred', false)) as boolean
            })
            expect(
                getPreferredChannel(TicketMessageSourceType.Email, channels),
            ).toEqualImmutable(expected)
        })

        it('should return first', () => {
            // remove preferred channels of the list
            const _chans = channels.filter(
                (channel: Map<any, any>) =>
                    channel.get('preferred', false) === false,
            ) as List<any>
            const expected = _chans.find(
                (channel: Map<any, any>) => channel.get('type') === 'email',
            )
            expect(
                getPreferredChannel(TicketMessageSourceType.Email, _chans),
            ).toEqualImmutable(expected)
        })

        it('should return empty Map', () => {
            expect(
                getPreferredChannel(
                    'skype' as TicketMessageSourceType,
                    channels,
                ),
            ).toEqualImmutable(fromJS({}))
        })
    })

    describe('getNewMessageSender()', () => {
        describe('Contact Form', () => {
            const integrationsWithSelectedEmail = fromJS({
                integrations: [
                    {
                        deleted_datetime: null,
                        mappings: [],
                        meta: {
                            address: 'selected-email-integration@email.com',
                        },
                        deactivated_datetime: null,
                        name: 'An email integration',
                        user: {
                            id: 2,
                        },
                        uri: '/api/integrations/100/',
                        decoration: null,
                        locked_datetime: null,
                        created_datetime: '2017-02-07T06:07:43.481450+00:00',
                        type: 'email',
                        id: 1,
                        description: null,
                        updated_datetime: '2017-02-07T06:07:43.481517+00:00',
                    },
                ],
            })

            const defaultIntegrationSetting: AccountSettingDefaultIntegration =
                {
                    id: 1,
                    type: AccountSettingType.DefaultIntegration,
                    data: { email: 15 },
                }

            it('should return `to` field from first message from shopper (help center contact form - via email)', () => {
                const expected = helpCenterContactFormTicketViaSengrid.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                expect(
                    getNewMessageSender(
                        helpCenterContactFormTicketViaSengrid,
                        TicketMessageSourceType.HelpCenterContactForm,
                        channels,
                        integrationsWithSelectedEmail,
                    ),
                ).toEqualImmutable(expected)
            })

            it('should return `to` field from second message from shopper when first is internal note (help center contact form - via email', () => {
                /* first message is an internal note, second message is from shopper */
                const expected =
                    helpCenterContactFormTicketViaSendgridWithInternalNote.getIn(
                        ['messages', 1, 'source', 'to', 0],
                    )
                expect(
                    getNewMessageSender(
                        helpCenterContactFormTicketViaSendgridWithInternalNote,
                        TicketMessageSourceType.HelpCenterContactForm,
                        channels,
                        integrationsWithSelectedEmail,
                    ),
                ).toEqualImmutable(expected)
            })

            it('should return `to` field from first message from shopper (standalone contact form - via email)', () => {
                const expected = standaloneContactFormViaSengrid.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                expect(
                    getNewMessageSender(
                        standaloneContactFormViaSengrid,
                        TicketMessageSourceType.ContactForm,
                        channels,
                        integrationsWithSelectedEmail,
                    ),
                ).toEqualImmutable(expected)
            })

            it('should return `to` field from first message from shopper (help center contact form - via API)', () => {
                const expected = helpCenterContactFormViaApi.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                expect(
                    getNewMessageSender(
                        helpCenterContactFormViaApi,
                        TicketMessageSourceType.ContactForm,
                        channels,
                        integrationsWithSelectedEmail,
                    ),
                ).toEqualImmutable(expected)
            })

            it('should return `to` field from first message from shopper (standalone contact form - via API)', () => {
                const expected = standaloneContactFormViaApi.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                expect(
                    getNewMessageSender(
                        standaloneContactFormViaApi,
                        TicketMessageSourceType.ContactForm,
                        channels,
                        integrationsWithSelectedEmail,
                    ),
                ).toEqualImmutable(expected)
            })

            it.each([
                standaloneContactFormViaApiNoSelectedEmail,
                helpCenterContactFormViaApiNoSelectedEmail,
                standaloneContactFormViaSengridNoSelectedEmail,
            ])(
                'should fallback to the helpdesk default email integration when no selected-email integration is found in the ticket - $#',
                (ticket) => {
                    expect(
                        getNewMessageSender(
                            ticket,
                            TicketMessageSourceType.ContactForm,
                            channels,
                            integrationsWithSelectedEmail,
                            defaultIntegrationSetting,
                        ),
                    ).toEqual(
                        fromJS({
                            preferred: true,
                            isDeactivated: false,
                            reconnectUrl: undefined,
                            verified: true,
                            name: 'Acme Contact',
                            address: 'contact@acme.com',
                            isDefault: false,
                            signature: undefined,
                            type: 'email',
                            id: 15,
                        }),
                    )
                },
            )

            it.each([
                helpCenterContactFormViaApiUnavailableEmail,
                standaloneContactFormViaApiUnavailableEmail,
            ])(
                'should fallback to the helpdesk default email integration when the email integration found in the ticket is not available anymore - $#',
                (ticket) => {
                    expect(
                        getNewMessageSender(
                            ticket,
                            TicketMessageSourceType.ContactForm,
                            channels,
                            integrationsWithSelectedEmail,
                            defaultIntegrationSetting,
                        ),
                    ).toEqual(
                        fromJS({
                            preferred: true,
                            isDeactivated: false,
                            reconnectUrl: undefined,
                            verified: true,
                            name: 'Acme Contact',
                            address: 'contact@acme.com',
                            isDefault: false,
                            signature: undefined,
                            type: 'email',
                            id: 15,
                        }),
                    )
                },
            )
        })

        it('should return `from` field from last message from agent (chat, messenger)', () => {
            const expected = chatTicket.getIn(['messages', 1, 'source', 'from'])
            expect(
                getNewMessageSender(
                    chatTicket,
                    TicketMessageSourceType.Chat,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent (facebook post)', () => {
            const expected = facebookPost.getIn([
                'messages',
                1,
                'source',
                'from',
            ])
            expect(
                getNewMessageSender(
                    facebookPost,
                    TicketMessageSourceType.FacebookComment,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (chat, messenger)', () => {
            // delete last message from agent
            const _chatTicket = chatTicket.deleteIn(['messages', 1])
            const expected = _chatTicket.getIn([
                'messages',
                0,
                'source',
                'to',
                0,
            ])
            expect(
                getNewMessageSender(
                    _chatTicket,
                    TicketMessageSourceType.Chat,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (facebook post)', () => {
            // delete last message from agent
            const _facebookPost = facebookPost.deleteIn(['messages', 1])
            const expected = _facebookPost.getIn([
                'messages',
                0,
                'source',
                'to',
                0,
            ])
            expect(
                getNewMessageSender(
                    _facebookPost,
                    TicketMessageSourceType.FacebookComment,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it.each([
            {
                tweet: twitterTweet,
                sourceType: TicketMessageSourceType.TwitterTweet,
            },
            {
                tweet: twitterQuotedTweet,
                sourceType: TicketMessageSourceType.TwitterQuotedTweet,
            },
        ])(
            'should return `to` field from last message from customer (twitter tweet/quoted tweet)',
            (testData) => {
                // delete last message from agent
                const expected = testData.tweet.getIn([
                    'messages',
                    0,
                    'source',
                    'to',
                    0,
                ])
                expect(
                    getNewMessageSender(
                        testData.tweet,
                        testData.sourceType,
                        channels,
                        integrations,
                    ),
                ).toEqualImmutable(expected)
            },
        )

        it('should return preferred channel', () => {
            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels,
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent', () => {
            const from = emailTicket.getIn([
                'messages',
                1,
                'source',
                'from',
            ]) as Map<any, any>
            const expected = channels.find(
                (channel: Map<any, any>) =>
                    channel.get('address') === from.get('address'),
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent (WhatsApp)', () => {
            const from = whatsAppTicket.getIn([
                'messages',
                0,
                'source',
                'from',
            ]) as Map<any, any>
            const channels = [
                {
                    address: '+15550233522',
                    id: 7,
                    type: 'whatsapp',
                },
                {
                    address: from.get('address'),
                    id: 3,
                    type: 'whatsapp',
                },
                {
                    address: '+15550233511',
                    id: 5,
                    type: 'whatsapp',
                },
            ]
            const expected = channels.find(
                (channel) => channel.address === from.get('address'),
            )
            expect(
                getNewMessageSender(
                    whatsAppTicket,
                    TicketMessageSourceType.WhatsAppMessage,
                    fromJS(channels) as List<any>,
                    integrations,
                ).toJS(),
            ).toEqual(expected)
        })

        it('should return `from` field from last message from agent (SMS)', () => {
            const from = smsTicket.getIn([
                'messages',
                0,
                'source',
                'from',
            ]) as Map<any, any>
            const channels = [
                {
                    address: '+15550233522',
                    id: 7,
                    type: 'sms',
                },
                {
                    address: from.get('address'),
                    id: 3,
                    type: 'sms',
                },
                {
                    address: '+15550233511',
                    id: 5,
                    type: 'sms',
                },
            ]
            const expected = channels.find(
                (channel) => channel.address === from.get('address'),
            )
            expect(
                getNewMessageSender(
                    smsTicket,
                    TicketMessageSourceType.Sms,
                    fromJS(channels) as List<any>,
                    integrations,
                ).toJS(),
            ).toEqual(expected)
        })

        it('should return `from` field from associated email of integration (chat ticket)', () => {
            const emailIntegrationId = integrationsState.integrations.find(
                (integration) =>
                    integration.id ===
                    chatTicket.getIn(['messages', 0, 'integration_id']),
            )?.meta?.preferences?.linked_email_integration

            const expected = fromJS(
                channels.find(
                    (channel: Map<any, any>) =>
                        emailIntegrationId === channel.get('id'),
                ),
            )
            expect(
                getNewMessageSender(
                    chatTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    fromJS(integrationsState),
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from associated email of integration (chat-contact-form ticket)', () => {
            const emailIntegrationId = integrationsState.integrations.find(
                (integration) =>
                    integration.id ===
                    chatContactFormTicket.getIn([
                        'messages',
                        0,
                        'integration_id',
                    ]),
            )?.meta?.preferences?.linked_email_integration

            const expected = fromJS(
                channels.find(
                    (channel: Map<any, any>) =>
                        emailIntegrationId === channel.get('id'),
                ),
            )
            expect(
                getNewMessageSender(
                    chatContactFormTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    fromJS(integrationsState),
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from last email message (chat ticket)', () => {
            const ticket: Map<any, any> = fromJS({
                messages: [
                    chatTicket.get('messages'),
                    {
                        source: {
                            to: [
                                {
                                    name: 'Steve Frizeli',
                                    address: 'steve.frizeli@gmail.com',
                                },
                            ],
                            from: {
                                name: 'Acme Support',
                                address: 'support@acme.gorgias.io',
                            },
                            type: 'email',
                        },
                        id: 152,
                        from_agent: true,
                        integration_id: 8,
                    },
                ],
            })
            const emailIntegrationValue = (
                (ticket.get('messages') as List<any>).last() as Map<any, any>
            ).getIn(['source', 'from', 'address'])

            const expected = fromJS(
                channels.find(
                    (channel: Map<any, any>) =>
                        emailIntegrationValue === channel.get('address'),
                ),
            )
            expect(
                getNewMessageSender(
                    ticket,
                    TicketMessageSourceType.Email,
                    channels,
                    fromJS(integrationsState),
                ),
            ).toEqualImmutable(expected)
        })

        it('should return `from` field from default email when integration is not found (chat ticket)', () => {
            const expected = channels.find((channel: Map<any, any>) => {
                return (channel.get('type') === 'email' &&
                    channel.get('preferred', false)) as boolean
            })
            const ticket = fromJS({
                messages: [
                    {
                        source: {
                            from: {
                                address: '8765645678',
                                name: 'Chani',
                            },
                            type: 'chat',
                            to: [
                                {
                                    address: '1232353100194770',
                                    name: 'Paul Atréides',
                                },
                            ],
                            cc: [],
                        },
                        id: 189,
                        from_agent: true,
                        integration_id: 0,
                    },
                ],
            })
            expect(
                getNewMessageSender(
                    ticket,
                    TicketMessageSourceType.Email,
                    channels,
                    fromJS(integrationsState),
                ),
            ).toEqualImmutable(expected)
        })

        it('should return channel in `to` field from last message from customer (email found in `to`)', () => {
            // delete last message from agent
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const to = _emailTicket.getIn([
                'messages',
                0,
                'source',
                'to',
                1,
            ]) as Map<any, any>
            const expected = channels.find(
                (channel: Map<any, any>) =>
                    channel.get('address') === to.get('address'),
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
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
            const cc = _emailTicket.getIn([
                'messages',
                0,
                'source',
                'cc',
                1,
            ]) as Map<any, any>
            const expected = channels.find(
                (channel: Map<any, any>) =>
                    channel.get('address') === cc.get('address'),
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return preferred email (email in `from` does not match any integration)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.setIn(
                ['messages', 1, 'source', 'from'],
                fromJS({ name: 'foo', address: 'unknown@gorgias.io' }),
            )
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels,
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return preferred email (email not found in `from`)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.deleteIn(['messages', 0])
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels,
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)
        })

        it('should return an empty name and address (internal-note)', () => {
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.InternalNote,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(
                fromJS({
                    name: '',
                    address: '',
                }),
            )
        })

        it('should get the sender channel from localStorage', () => {
            const testChannel = fromJS({
                name: 'test',
                address: 'test@gorgias.io',
            })
            persistLastSenderChannel(testChannel)

            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))

            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels,
            )

            // persisted channel is not present in the channels list so the preferred channel should be returned
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels,
                    integrations,
                ),
            ).toEqualImmutable(expected)

            // update the channel list and we should get the persisted channel
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels.push(testChannel),
                    integrations,
                ),
            ).toEqualImmutable(testChannel)
        })

        describe('default integration', () => {
            it('should return the default integration if set', () => {
                const _emailTicket = emailTicket.set('messages', fromJS([]))
                const expected = channels.find(
                    (c: Map<any, any>) => c.get('id') === 15,
                )
                expect(
                    getNewMessageSender(
                        _emailTicket,
                        TicketMessageSourceType.Email,
                        channels,
                        integrations,
                        {
                            id: 10,
                            type: AccountSettingType.DefaultIntegration,
                            data: {
                                email: 15,
                            },
                        },
                    ),
                ).toEqualImmutable(expected)
            })

            it('should not return the default if not part of the available channels', () => {
                const _emailTicket = emailTicket.set('messages', fromJS([]))
                const expected = channels.find(
                    (c: Map<any, any>) => c.get('id') === 1,
                )
                expect(
                    getNewMessageSender(
                        _emailTicket,
                        TicketMessageSourceType.Email,
                        channels,
                        integrations,
                        {
                            id: 10,
                            type: AccountSettingType.DefaultIntegration,
                            data: {
                                email: 999,
                            },
                        },
                    ),
                ).toEqualImmutable(expected)
            })

            it('should use the default behaviour if the setting is missing', () => {
                const _emailTicket = emailTicket.set('messages', fromJS([]))
                const expected = channels.find(
                    (c: Map<any, any>) => c.get('id') === 1,
                )
                expect(
                    getNewMessageSender(
                        _emailTicket,
                        TicketMessageSourceType.Email,
                        channels,
                        integrations,
                    ),
                ).toEqualImmutable(expected)
            })
        })

        it('should get the sender channel from ticket events', () => {
            const integrationId = 1

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: ticket.get('id') }),
                {
                    data: [
                        {
                            integration_id: integrationId,
                        } as VoiceCall,
                    ],
                } as any,
            )

            const newMessageSourceType = TicketMessageSourceType.Phone
            const expectedSender = fromJS({
                id: integrationId,
                name: 'Acme Phone',
                address: '+14151112222',
            })
            const channels = fromJS([expectedSender])

            expect(
                getNewMessageSender(
                    ticket,
                    newMessageSourceType,
                    channels,
                    integrations,
                ),
            ).toEqual(expectedSender)
        })

        it('should get the sender channel mapped from ticket source type', () => {
            const integrationId = 1
            const newMessageSourceType = TicketMessageSourceType.WhatsAppMessage
            const expectedSender = fromJS({
                type: TicketChannel.WhatsApp,
                id: integrationId,
                name: 'Acme Phone',
                address: '+14151112222',
            })
            const channels = fromJS([expectedSender])

            expect(
                getNewMessageSender(
                    ticket,
                    newMessageSourceType,
                    channels,
                    integrations,
                ),
            ).toEqual(expectedSender)
        })

        it(
            "should get the sender from last message's integration ID before falling" +
                'back on the preferred one',
            () => {
                const integrationId = 42
                const expectedSender = {
                    id: integrationId,
                    type: 'email',
                    name: 'Acme Billing',
                    address: 'billing@acme.gorgias.io',
                    preferred: false,
                    signature: {
                        text: 'cheers, ',
                        html: 'cheers, <strong></strong>',
                    },
                    verified: true,
                    isDeactivated: false,
                    reconnectUrl: undefined,
                }
                const channels = fromJS([
                    expectedSender,
                    {
                        id: 1,
                        type: 'email',
                        name: 'Acme Support',
                        address: 'support@acme.gorgias.io',
                        preferred: true,
                        signature: {
                            text: 'cheers, ',
                            html: 'cheers, <strong></strong>',
                        },
                        verified: true,
                        isDeactivated: false,
                        reconnectUrl: undefined,
                    },
                ])
                const ticket = fromJS({
                    customer: {
                        name: 'Patrick',
                        channels: [
                            {
                                address: 'nico@las.com',
                                id: 5,
                                preferred: true,
                                type: 'email',
                            },
                        ],
                    },
                    messages: [
                        {
                            from_agent: false,
                            integration_id: integrationId,
                            source: {
                                type: 'email',
                                to: [
                                    {
                                        name: '',
                                        address:
                                            'billing-alias@acme.gorgias.io',
                                    },
                                ],
                                from: {
                                    name: 'Patrick',
                                    address: 'nico@las.com',
                                },
                            },
                        },
                    ],
                })

                expect(
                    getNewMessageSender(
                        ticket,
                        TicketMessageSourceType.Email,
                        channels,
                        fromJS([]),
                    ),
                ).toEqual(fromJS(expectedSender))
            },
        )

        it('should disregard failed messages when cosidering the last message', () => {
            const integrationId = 42
            const channels = fromJS([
                {
                    id: integrationId,
                    type: 'email',
                    name: 'Acme Billing',
                    address: 'billing@acme.gorgias.io',
                    preferred: false,
                    signature: {
                        text: 'cheers, ',
                        html: 'cheers, <strong></strong>',
                    },
                    verified: true,
                    isDeactivated: false,
                    reconnectUrl: undefined,
                },
                {
                    id: 1,
                    type: 'email',
                    name: 'Acme Support',
                    address: 'support@acme.gorgias.io',
                    preferred: true,
                    signature: {
                        text: 'cheers, ',
                        html: 'cheers, <strong></strong>',
                    },
                    verified: true,
                    isDeactivated: false,
                    reconnectUrl: undefined,
                },
            ])
            const ticket = fromJS({
                customer: {
                    name: 'Patrick',
                    channels: [
                        {
                            address: 'nico@las.com',
                            id: 5,
                            preferred: true,
                            type: 'email',
                        },
                    ],
                },
                messages: [
                    {
                        from_agent: false,
                        integration_id: integrationId,
                        failed_datetime: Date.now(),
                        source: {
                            type: 'email',
                            to: [
                                {
                                    name: '',
                                    address: 'billing-alias@acme.gorgias.io',
                                },
                            ],
                            from: {
                                name: 'Patrick',
                                address: 'nico@las.com',
                            },
                        },
                    },
                ],
            })

            expect(
                getNewMessageSender(
                    ticket,
                    TicketMessageSourceType.Email,
                    channels,
                    fromJS([]),
                ),
            ).toEqual(
                fromJS({
                    id: 1,
                    type: 'email',
                    name: 'Acme Support',
                    address: 'support@acme.gorgias.io',
                    preferred: true,
                    signature: {
                        text: 'cheers, ',
                        html: 'cheers, <strong></strong>',
                    },
                    verified: true,
                    isDeactivated: false,
                    reconnectUrl: undefined,
                }),
            )
        })
    })

    describe('getOutboundCallFrom()', () => {
        const emptySender = fromJS({ id: null, name: '', address: '' })
        const getValidSender = (id: number) =>
            fromJS({ id, name: 'Acme Phone', address: '+14151112222' }) as Map<
                any,
                any
            >

        it('should return empty sender because there is no channel', () => {
            const ticket = fromJS({})
            const channels = fromJS([])
            expect(getOutboundCallFrom(ticket, channels)).toEqual(emptySender)
        })

        it('should return first channel because there is no voice call', () => {
            const ticket = fromJS({ id: 1 }) as Map<any, any>
            const channel = getValidSender(1)
            const channels = fromJS([channel])

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: ticket.get('id') }),
                {
                    data: [],
                } as any,
            )

            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })

        it('should return first channel because ticket channel is not defined in the channels list', () => {
            const ticket = fromJS({ id: 1 }) as Map<any, any>
            const channel = getValidSender(2)
            const channels = fromJS([channel])

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: ticket.get('id') }),
                {
                    data: [
                        {
                            integration_id: 1,
                        } as VoiceCall,
                    ],
                } as any,
            )

            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })

        it('should return ticket channel because it is defined in the channels list', () => {
            const ticket = fromJS({ id: 1 }) as Map<any, any>
            const channel = getValidSender(2)
            const channels = fromJS([getValidSender(1), channel])

            appQueryClient.setQueryData<UseListVoiceCalls>(
                voiceCallsKeys.list({ ticket_id: ticket.get('id') }),
                {
                    data: [
                        {
                            integration_id: 2,
                        } as VoiceCall,
                        {
                            integration_id: 1,
                        } as VoiceCall,
                    ],
                } as any,
            )

            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })
    })

    describe('mergeInternalNoteActions', () => {
        it('should merge internal note actions', () => {
            const oldAction = fromJS({
                arguments: { body_text: 'foo', body_html: 'foo' },
            })
            const newAction = fromJS({
                arguments: { body_text: 'bar', body_html: 'bar' },
            })
            expect(
                mergeInternalNoteActions(oldAction, newAction),
            ).toMatchSnapshot()
        })
    })

    describe('mergeActions', () => {
        it('should merge http hooks', () => {
            const oldActions = fromJS([
                httpAction,
                { ...httpAction, title: 'title2' },
            ])
            const newActions = fromJS([
                httpAction,
                { ...httpAction, title: 'title2' },
                { ...httpAction, title: 'title3' },
            ])
            expect(
                mergeActions(oldActions, newActions)
                    .map(
                        (action: Map<any, any>) =>
                            action.get('title') as string,
                    )
                    .toJS(),
            ).toEqual(['Refund Last Month', 'title2', 'title3'])
        })

        it('should handle tag stacking', () => {
            const oldActions = fromJS([addTagsAction])
            const newActions = fromJS([
                { ...addTagsAction, arguments: { tags: 'refund,paid' } },
            ])

            expect(
                mergeActions(oldActions, newActions).getIn([
                    0,
                    'arguments',
                    'tags',
                ]),
            ).toEqual('refund,billing,refund accepted,paid') // doesn't duplicate refund and adds paid
        })

        it('should handle new actions stacking', () => {
            const oldActions = fromJS([addTagsAction])
            const newActions = fromJS([httpAction, shopifyAction])

            expect(
                mergeActions(oldActions, newActions)
                    .map(
                        (action: Map<any, any>) => action.get('name') as string,
                    )
                    .toJS(),
            ).toEqual(['http', 'shopifyFullRefundLastOrder', 'addTags'])
        })

        it('should handle internal note stacking', () => {
            const action = fromJS([addInternalNoteAction])
            const result = mergeActions(action, action)

            expect(
                result
                    .map(
                        (action: Map<any, any>) => action.get('name') as string,
                    )
                    .toJS(),
            ).toEqual(['addInternalNote']) // actions got merged

            expect(result.getIn([0, 'arguments', 'body_text'])).toEqual(
                'Hello\nHello',
            ) //Body got concatenated
        })

        it('should not squash old actions with the same name', () => {
            const oldActions = fromJS([httpAction, httpAction])
            const newActions = fromJS([setClosedStatusAction])

            expect(mergeActions(oldActions, newActions).toJS()).toEqual([
                setClosedStatusAction,
                httpAction,
                httpAction,
            ])
        })

        it('should handle same actions stacking', () => {
            const oldActions = fromJS([setOpenStatusAction, setSubjectAction])
            const newActions = fromJS([
                setClosedStatusAction,
                {
                    ...setSubjectAction,
                    arguments: { subject: 'Test Verb' },
                },
            ])

            expect(
                mergeActions(oldActions, newActions).toJS(),
            ).toMatchSnapshot() //Only keep the last actions values
        })
    })

    describe('isSupportAddress', () => {
        it('should return true for support address (including aliases)', () => {
            expect(
                isSupportAddress('test@gorgias.com', ['test@gorgias.com']),
            ).toBe(true)
            expect(
                isSupportAddress('test+1@gorgias.com', ['test@gorgias.com']),
            ).toBe(true)
            expect(
                isSupportAddress('TEST+1@gorgias.com', ['test@gorgias.com']),
            ).toBe(true)
            expect(
                isSupportAddress('test+1@gorgias.com', ['TEST@gorgias.com']),
            ).toBe(true)
        })

        it('should return false for non support address', () => {
            expect(isSupportAddress('test@gorgias.com', [])).toEqual(false)
            expect(
                isSupportAddress('test@gorgias.com', ['testing@gorgias.com']),
            ).toEqual(false)
        })

        it('should return true for support phone numbers', () => {
            expect(isSupportAddress('+12133734253', ['+12133734253'])).toBe(
                true,
            )
            expect(
                isSupportAddress(
                    '+12133734253',
                    ['+12133734253'],
                    TicketMessageSourceType.Phone,
                ),
            ).toBe(true)
            expect(
                isSupportAddress(
                    '+1 213 373 4253',
                    ['+12133734253'],
                    TicketMessageSourceType.Phone,
                ),
            ).toBe(true)
            expect(
                isSupportAddress(
                    '+12133734253',
                    ['+1 (213) 373 4253'],
                    TicketMessageSourceType.Phone,
                ),
            ).toBe(true)
        })
    })

    describe('isReceiver', () => {
        it('should return false when input is not receiver', () => {
            expect(isReceiver(null)).toBe(false)
            expect(isReceiver(undefined)).toBe(false)
            expect(isReceiver('')).toBe(false)
            expect(isReceiver({})).toBe(false)
            expect(
                isReceiver({
                    name: 'test',
                }),
            ).toBe(false)
            expect(
                isReceiver({
                    address: 'test',
                }),
            ).toBe(false)
            expect(
                isReceiver({
                    name: 123,
                    address: 'test',
                }),
            ).toBe(false)
            expect(
                isReceiver({
                    name: 'test',
                    address: 123,
                }),
            ).toBe(false)
        })

        it('should return true when input is receiver', () => {
            expect(
                isReceiver({
                    name: 'test',
                    address: 'test',
                }),
            ).toBe(true)
        })
    })

    describe('humanizeAddress', () => {
        it('should friendly format phone numbers', () => {
            expect(
                humanizeAddress('+12133734253', TicketMessageSourceType.Phone),
            ).toEqual('+1 213 373 4253')

            expect(
                humanizeAddress(
                    '+12133734253',
                    TicketMessageSourceType.WhatsAppMessage,
                ),
            ).toEqual('+1 213 373 4253')
        })

        it('does not format phone numbers if the source is not provided', () => {
            expect(humanizeAddress('+12133734253')).toEqual('+12133734253')
        })

        it('formats correctly for non-legacy channels', () => {
            expect(humanizeAddress('sendershop', 'tiktok-shop')).toEqual(
                'sendershop',
            )
        })

        it('should run to lowercase on all other input', () => {
            expect(humanizeAddress('aNeMailAdDreSS@pRoVIder.io')).toEqual(
                'anemailaddress@provider.io',
            )
        })
    })

    describe('humanizeChannel', () => {
        it('should return the preserved channel name for known channels', () => {
            for (const channel in TICKET_CHANNEL_NAMES) {
                expect(humanizeChannel(channel)).toEqual(
                    TICKET_CHANNEL_NAMES[channel as TicketChannel],
                )
            }
        })

        it('should return the human readable string from unknown channel-like string', () => {
            expect(humanizeChannel('test-test_test')).toEqual('Test test test')
        })

        it('should convert source types to channel names', () => {
            expect(
                humanizeChannel(TicketMessageSourceType.InternalNote),
            ).toEqual('Internal Note')

            expect(
                humanizeChannel(TicketMessageSourceType.EmailForward),
            ).toEqual('Forward')

            expect(
                humanizeChannel(
                    TicketMessageSourceType.YotpoReviewPublicComment,
                ),
            ).toEqual('Public Yotpo reply')

            expect(
                humanizeChannel(
                    TicketMessageSourceType.YotpoReviewPrivateComment,
                ),
            ).toEqual('Private Yotpo reply')

            expect(
                humanizeChannel(TicketMessageSourceType.WhatsAppMessage),
            ).toEqual('WhatsApp')
        })

        it('should work with new channels', () => {
            jest.spyOn(channelsService, 'toChannel').mockReturnValue(
                mockChannels[0],
            )

            expect(humanizeChannel('tiktok-shop')).toEqual('TikTok Shop')
        })
    })

    describe('buildFirstTicketMessage', () => {
        it('returns the ticket message untouched if this is not the first ticket message of the first ticket messages group', () => {
            const ticketMessage = {} as TicketMessage
            const ticketMessageId = utils.generateTicketMessagesId(2)
            const ticketMeta = fromJS({})

            expect(
                buildFirstTicketMessage(
                    ticketMessage,
                    ticketMessageId,
                    ticketMeta,
                ),
            ).toEqual(ticketMessage)
        })

        it('returns the ticket message untouched if there is no ticket meta to process', () => {
            const ticketMessage = {} as TicketMessage
            const ticketMessageId = utils.generateTicketMessagesId(1)
            const ticketMeta = null

            expect(
                buildFirstTicketMessage(
                    ticketMessage,
                    ticketMessageId,
                    ticketMeta,
                ),
            ).toEqual(ticketMessage)
        })

        it('returns the ticket message untouched if the ticket meta fields are not relevant', () => {
            const ticketMessage = {} as TicketMessage
            const ticketMessageId = utils.generateTicketMessagesId(1)
            const ticketMeta = fromJS({
                other: 'field',
            })

            expect(
                buildFirstTicketMessage(
                    ticketMessage,
                    ticketMessageId,
                    ticketMeta,
                ),
            ).toEqual(ticketMessage)
        })

        it('returns the transformed ticket message if the ticket meta fields contain a relevant "gorgias_contact_form" field', () => {
            const ticketMessage = {} as TicketMessage
            const ticketMessageId = utils.generateTicketMessagesId(1)
            const gorgiasContactFormMeta: GorgiasContactFormTicketMeta = {
                contact_form_id: 1,
                contact_form_locale_id: 1,
                contact_form_uid: 'abcd1234',
                help_center_id: null,
                host_url: 'https://test.gorgias.com',
                is_embedded: true,
            }
            const ticketMeta = fromJS({
                gorgias_contact_form: gorgiasContactFormMeta,
            })

            expect(
                buildFirstTicketMessage(
                    ticketMessage,
                    ticketMessageId,
                    ticketMeta,
                ),
            ).toMatchObject({
                meta: {
                    current_page: gorgiasContactFormMeta.host_url,
                },
            })
        })
    })

    describe('getPendingMessageIndex()', () => {
        const pendingMessage = {
            body_html: '<i>pending<i>',
            body_text: 'pending',
            channel: 'email',
            from_agent: false,
            source: {
                type: TicketMessageSourceType.Email,
                from: {
                    address: 'x@x.com',
                    name: 'X',
                },
                to: [
                    {
                        address: 'y@y.com',
                        name: 'Y',
                    },
                ],
            },
            integration_id: 123,
            public: true,
        } as unknown as TicketMessage

        it('should match messages based on a subset of props', () => {
            expect(
                getPendingMessageIndex(
                    [
                        {
                            ...pendingMessage,
                            channel: TicketChannel.Facebook,
                        },
                        {
                            ...pendingMessage,
                            channel: TicketChannel.Phone,
                        },
                        pendingMessage,
                    ],
                    pendingMessage,
                ),
            ).toEqual(2)

            expect(
                getPendingMessageIndex(
                    [
                        {
                            ...pendingMessage,
                            source: {
                                ...pendingMessage.source,
                                type: 'tiktok-shop' as TicketMessageSourceType,
                            },
                        },
                    ],
                    pendingMessage,
                ),
            ).toEqual(0)

            expect(
                getPendingMessageIndex(
                    [
                        {
                            ...pendingMessage,
                            source: omit(
                                pendingMessage.source,
                                'type',
                            ) as Source,
                        },
                    ],
                    pendingMessage,
                ),
            ).toEqual(0)
        })

        it('should disregard some props and still match', () => {
            expect(
                getPendingMessageIndex(
                    [{ ...pendingMessage, public: false }],
                    pendingMessage,
                ),
            ).toEqual(0)
        })

        it('should return -1 if there is no match', () => {
            expect(
                getPendingMessageIndex([pendingMessage], {
                    ...pendingMessage,
                    channel: TicketChannel.Facebook,
                }),
            ).toEqual(-1)

            expect(
                getPendingMessageIndex([pendingMessage], {
                    ...pendingMessage,
                    body_text: 'not pending!',
                }),
            ).toEqual(-1)

            expect(
                getPendingMessageIndex([pendingMessage], {
                    ...pendingMessage,
                    source: {
                        ...pendingMessage.source,
                        type: TicketMessageSourceType.Email,
                        to: [{ address: 'z@z.com', name: 'z' }],
                    },
                }),
            ).toEqual(-1)
        })
    })
})
