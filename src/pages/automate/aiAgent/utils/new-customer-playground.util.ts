import {AiAgentInput} from 'models/aiAgentPlayground/types'
import {CustomerHttpIntegrationDataMock} from '../constants'

export type NewCustomerData = {
    body_text: string
    subject: string
    domain: string
    created_datetime: string
    integration: {
        id: number
        address: string
    }
}

export const createMockHttpIntegrationPayload = ({
    body_text,
    subject,
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
                address: CustomerHttpIntegrationDataMock.address,
                name: CustomerHttpIntegrationDataMock.name,
            },
            to: [
                {
                    address: integration.address,
                    name: '',
                },
            ],
            type: 'email',
        }),
        subject,
    },
    ticket: {
        account: {
            domain,
        },
        channel: 'email',
        created_datetime,
        customer: {
            email: CustomerHttpIntegrationDataMock.address,
            firstname: CustomerHttpIntegrationDataMock.firstname,
            id: '601409',
            integrations: JSON.stringify({
                shopify: {
                    customer: {},
                    last_order: null,
                    orders: [],
                },
            }),
            lastname: CustomerHttpIntegrationDataMock.lastname,
            name: CustomerHttpIntegrationDataMock.name,
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
                    email: CustomerHttpIntegrationDataMock.address,
                    firstname: CustomerHttpIntegrationDataMock.firstname,
                    id: 601409,
                    lastname: CustomerHttpIntegrationDataMock.lastname,
                    meta: {
                        name_set_via: 'shopify',
                    },
                    name: CustomerHttpIntegrationDataMock.name,
                },
                source: {
                    bcc: [],
                    cc: [],
                    from: {
                        address: CustomerHttpIntegrationDataMock.address,
                        name: CustomerHttpIntegrationDataMock.name,
                    },
                    to: [
                        {
                            address: integration.address,
                            name: '',
                        },
                    ],
                    type: 'email',
                },
                subject,
            },
        ]),
        subject,
        tags: '[]',
    },
})
