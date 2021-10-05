import {fromJS, Map} from 'immutable'

export const smoochTicket = fromJS({
    messages: [
        {
            source: {
                extra: {
                    smooch_app_id: '58997fe9227b1f4c0026ea57',
                },
                to: [
                    {
                        name: 'acme',
                        address: '',
                    },
                ],
                from: {
                    name: 'Monumental Halibut',
                    address: '20c0993066ec2e8601b7de22',
                },
                type: 'chat',
            },
            id: 151,
            from_agent: false,
        },
        {
            source: {
                extra: {
                    smooch_app_id: '58997fe9227b1f4c0026ea57',
                },
                cc: [],
                to: [
                    {
                        name: 'Monumental Halibut',
                        address: '20c0993066ec2e8601b7de22',
                    },
                ],
                from: {
                    name: 'acme',
                    address: '',
                },
                type: 'chat',
            },
            id: 152,
            from_agent: true,
        },
    ],
}) as Map<any, any>

export const emailTicket = fromJS({
    messages: [
        {
            source: {
                to: [
                    {
                        name: 'Marc',
                        address: 'marc.wall@gmail.com',
                    },
                    {
                        name: 'Acme Support',
                        address: 'support@acme.gorgias.io',
                    },
                ],
                from: {
                    name: 'Steve Frizeli',
                    address: 'marie.curie@gmail.com',
                },
                type: 'email',
            },
            id: 151,
            from_agent: false,
        },
        {
            source: {
                cc: [],
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
        },
    ],
}) as Map<any, any>

export const facebookPost = fromJS({
    messages: [
        {
            source: {
                from: {
                    address: '1232353100194770',
                    name: 'Check-my Motherfockin Resume',
                },
                post_id: '519388858269125_626477354226941',
                type: 'facebook-post',
                page_id: '519388858269125',
                to: [
                    {
                        address: '',
                        name: 'Acme Support',
                    },
                ],
            },
            id: 153,
            from_agent: false,
        },
        {
            source: {
                from: {
                    address: '',
                    name: 'Acme Support',
                },
                comment_id: '626477354226941_626479084226768',
                post_id: '519388858269125_626477354226941',
                type: 'facebook-comment',
                page_id: '519388858269125',
                to: [
                    {
                        address: '',
                        name: 'Check-my Motherfockin Resume',
                    },
                ],
                cc: [],
            },
            id: 189,
            from_agent: true,
        },
    ],
}) as Map<any, any>

export const instagramMedia = fromJS({
    messages: [
        {
            source: {
                type: 'instagram-media',
                from: {
                    address: '1232353100194770',
                    name: 'myinstagrampage',
                },
                to: [
                    {
                        address: 'a4sd684a6sd4a5sd',
                        name: 'instagramuser',
                    },
                ],
                extra: {
                    media_id: '519388858269125_626477354226941',
                    permalink: 'https://instagram.com/foobar',
                },
            },
            id: 153,
            from_agent: true,
        },
        {
            source: {
                type: 'instagram-comment',
                from: {
                    address: 'a4sd684a6sd4a5sd',
                    name: 'instagramuser',
                },
                to: [
                    {
                        address: '1232353100194770',
                        name: 'myinstagrampage',
                    },
                ],
                extra: {
                    media_id: '519388858269125_626477354226941',
                },
            },
            id: 189,
            from_agent: false,
        },
    ],
}) as Map<any, any>

export const twitterTweet = fromJS({
    messages: [
        {
            id: 1084,
            uri: '/api/tickets/354/messages/1084/',
            message_id: null,
            ticket_id: 354,
            external_id: '1431476962246209538',
            public: true,
            channel: 'twitter',
            via: 'twitter',
            source: {
                type: 'twitter-tweet',
                to: [
                    {
                        name: 'GorgiasIonut',
                        address: '1377919371503415307',
                    },
                ],
                from: {
                    name: 'GorgiasIonut',
                    address: '1377919371503415307',
                },
                extra: {
                    parent_id: null,
                    conversation_id: '1431476962246209538',
                },
            },
            sender: {
                id: 5,
                email: 'support@acme.gorgias.io',
                name: 'Gorgias Bot',
                firstname: 'Gorgias',
                lastname: 'Bot',
                meta: null,
            },
            integration_id: 18,
            intents: [],
            rule_id: null,
            from_agent: true,
            receiver: {
                id: 6,
                email: 'ionut.gorgias@twitt.com',
                name: 'Ionut Gorgias',
                firstname: 'Ionut',
                lastname: 'Gorgias',
                meta: {
                    name_set_via: 'twitter',
                },
            },
            subject: null,
            body_text: 'testing uploads bro 222222 https://t.co/7s3TXLfsJQ',
            body_html: 'testing uploads bro 222222 https://t.co/7s3TXLfsJQ',
            stripped_text: null,
            stripped_html: null,
            stripped_signature: null,
            attachments: [
                {
                    url:
                        'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E92gsrbWUAI9ejl-5c043185-9475-4674-a6a3-60a040f99a2c.mp4',
                    name: 'E92gsrbWUAI9ejl.mp4',
                    size: 136664,
                    content_type: 'video/mp4',
                    public: true,
                },
            ],
            actions: null,
            meta: null,
            created_datetime: '2021-08-28T04:41:18+00:00',
            sent_datetime: '2021-08-28T04:41:18+00:00',
            failed_datetime: null,
            opened_datetime: null,
            last_sending_error: null,
        },
        {
            id: 1085,
            uri: '/api/tickets/354/messages/1085/',
            message_id: null,
            ticket_id: 354,
            external_id: '1433590747618594821',
            public: true,
            channel: 'twitter',
            via: 'twitter',
            source: {
                type: 'twitter-tweet',
                to: [
                    {
                        name: 'GorgiasIonut',
                        address: '1377919371503415307',
                    },
                ],
                from: {
                    name: 'DexterIonut',
                    address: '2721310995',
                },
                extra: {
                    parent_id: '1431476962246209538',
                    conversation_id: '1431476962246209538',
                },
            },
            sender: {
                id: 7,
                email: 'bliblu@gmail.com-DELETED-1630630907.911666',
                name: 'DexterIonut',
                firstname: 'DexterIonut',
                lastname: '',
                meta: {
                    name_set_via: 'twitter',
                },
            },
            integration_id: 18,
            intents: [],
            rule_id: null,
            from_agent: false,
            receiver: {
                id: 5,
                email: 'support@acme.gorgias.io',
                name: 'Gorgias Bot',
                firstname: 'Gorgias',
                lastname: 'Bot',
                meta: null,
            },
            subject: null,
            body_text: '@GorgiasIonut are replies still working?',
            body_html: '@GorgiasIonut are replies still working?',
            stripped_text: null,
            stripped_html: null,
            stripped_signature: null,
            attachments: [],
            actions: null,
            meta: null,
            created_datetime: '2021-09-03T00:40:43+00:00',
            sent_datetime: '2021-09-03T00:40:43+00:00',
            failed_datetime: null,
            opened_datetime: null,
            last_sending_error: null,
        },
    ],
}) as Map<any, any>

export const twitterQuotedTweet = fromJS({
    messages: [
        {
            id: 1231,
            uri: '/api/tickets/377/messages/1231/',
            message_id: null,
            ticket_id: 377,
            external_id: '1435058157764685824',
            public: true,
            channel: 'twitter',
            via: 'twitter',
            source: {
                type: 'twitter-quoted-tweet',
                to: [
                    {
                        name: 'GorgiasIonut',
                        address: '1377919371503415307',
                    },
                ],
                from: {
                    name: 'DexterIonut',
                    address: '2721310995',
                },
                extra: {
                    parent_id: null,
                    conversation_id: '1435058157764685824',
                },
            },
            sender: {
                id: 67,
                email: null,
                name: 'DexterIonut',
                firstname: 'DexterIonut',
                lastname: '',
                meta: {
                    name_set_via: 'twitter',
                },
            },
            integration_id: 18,
            intents: [],
            rule_id: null,
            from_agent: false,
            receiver: {
                id: 5,
                email: 'support@acme.gorgias.io',
                name: 'Gorgias Bot',
                firstname: 'Gorgias',
                lastname: 'Bot',
                meta: null,
            },
            subject: null,
            body_text:
                'si! more! https://t.co/PcepQOiI6X https://t.co/F62lVxUXgG',
            body_html:
                'si! more! https://t.co/PcepQOiI6X https://t.co/F62lVxUXgG',
            stripped_text: null,
            stripped_html: null,
            stripped_signature: null,
            attachments: [
                {
                    url:
                        'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-pZxm5XoAAmsSo-7586849a-2cb8-470e-b941-00065b5d79fc.jpg',
                    name: 'E-pZxm5XoAAmsSo.jpg',
                    size: 106372,
                    content_type: 'image/jpeg',
                    public: true,
                },
                {
                    url:
                        'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-pZxm8WUAAixnh-bce2000a-0440-4388-afa1-5e087ceede0c.jpg',
                    name: 'E-pZxm8WUAAixnh.jpg',
                    size: 99954,
                    content_type: 'image/jpeg',
                    public: true,
                },
            ],
            actions: null,
            meta: {
                quoted_tweet: {
                    id: '1435008444520615940',
                    text: 'pictures &lt;3 https://t.co/FcqJwG9tbn',
                    user: {
                        id: '1377919371503415307',
                        name: 'Ionut Gorgias',
                        username: 'GorgiasIonut',
                    },
                    attachments: [
                        {
                            url:
                                'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiPxWYAEyISV-ff64f0b7-0f0d-4a24-97a2-949c6b8713fd.jpg',
                            name: 'E-osiPxWYAEyISV.jpg',
                            size: 86337,
                            content_type: 'image/jpeg',
                        },
                        {
                            url:
                                'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiP0X0AAKVWI-9b1d7db5-e19e-43f5-b4f9-362a87bfc888.jpg',
                            name: 'E-osiP0X0AAKVWI.jpg',
                            size: 157366,
                            content_type: 'image/jpeg',
                        },
                        {
                            url:
                                'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiPxXIAI2cwW-cdfe3cb3-24b7-4fbe-907e-762126c76e45.jpg',
                            name: 'E-osiPxXIAI2cwW.jpg',
                            size: 277127,
                            content_type: 'image/jpeg',
                        },
                    ],
                },
            },
            created_datetime: '2021-09-07T01:51:41+00:00',
            sent_datetime: '2021-09-07T01:51:41+00:00',
            failed_datetime: null,
            opened_datetime: null,
            last_sending_error: null,
        },
    ],
}) as Map<any, any>

export const chatTicket = fromJS({
    messages: [
        {
            source: {
                from: {
                    address: '1232353100194770',
                    name: 'Paul Atréides',
                },
                type: 'chat',
                to: [
                    {
                        address: '8765645678',
                        name: 'Chani',
                    },
                ],
            },
            id: 153,
            from_agent: false,
            integration_id: 8,
        },
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
            integration_id: 8,
        },
    ],
}) as Map<any, any>
