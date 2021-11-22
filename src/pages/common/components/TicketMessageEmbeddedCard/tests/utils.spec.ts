import {mapQuotedTweetTicketMessageToEmbeddedCard} from '../utils'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketVia,
} from '../../../../../business/types/ticket'

describe('TicketMessageEmbeddedCard utils', () => {
    describe('mapQuotedTweetTicketMessageToEmbeddedCard()', () => {
        const quotedTweetTicketMessage = {
            sent_datetime: '2021-09-07T01:51:41+00:00',
            channel: TicketChannel.Twitter,
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
                            url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiPxWYAEyISV-ff64f0b7-0f0d-4a24-97a2-949c6b8713fd.jpg',
                            name: 'E-osiPxWYAEyISV.jpg',
                            size: 86337,
                            content_type: 'image/jpeg',
                            public: true,
                        },
                        {
                            url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiP0X0AAKVWI-9b1d7db5-e19e-43f5-b4f9-362a87bfc888.jpg',
                            name: 'E-osiP0X0AAKVWI.jpg',
                            size: 157366,
                            content_type: 'image/jpeg',
                            public: true,
                        },
                        {
                            url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-osiPxXIAI2cwW-cdfe3cb3-24b7-4fbe-907e-762126c76e45.jpg',
                            name: 'E-osiPxXIAI2cwW.jpg',
                            size: 277127,
                            content_type: 'image/jpeg',
                            public: true,
                        },
                    ],
                },
            },
            integration_id: 18,
            body_html:
                'si! more! https://t.co/PcepQOiI6X https://t.co/F62lVxUXgG',
            public: true,
            body_text:
                'si! more! https://t.co/PcepQOiI6X https://t.co/F62lVxUXgG',
            subject: 'bla',
            uri: '/api/tickets/377/messages/1231/',
            via: TicketVia.Twitter,
            ticket_id: 377,
            receiver: {
                id: 5,
                email: 'support@acme.gorgias.io',
                name: 'Gorgias Bot',
                firstname: 'Gorgias',
                lastname: 'Bot',
                meta: null,
            },
            external_id: '1435058157764685824',
            stripped_signature: null,
            from_agent: false,
            attachments: [
                {
                    url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-pZxm5XoAAmsSo-7586849a-2cb8-470e-b941-00065b5d79fc.jpg',
                    name: 'E-pZxm5XoAAmsSo.jpg',
                    size: 106372,
                    content_type: 'image/jpeg',
                    public: true,
                },
                {
                    url: 'https://uploads.gorgi.us/development/Zr1WE86rb6J4Mvgl/E-pZxm8WUAAixnh-bce2000a-0440-4388-afa1-5e087ceede0c.jpg',
                    name: 'E-pZxm8WUAAixnh.jpg',
                    size: 99954,
                    content_type: 'image/jpeg',
                    public: true,
                },
            ],
            opened_datetime: null,
            created_datetime: '2021-09-07T01:51:41+00:00',
            message_id: undefined,
            is_retriable: true,
            stripped_html: null,
            stripped_text: null,
            sender: {
                id: 67,
                email: '',
                name: 'DexterIonut',
                firstname: 'DexterIonut',
                lastname: '',
                meta: {
                    name_set_via: 'twitter',
                },
            },
            intents: [],
            last_sending_error: undefined,
            source: {
                type: TicketMessageSourceType.TwitterQuotedTweet,
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
                    parent_id: undefined,
                    conversation_id: '1435058157764685824',
                },
            },
            id: 1231,
            actions: null,
            failed_datetime: null,
            isMessage: true,
            rule_id: null,
        }

        it('should map TicketMessage for Quoted Tweet to EmbeddedCard', () => {
            expect(
                mapQuotedTweetTicketMessageToEmbeddedCard(
                    quotedTweetTicketMessage
                )
            ).toMatchSnapshot()
        })
    })
})
