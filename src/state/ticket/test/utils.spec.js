import expect from 'expect'
import expectImmutable from 'expect-immutable'
import {getChannels} from '../../integrations/selectors'
import integrationState from '../../integrations/tests/fixtures'
import {smoochTicket, emailTicket} from './fixtures'
import {fromJS} from 'immutable'
import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
    getPreferredChannel,
    getNewMessageSender
} from '../utils'
import {
    displayUserNameFromSource,
} from '../../../pages/tickets/common/utils'

expect.extend(expectImmutable)

const users = {
    email: [{
        id: 1,
        name: 'Support',
        address: 'support@acme.com',
    }, {
        id: 2,
        name: 'Nicolas',
        address: 'nico@las.com',
    }, {
        id: 3,
        name: 'Julie',
        address: 'ju@lie.com',
    }, {
        id: 4,
        name: 'Fabien',
        address: 'fa@bien.com',
    }],
    chat: [{
        id: 11,
        name: 'Support',
        smooch_id: '0987654321',
    }, {
        id: 12,
        name: 'Nicolas',
        smooch_id: '1234567890',
    }, {
        id: 13,
        name: 'Julie',
        smooch_id: '2345678901',
    }]
}

const ticket = fromJS({
    messages: [{
        from_agent: false,
        source: {
            type: 'chat',
            to: [users.chat[0]],
            from: users.chat[1]
        }
    }, {
        from_agent: true,
        source: {
            type: 'chat',
            to: [users.chat[1]],
            from: users.chat[0]
        }
    }, {
        from_agent: true,
        source: {
            type: 'internal-note',
        }
    }, {
        from_agent: false,
        source: {
            type: 'email',
            to: [users.email[0]],
            from: users.email[1]
        }
    }, {
        from_agent: true,
        source: {
            type: 'email',
            to: [users.email[1], users.email[2]],
            cc: [users.email[3]],
            from: users.email[0]
        }
    }, {
        from_agent: true,
        source: {
            type: 'internal-note',
        }
    }],
    newMessage: {
        source: {
            type: 'email',
        }
    }
})

const receiversExample = guessReceiversFromTicket(ticket)
const receiversValueExample = {
    to: [{
        id: users.email[1].id,
        name: users.email[1].name,
        label: displayUserNameFromSource(users.email[1], 'email'),
        value: users.email[1].address,
    }, {
        id: users.email[2].id,
        name: users.email[2].name,
        label: displayUserNameFromSource(users.email[2], 'email'),
        value: users.email[2].address,
    }],
    cc: [{
        id: users.email[3].id,
        name: users.email[3].name,
        label: displayUserNameFromSource(users.email[3], 'email'),
        value: users.email[3].address,
    }],
}
const receiversStateExample = {
    to: [{
        id: receiversValueExample.to[0].id,
        name: receiversValueExample.to[0].name,
        address: receiversValueExample.to[0].value,
    }, {
        id: receiversValueExample.to[1].id,
        name: receiversValueExample.to[1].name,
        address: receiversValueExample.to[1].value,
    }],
    cc: [{
        id: receiversValueExample.cc[0].id,
        name: receiversValueExample.cc[0].name,
        address: receiversValueExample.cc[0].value,
    }],
}
const channels = getChannels(integrationState)

describe('Ticket utils', () => {
    describe('guessReceiversFromTicket', () => {
        it('guess receivers email', () => {
            const updatedTicket = ticket
                .setIn(['newMessage', 'source', 'type'], 'email')
            const receivers = guessReceiversFromTicket(updatedTicket)

            expect(receivers).toEqual({
                to: [users.email[1], users.email[2]],
                cc: [users.email[3]],
            })
        })

        it('guess receivers email inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket
                .setIn(['newMessage', 'source', 'type'], 'email')
                .setIn(['messages', 4, 'from_agent'], false)
            const receivers = guessReceiversFromTicket(updatedTicket)

            expect(receivers).toEqual({
                to: [users.email[0]],
                cc: [users.email[3]],
            })
        })

        it('guess receivers chat', () => {
            const updatedTicket = ticket
                .setIn(['newMessage', 'source', 'type'], 'chat')
            const receivers = guessReceiversFromTicket(updatedTicket)

            expect(receivers).toEqual({
                to: [users.chat[1]],
                cc: [],
            })
        })

        it('guess receivers chat inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket
                .setIn(['newMessage', 'source', 'type'], 'chat')
                .setIn(['messages', 1, 'from_agent'], false)
            const receivers = guessReceiversFromTicket(updatedTicket)

            expect(receivers).toEqual({
                to: [users.chat[0]],
                cc: [],
            })
        })
    })

    describe('receiversValueFromState', () => {
        expect(receiversValueFromState(receiversExample, 'email')).toEqual(receiversValueExample)
    })

    describe('receiversStateFromValue', () => {
        expect(receiversStateFromValue(receiversValueExample, 'email')).toEqual(receiversStateExample)
    })

    describe('getPreferredChannel', () => {
        it('should return preferred', () => {
            const expected = channels.find(channel => {
                return channel.get('type') === 'email' && channel.get('preferred', false)
            })
            expect(getPreferredChannel('email', channels))
                .toEqualImmutable(expected)
        })

        it('should return first', () => {
            // remove preferred channels of the list
            const _chans = channels.filter(channel => channel.get('preferred', false) === false)
            const expected = _chans.find(channel => channel.get('type') === 'email')
            expect(getPreferredChannel('email', _chans))
                .toEqualImmutable(expected)
        })

        it('should return empty Map', () => {
            expect(getPreferredChannel('skype', channels))
                .toEqualImmutable(fromJS({}))
        })
    })

    describe('getNewMessageSender', () => {
        it('should return `from` field from last message from agent (chat, messenger)', () => {
            const expected = smoochTicket.getIn(['messages', 1, 'source', 'from'])
            expect(getNewMessageSender(smoochTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (chat, messenger)', () => {
            // delete last message from agent
            const _smoochTicket = smoochTicket.deleteIn(['messages', 1])
            const expected = _smoochTicket.getIn(['messages', 0, 'source', 'to', 0])
            expect(getNewMessageSender(_smoochTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return preferred channel', () => {
            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))
            const expected = getPreferredChannel('email', channels)
            expect(getNewMessageSender(_emailTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent', () => {
            const expected = emailTicket.getIn(['messages', 1, 'source', 'from'])
            expect(getNewMessageSender(emailTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return channel in `to` field from last message from customer (email found in `to`)', () => {
            // delete last message from agent
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const expected = _emailTicket.getIn(['messages', 0, 'source', 'to', 1])
            expect(getNewMessageSender(emailTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return channel in `cc` field from last message from customer (email found in `cc`)', () => {
            // delete last message from agent
            // and move `To` addresses in `Cc` and remove `To` addresses
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
                .updateIn(['messages', 0, 'source'], source => {
                    return source.set('cc', source.get('to'))
                        .set('to', fromJS([]))
                })
            const expected = _emailTicket.getIn(['messages', 0, 'source', 'cc', 1])
            expect(getNewMessageSender(emailTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return preferred email (email not found in `to`)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const expected = getPreferredChannel('email', channels)
            expect(getNewMessageSender(_emailTicket, channels))
                .toEqualImmutable(expected)
        })

        it('should return empty Map (internal-note)', () => {
            const _emailTicket = emailTicket.setIn(['newMessage', 'source', 'type'], 'internal-note')
            expect(getNewMessageSender(_emailTicket, channels))
                .toEqualImmutable(fromJS({}))
        })
    })
})
