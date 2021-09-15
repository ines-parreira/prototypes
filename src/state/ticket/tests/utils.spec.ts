import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'

import {PhoneIntegrationEvent} from '../../../constants/integrations/types/event'
import {SHOPIFY_INTEGRATION_TYPE} from '../../../constants/integration'
import {getEmailChannels} from '../../integrations/selectors'
import {integrationsState} from '../../../fixtures/integrations'
import {
    getNewMessageSender,
    getOutboundCallFrom,
    getPreferredChannel,
    getSourceTypeOfResponse,
    getTicketChannelFromName,
    guessReceiversFromTicket,
    isForwardedMessage,
    persistLastSenderChannel,
    Receivers,
    ReceiversValue,
    receiversStateFromValue,
    receiversValueFromState,
    replaceIntegrationVariables,
} from '../utils'
import {getPersonLabelFromSource} from '../../../pages/tickets/common/utils.js'
import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from '../../../business/types/ticket'
import {RootState} from '../../types'

import {emailTicket, facebookPost, smoochTicket} from './fixtures'

jest.addMatchers(immutableMatchers)

jest.mock('../../../config/ticket', () => {
    const ticketConfig = require.requireActual('../../../config/ticket')

    return {
        ...ticketConfig,
        getVariableWithValue: (variable: string) => {
            if (variable.includes('variableWithReplace')) {
                return 'my value'
            }

            return null
        },
    } as unknown
})

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
    TicketMessageSourceType.Email
)
const receiversValueExample = {
    to: [
        {
            name: customers.email[1].name,
            label: getPersonLabelFromSource(customers.email[1], 'email'),
            value: customers.email[1].address,
        },
        {
            name: customers.email[2].name,
            label: getPersonLabelFromSource(customers.email[2], 'email'),
            value: customers.email[2].address,
        },
    ],
    cc: [
        {
            name: customers.email[3].name,
            label: getPersonLabelFromSource(customers.email[3], 'email'),
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

describe('ticket utils', () => {
    describe('getSourceTypeOfResponse()', () => {
        it('should return message source type "internal-note" for Twilio ticket that has no message', () => {
            const messages: unknown[] = []
            const via = TicketVia.Twilio

            expect(getSourceTypeOfResponse(messages, via)).toEqual(
                TicketMessageSourceType.InternalNote
            )
        })

        it('should return message source type "internal-note" for Twilio ticket that has one internal note', () => {
            const messages = [
                {source: {type: TicketMessageSourceType.InternalNote}},
            ]
            const via = TicketVia.Twilio

            expect(getSourceTypeOfResponse(messages, via)).toEqual(
                TicketMessageSourceType.InternalNote
            )
        })
    })

    describe('guessReceiversFromTicket()', () => {
        it('guess receivers empty', () => {
            const updatedTicket = ticket.delete('messages').delete('customer')
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email
            )

            expect(receivers).toEqual({
                to: [],
            })
        })

        it('guess receivers email', () => {
            const receivers = guessReceiversFromTicket(
                ticket,
                TicketMessageSourceType.Email
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
                false
            )
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email
            )

            expect(receivers).toEqual({
                to: [customers.email[0]],
                cc: [customers.email[3]],
            })
        })

        it('guess receivers chat', () => {
            const receivers = guessReceiversFromTicket(
                ticket,
                TicketMessageSourceType.Chat
            )

            expect(receivers).toEqual({
                to: [customers.chat[1]],
            })
        })

        it('guess receivers chat inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket.setIn(
                ['messages', 1, 'from_agent'],
                false
            )
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Chat
            )

            expect(receivers).toEqual({
                to: [customers.chat[0]],
            })
        })

        it('guess receivers from customer email', () => {
            const updatedTicket = ticket.delete('messages')
            const receivers = guessReceiversFromTicket(
                updatedTicket,
                TicketMessageSourceType.Email
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
                TicketMessageSourceType.Chat
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
                TicketMessageSourceType.Email
            )
        ).toEqual(receiversValueExample)
    })

    describe('receiversStateFromValue()', () => {
        expect(
            receiversStateFromValue(
                (receiversValueExample as unknown) as ReceiversValue,
                TicketMessageSourceType.Email
            )
        ).toEqual(receiversStateExample)
    })

    describe('getPreferredChannel()', () => {
        it('should return preferred', () => {
            const expected = channels.find((channel: Map<any, any>) => {
                return (channel.get('type') === 'email' &&
                    channel.get('preferred', false)) as boolean
            })
            expect(
                getPreferredChannel(TicketMessageSourceType.Email, channels)
            ).toEqualImmutable(expected)
        })

        it('should return first', () => {
            // remove preferred channels of the list
            const _chans = channels.filter(
                (channel: Map<any, any>) =>
                    channel.get('preferred', false) === false
            ) as List<any>
            const expected = _chans.find(
                (channel: Map<any, any>) => channel.get('type') === 'email'
            )
            expect(
                getPreferredChannel(TicketMessageSourceType.Email, _chans)
            ).toEqualImmutable(expected)
        })

        it('should return empty Map', () => {
            expect(
                getPreferredChannel(
                    'skype' as TicketMessageSourceType,
                    channels
                )
            ).toEqualImmutable(fromJS({}))
        })
    })

    describe('getNewMessageSender()', () => {
        it('should return `from` field from last message from agent (chat, messenger)', () => {
            const expected = smoochTicket.getIn([
                'messages',
                1,
                'source',
                'from',
            ])
            expect(
                getNewMessageSender(
                    smoochTicket,
                    TicketMessageSourceType.Chat,
                    channels
                )
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
                    channels
                )
            ).toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (chat, messenger)', () => {
            // delete last message from agent
            const _smoochTicket = smoochTicket.deleteIn(['messages', 1])
            const expected = _smoochTicket.getIn([
                'messages',
                0,
                'source',
                'to',
                0,
            ])
            expect(
                getNewMessageSender(
                    _smoochTicket,
                    TicketMessageSourceType.Chat,
                    channels
                )
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
                    channels
                )
            ).toEqualImmutable(expected)
        })

        it('should return preferred channel', () => {
            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
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
                    channel.get('address') === from.get('address')
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
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
                    channel.get('address') === to.get('address')
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
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
                    }
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
                    channel.get('address') === cc.get('address')
            )
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
            ).toEqualImmutable(expected)
        })

        it('should return preferred email (email in `from` does not match any integration)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.setIn(
                ['messages', 1, 'source', 'from'],
                fromJS({name: 'foo', address: 'unknown@gorgias.io'})
            )
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
            ).toEqualImmutable(expected)
        })

        it('should return preferred email (email not found in `from`)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.deleteIn(['messages', 0])
            const expected = getPreferredChannel(
                TicketMessageSourceType.Email,
                channels
            )
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
            ).toEqualImmutable(expected)
        })

        it('should return an empty name and address (internal-note)', () => {
            expect(
                getNewMessageSender(
                    emailTicket,
                    TicketMessageSourceType.InternalNote,
                    channels
                )
            ).toEqualImmutable(
                fromJS({
                    name: '',
                    address: '',
                })
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
                channels
            )

            // persisted channel is not present in the channels list so the preferred channel should be returned
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels
                )
            ).toEqualImmutable(expected)

            // update the channel list and we should get the persisted channel
            expect(
                getNewMessageSender(
                    _emailTicket,
                    TicketMessageSourceType.Email,
                    channels.push(testChannel)
                )
            ).toEqualImmutable(testChannel)
        })

        it('should get the sender channel from ticket events', () => {
            const integrationId = 1
            const ticket = fromJS({
                events: [
                    {
                        type: PhoneIntegrationEvent.IncomingPhoneCall,
                        data: {integration: {id: integrationId}},
                    },
                ],
            })
            const newMessageSourceType = TicketMessageSourceType.Phone
            const expectedSender = fromJS({
                id: integrationId,
                name: 'Acme Phone',
                address: '+14151112222',
            })
            const channels = fromJS([expectedSender])

            expect(
                getNewMessageSender(ticket, newMessageSourceType, channels)
            ).toEqual(expectedSender)
        })
    })

    describe('isForwardedMessage()', () => {
        it('should detect forwarded message', () => {
            expect(
                isForwardedMessage(fromJS({source: {extra: {forward: true}}}))
            ).toEqual(true)
        })

        it('should not detect forwarded message', () => {
            expect(
                isForwardedMessage(fromJS({source: {extra: {forward: false}}}))
            ).toEqual(false)
            expect(isForwardedMessage(fromJS({}))).toEqual(false)
        })
    })

    describe('replaceIntegrationVariables()', () => {
        it('should return an empty value and log a notification because there is no matching integration', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: 'weirdtype',
                            customer: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable = 'ticket.customer.integrations.shopify.customer.foo'
            const newArg =
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                'Hello {{ticket.customer.integration.shopify.customer.name}}, what is your {{}}?'
            )
            expect(notifySpy.mock.calls).toMatchSnapshot()
        })

        it('should update the Shopify variable with the correct integration id', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable = 'ticket.customer.integrations.shopify.customer.foo'
            const newArg =
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                    'what is your {{ticket.customer.integrations[15].customer.foo}}?'
            )
            expect(notifySpy).not.toHaveBeenCalled()
        })

        it('should update the variable with the correct value using the replace function in the config of the variable', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable =
                '{{ticket.customer.integrations.shopify.customer.variableWithReplace}}'
            const newArg =
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations.shopify.customer.variableWithReplace}}?'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                    'what is your my value?'
            )
            expect(notifySpy).not.toHaveBeenCalled()
        })

        it('should take data from first of multiple Shopify integrations', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                            },
                        },
                        17: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable = 'ticket.customer.integrations.shopify.customer.foo'
            const newArg =
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                    'what is your {{ticket.customer.integrations[15].customer.foo}}?'
            )
            expect(notifySpy).not.toHaveBeenCalled()
        })

        it('should take data from most recent of multiple Shopify integrations updates based on updated_at info', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-17T13:57:14-04:00',
                            },
                        },
                        16: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-19T13:57:14-04:00',
                            },
                        },
                        17: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-18T13:57:14-04:00',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable = 'ticket.customer.integrations.shopify.customer.foo'
            const newArg =
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                'what is your {{ticket.customer.integrations.shopify.customer.foo}}?'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                'Hello {{ticket.customer.integration.shopify.customer.name}}, ' +
                    'what is your {{ticket.customer.integrations[16].customer.foo}}?'
            )
            expect(notifySpy).not.toHaveBeenCalled()
        })

        it('should work with filters', () => {
            const ticketState = fromJS({
                customer: {
                    integrations: {
                        15: {
                            __integration_type__: SHOPIFY_INTEGRATION_TYPE,
                            customer: {
                                foo: 'bar',
                            },
                        },
                    },
                },
            })

            const notifySpy = jest.fn()

            const variable = 'ticket.customer.integrations.shopify.customer.foo'
            const newArg =
                '{{ticket.customer.integrations.shopify.customer.foo|datetime_format("MM")}}'

            const res = replaceIntegrationVariables(
                SHOPIFY_INTEGRATION_TYPE,
                ticketState,
                variable,
                newArg,
                notifySpy
            )

            expect(res).toEqual(
                '{{ticket.customer.integrations[15].customer.foo|datetime_format("MM")}}'
            )
            expect(notifySpy).not.toHaveBeenCalled()
        })
    })

    describe('getOutboundCallFrom()', () => {
        const emptySender = fromJS({id: null, name: '', address: ''})
        const getValidSender = (id: number) =>
            fromJS({id, name: 'Acme Phone', address: '+14151112222'}) as Map<
                any,
                any
            >
        const getPhoneEvent = (integrationId: number) => ({
            type: PhoneIntegrationEvent.IncomingPhoneCall,
            data: {integration: {id: integrationId}},
        })

        it('should return empty sender because there is no channel', () => {
            const ticket = fromJS({})
            const channels = fromJS([])
            expect(getOutboundCallFrom(ticket, channels)).toEqual(emptySender)
        })

        it('should return first channel because there is no phone event', () => {
            const ticket = fromJS({})
            const channel = getValidSender(1)
            const channels = fromJS([channel])
            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })

        it('should return first channel because ticket channel is not defined in the channels list', () => {
            const ticket = fromJS({events: [getPhoneEvent(1)]})
            const channel = getValidSender(2)
            const channels = fromJS([channel])
            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })

        it('should return ticket channel because it is defined in the channels list', () => {
            const ticket = fromJS({events: [getPhoneEvent(2)]})
            const channel = getValidSender(2)
            const channels = fromJS([getValidSender(1), channel])
            expect(getOutboundCallFrom(ticket, channels)).toEqual(channel)
        })
    })

    describe('getChannelFromName', () => {
        it('should convert channel name to an existing TicketChannel', () => {
            expect(getTicketChannelFromName('Instagram Ad Comment')).toBe(
                TicketChannel.InstagramAdComment
            )
        })

        it('should return null for an invalid ticket channel', () => {
            expect(getTicketChannelFromName('Foo Bar Baz')).toBe(null)
        })
    })
})
