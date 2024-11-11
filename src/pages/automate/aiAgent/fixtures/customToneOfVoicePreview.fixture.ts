import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'

export const customToneOfVoicePreviewFixture = {
    domain: 'acme',
    from_agent: false,
    customer_email: 'oliver.smith@foobar.com',
    customer: {
        email: 'oliver.smith@foobar.com',
        name: 'Oliver Smith',
        firstname: 'Oliver',
        lastname: 'Smith',
        id: '601409',
        integrations:
            '{"shopify":{"customer":{},"last_order":null,"orders":[]}}',
    },
    body_text: 'What is your return policy?',
    subject: 'Return policy',
    http_integration_id: 1,
    account_id: 1,
    messages: [
        {
            bodyText: 'What is your return policy?',
            fromAgent: false,
            meta: {
                name: 'Oliver Smith',
            },
            createdDatetime: '2024-11-06T14:00:00.000Z',
        },
    ],
    created_datetime: '2024-11-06T14:00:00.000Z',
    channel: 'email' as PlaygroundChannels,
    _playground_options: {
        shopName: 'Acme shop',
        customToneOfVoice:
            'Be concise. Use an empathetic, proactive, and reassuring tone.',
    },
}
