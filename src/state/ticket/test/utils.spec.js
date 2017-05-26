import * as immutableMatchers from 'jest-immutable-matchers'
import {getChannels} from '../../integrations/selectors'
import integrationState from '../../integrations/tests/fixtures'
import {smoochTicket, emailTicket, facebookPost} from './fixtures'
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

jest.addMatchers(immutableMatchers)

const users = {
    email: [{
        name: 'Support',
        address: 'support@acme.com',
    }, {
        name: 'Nicolas',
        address: 'nico@las.com',
    }, {
        name: 'Julie',
        address: 'ju@lie.com',
    }, {
        name: 'Fabien',
        address: 'fa@bien.com',
    }],
    chat: [{
        name: 'Support',
        address: '0987654321',
    }, {
        name: 'Nicolas',
        address: '1234567890',
    }, {
        name: 'Julie',
        address: '2345678901',
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
})

const receiversExample = guessReceiversFromTicket(ticket, 'email')
const receiversValueExample = {
    to: [{
        name: users.email[1].name,
        label: displayUserNameFromSource(users.email[1], 'email'),
        value: users.email[1].address,
    }, {
        name: users.email[2].name,
        label: displayUserNameFromSource(users.email[2], 'email'),
        value: users.email[2].address,
    }],
    cc: [{
        name: users.email[3].name,
        label: displayUserNameFromSource(users.email[3], 'email'),
        value: users.email[3].address,
    }],
}
const receiversStateExample = {
    to: [{
        name: receiversValueExample.to[0].name,
        address: receiversValueExample.to[0].value,
    }, {
        name: receiversValueExample.to[1].name,
        address: receiversValueExample.to[1].value,
    }],
    cc: [{
        name: receiversValueExample.cc[0].name,
        address: receiversValueExample.cc[0].value,
    }],
}
const channels = getChannels(integrationState)

describe('Ticket utils', () => {
    describe('guessReceiversFromTicket', () => {
        it('guess receivers email', () => {
            const receivers = guessReceiversFromTicket(ticket, 'email')

            expect(receivers).toEqual({
                to: [users.email[1], users.email[2]],
                cc: [users.email[3]],
            })
        })

        it('guess receivers email inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket
                .setIn(['messages', 4, 'from_agent'], false)
            const receivers = guessReceiversFromTicket(updatedTicket, 'email')

            expect(receivers).toEqual({
                to: [users.email[0]],
                cc: [users.email[3]],
            })
        })

        it('guess receivers chat', () => {
            const receivers = guessReceiversFromTicket(ticket, 'chat')

            expect(receivers).toEqual({
                to: [users.chat[1]],
            })
        })

        it('guess receivers chat inverted', () => {
            // invert from_agent property
            const updatedTicket = ticket
                .setIn(['messages', 1, 'from_agent'], false)
            const receivers = guessReceiversFromTicket(updatedTicket, 'chat')

            expect(receivers).toEqual({
                to: [users.chat[0]],
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
            expect(getNewMessageSender(smoochTicket, 'chat', channels))
                .toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent (facebook post)', () => {
            const expected = facebookPost.getIn(['messages', 1, 'source', 'from'])
            expect(getNewMessageSender(facebookPost, 'facebook-comment', channels))
                .toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (chat, messenger)', () => {
            // delete last message from agent
            const _smoochTicket = smoochTicket.deleteIn(['messages', 1])
            const expected = _smoochTicket.getIn(['messages', 0, 'source', 'to', 0])
            expect(getNewMessageSender(_smoochTicket, 'chat', channels))
                .toEqualImmutable(expected)
        })

        it('should return `to` field from last message from customer (facebook post)', () => {
            // delete last message from agent
            const _facebookPost = facebookPost.deleteIn(['messages', 1])
            const expected = _facebookPost.getIn(['messages', 0, 'source', 'to', 0])
            expect(getNewMessageSender(_facebookPost, 'facebook-comment', channels))
                .toEqualImmutable(expected)
        })

        it('should return preferred channel', () => {
            // remove messages, to simulate a new ticket
            const _emailTicket = emailTicket.set('messages', fromJS([]))
            const expected = getPreferredChannel('email', channels)
            expect(getNewMessageSender(_emailTicket, 'email', channels))
                .toEqualImmutable(expected)
        })

        it('should return `from` field from last message from agent', () => {
            const expected = emailTicket.getIn(['messages', 1, 'source', 'from'])
            expect(getNewMessageSender(emailTicket, 'email', channels))
                .toEqualImmutable(expected)
        })

        it('should return channel in `to` field from last message from customer (email found in `to`)', () => {
            // delete last message from agent
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const expected = _emailTicket.getIn(['messages', 0, 'source', 'to', 1])
            expect(getNewMessageSender(emailTicket, 'email', channels))
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
            expect(getNewMessageSender(emailTicket, 'email', channels))
                .toEqualImmutable(expected)
        })

        it('should return preferred email (email not found in `to`)', () => {
            // remove address that can match
            const _emailTicket = emailTicket.deleteIn(['messages', 1])
            const expected = getPreferredChannel('email', channels)
            expect(getNewMessageSender(_emailTicket, 'email', channels))
                .toEqualImmutable(expected)
        })

        it('should return an empty name and address (internal-note)', () => {
            expect(getNewMessageSender(emailTicket, 'internal-note', channels))
                .toEqualImmutable(fromJS({
                    name: '',
                    address: '',
                }))
        })
    })
})
