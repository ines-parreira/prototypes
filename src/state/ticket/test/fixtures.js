import {fromJS} from 'immutable'

export const smoochTicket = fromJS({
    newMessage: {
        source: {
            type: 'chat'
        }
    },
    messages: [{
        source: {
            extra: {
                smooch_app_id: '58997fe9227b1f4c0026ea57'
            },
            to: [
                {
                    name: 'acme',
                    address: ''
                }
            ],
            from: {
                name: 'Monumental Halibut',
                smooch_id: '20c0993066ec2e8601b7de22',
                address: '20c0993066ec2e8601b7de22'
            },
            type: 'chat'
        },
        id: 151,
        from_agent: false
    }, {
        source: {
            extra: {
                smooch_app_id: '58997fe9227b1f4c0026ea57'
            },
            cc: [],
            to: [
                {
                    name: 'Monumental Halibut',
                    smooch_id: '20c0993066ec2e8601b7de22',
                    address: ''
                }
            ],
            from: {
                name: 'acme',
                address: ''
            },
            type: 'chat'
        },
        id: 152,
        from_agent: true
    }]
})

export const emailTicket = fromJS({
    newMessage: {
        source: {
            type: 'email'
        }
    },
    messages: [{
        source: {
            to: [{
                name: 'Marc',
                address: 'marc.wall@gmail.com'
            }, {
                name: 'Acme Support',
                address: 'support@acme.com'
            }],
            from: {
                name: 'Steve Frizeli',
                address: 'marie.curie@gmail.com'
            },
            type: 'chat'
        },
        id: 151,
        from_agent: false
    }, {
        source: {
            cc: [],
            to: [{
                name: 'Steve Frizeli',
                address: 'steve.frizeli@gmail.com'
            }],
            from: {
                name: 'Acme Support',
                address: 'support@acme.com'
            },
            type: 'email'
        },
        id: 152,
        from_agent: true
    }]
})

