import {
    AiAgentInput,
    CreatePlaygroundBody,
    CreatePlaygroundRequest,
    MockTicketMessage,
} from 'models/aiAgentPlayground/types'
import {CustomerHttpIntegrationDataMock} from '../constants'

export type NewCustomerData = {
    body_text: string
    subject: string
    domain: string
    messages: string[]
    created_datetime: string
    integration: {
        id: number
        address: string
    }
}

const createMockTicketMessage = ({
    body_text,
    subject,
    created_datetime,
    integration_id,
    integration_address,
}: {
    body_text: string
    subject: string
    created_datetime: string
    integration_id: number
    integration_address: string
}): MockTicketMessage => ({
    attachments: [],
    body_html: '',
    body_text,
    channel: 'email',
    created_datetime,
    from_agent: false,
    id: 233881,
    integration_id,
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
                address: integration_address,
                name: '',
            },
        ],
        type: 'email',
    },
    subject,
})

export const createMockHttpIntegrationPayload = ({
    body_text,
    messages,
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
        messages: JSON.stringify(
            messages.map((bodyText) =>
                createMockTicketMessage({
                    body_text: bodyText,
                    integration_id: integration.id,
                    integration_address: integration.address,
                    subject,
                    created_datetime,
                })
            )
        ),
        subject,
        tags: '[]',
    },
})

export const createMockClientPayload = ({
    messages,
    ...body
}: CreatePlaygroundBody): CreatePlaygroundRequest => ({
    ...body,
    messages: messages.map((bodyText) =>
        createMockTicketMessage({
            body_text: bodyText,
            created_datetime: body.created_datetime.replace('Z', ''),
            integration_id: body.email_integration_id,
            integration_address: body.email_integration_address,
            subject: body.subject,
        })
    ),
})
