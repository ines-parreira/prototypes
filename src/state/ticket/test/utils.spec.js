import expect from 'expect'
import {fromJS} from 'immutable'
import {
    guessReceiversFromTicket,
    receiversValueFromState,
    receiversStateFromValue,
} from '../utils'
import {
    displayUserNameFromSource,
} from '../../../pages/tickets/common/utils'

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
})
