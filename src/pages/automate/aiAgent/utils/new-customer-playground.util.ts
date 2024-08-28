import {
    AiAgentInput,
    CreatePlaygroundBody,
    CreatePlaygroundRequest,
    MockTicketMessage,
} from 'models/aiAgentPlayground/types'
import {CustomerHttpIntegrationDataMock} from '../constants'

const PLAYGROUND_TICKET_ID = '123'

export type NewCustomerData = {
    body_text: string
    subject: string
    domain: string
    messages: CreatePlaygroundBody['messages']
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
    from_agent,
}: {
    body_text: string
    subject: string
    created_datetime: string
    integration_id: number
    integration_address: string
    from_agent: boolean
}): MockTicketMessage => ({
    attachments: [],
    body_html: '',
    body_text,
    channel: 'email',
    created_datetime,
    from_agent,
    id: 233881,
    integration_id,
    sender: from_agent
        ? {
              email: 'bot',
              firstname: 'Gorgias',
              id: 601409,
              lastname: 'Bot',
              meta: {},
              name: 'Gorgias Bot',
          }
        : {
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
        from: from_agent
            ? {
                  address: 'bot',
                  name: 'Gorgias Bot',
              }
            : {
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
    meta: '',
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
        meta: '',
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
        id: PLAYGROUND_TICKET_ID,
        messages: JSON.stringify(
            messages.map((message) =>
                createMockTicketMessage({
                    body_text: message.bodyText,
                    integration_id: integration.id,
                    integration_address: integration.address,
                    subject,
                    created_datetime,
                    from_agent: message.fromAgent,
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
    messages: messages.map((message) =>
        createMockTicketMessage({
            body_text: message.bodyText,
            created_datetime: message.createdDatetime.replace('Z', ''),
            subject: body.subject,
            from_agent: message.fromAgent,
            integration_id: body.email_integration_id,
            integration_address: body.email_integration_address,
        })
    ),
})
