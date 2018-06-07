import {fromJS} from 'immutable'

export const smoochTicket = fromJS({
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
                    address: '20c0993066ec2e8601b7de22'
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
    messages: [{
        source: {
            to: [{
                name: 'Marc',
                address: 'marc.wall@gmail.com'
            }, {
                name: 'Acme Support',
                address: 'support@acme.gorgias.io'
            }],
            from: {
                name: 'Steve Frizeli',
                address: 'marie.curie@gmail.com'
            },
            type: 'email'
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
                address: 'support@acme.gorgias.io'
            },
            type: 'email'
        },
        id: 152,
        from_agent: true
    }]
})

export const facebookPost = fromJS({
    messages: [
        {
            source: {
                from: {
                    address: '1232353100194770',
                    name: 'Check-my Motherfockin Resume'
                },
                post_id: '519388858269125_626477354226941',
                type: 'facebook-post',
                page_id: '519388858269125',
                to: [
                    {
                        address: '',
                        name: 'Acme Support'
                    }
                ]
            },
            id: 153,
            from_agent: false
        },
        {
            source: {
                from: {
                    address: '',
                    name: 'Acme Support'
                },
                comment_id: '626477354226941_626479084226768',
                post_id: '519388858269125_626477354226941',
                type: 'facebook-comment',
                page_id: '519388858269125',
                to: [
                    {
                        address: '',
                        name: 'Check-my Motherfockin Resume'
                    }
                ],
                cc: []
            },
            id: 189,
            from_agent: true
        },
    ]
})

export const instagramMedia = fromJS({
    messages: [
        {
            source: {
                type: 'instagram-media',
                from: {
                    address: '1232353100194770',
                    name: 'myinstagrampage'
                },
                to: [{
                    address: 'a4sd684a6sd4a5sd',
                    name: 'instagramuser'
                }],
                extra: {
                    media_id: '519388858269125_626477354226941',
                    permalink: 'https://instagram.com/foobar'
                }
            },
            id: 153,
            from_agent: true
        },
        {
            source: {
                type: 'instagram-comment',
                from: {
                    address: 'a4sd684a6sd4a5sd',
                    name: 'instagramuser'
                },
                to: [{
                    address: '1232353100194770',
                    name: 'myinstagrampage'
                }],
                extra: {
                    media_id: '519388858269125_626477354226941'
                }
            },
            id: 189,
            from_agent: false
        },
    ]
})
