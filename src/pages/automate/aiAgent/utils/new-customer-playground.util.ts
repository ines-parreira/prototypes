import {AiAgentInput} from 'models/aiAgentPlayground/types'

export type NewCustomerData = {
    body_text: string
    domain: string
    created_datetime: string
    integration: {
        id: number
        address: string
    }
}

export const mockCustomerData = {
    address: 'oliver.smith@foobar.com',
    name: 'Oliver Smith',
    firstname: 'Oliver',
    lastname: 'Smith',
}

export const createMockHttpIntegrationPayload = ({
    body_text,
    domain,
    created_datetime,
    integration,
}: NewCustomerData): AiAgentInput => ({
    message: {
        body_text,
        channel: 'email',
        created_datetime,
        from_agent: false,
        id: '233881',
        integration_id: integration.id.toString(),
        intents: '[]',
        source: JSON.stringify({
            from: {
                address: mockCustomerData.address,
                name: mockCustomerData.name,
            },
            to: [
                {
                    address: integration.address,
                    name: '',
                },
            ],
            type: 'email',
        }),
        subject: '',
    },
    ticket: {
        account: {
            domain,
        },
        channel: 'email',
        created_datetime,
        customer: {
            email: mockCustomerData.address,
            firstname: mockCustomerData.firstname,
            id: '601409',
            integrations: JSON.stringify({
                shopify: {
                    customer: {},
                    last_order: null,
                    orders: [],
                },
            }),
            lastname: mockCustomerData.lastname,
            name: mockCustomerData.name,
        },
        id: '179772',
        messages: JSON.stringify([
            {
                attachments: [],
                body_html: '',
                body_text,
                channel: 'email',
                created_datetime,
                from_agent: false,
                id: 233881,
                integration_id: integration.id,
                sender: {
                    email: mockCustomerData.address,
                    firstname: mockCustomerData.firstname,
                    id: 601409,
                    lastname: mockCustomerData.lastname,
                    meta: {
                        name_set_via: 'shopify',
                    },
                    name: mockCustomerData.name,
                },
                source: {
                    bcc: [],
                    cc: [],
                    from: {
                        address: mockCustomerData.address,
                        name: mockCustomerData.name,
                    },
                    to: [
                        {
                            address: integration.address,
                            name: '',
                        },
                    ],
                    type: 'email',
                },
                subject: '',
            },
        ]),
        subject: '',
        tags: '[]',
    },
})
