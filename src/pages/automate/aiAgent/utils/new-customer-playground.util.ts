import {
    AiAgentInput,
    AiAgentMessageType,
    CreatePlaygroundBody,
    CreatePlaygroundRequest,
    MockTicketMessage,
} from 'models/aiAgentPlayground/types'
import {CustomerHttpIntegrationDataMock} from '../constants'
import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'

const PLAYGROUND_TICKET_ID = '123'
const PLAYGROUND_INTEGRATION_ID = -1
const GREETING_MESSAGE_META = {
    ai_agent_message_type: AiAgentMessageType.GREETING,
}

export type NewCustomerData = {
    body_text: string
    subject: string
    domain: string
    messages: CreatePlaygroundBody['messages']
    created_datetime: string
    channel: PlaygroundChannels
    meta?: Record<string, string>
}

const createMockTicketMessage = ({
    body_text,
    subject,
    created_datetime,
    from_agent,
    channel,
    meta = {},
}: {
    body_text: string
    subject: string
    created_datetime: string
    from_agent: boolean
    channel: PlaygroundChannels
    meta?: Record<string, string>
}): MockTicketMessage => ({
    attachments: [],
    body_html: '',
    body_text,
    channel,
    created_datetime,
    from_agent,
    id: 233881,
    integration_id: PLAYGROUND_INTEGRATION_ID,
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
                address: 'playground@gorgias.com',
                name: '',
            },
        ],
        type: 'email',
    },
    subject,
    meta,
})

export const createMockHttpIntegrationPayload = ({
    body_text,
    messages,
    subject,
    domain,
    meta = {},
    created_datetime,
    channel,
}: NewCustomerData): AiAgentInput => ({
    message: {
        body_text,
        channel,
        created_datetime,
        from_agent: false,
        id: '233881',
        integration_id: String(PLAYGROUND_INTEGRATION_ID),
        intents: '[]',
        source: JSON.stringify({
            from: {
                address: CustomerHttpIntegrationDataMock.address,
                name: CustomerHttpIntegrationDataMock.name,
            },
            to: [
                {
                    address: 'playground@gorgias.com',
                    name: '',
                },
            ],
            type: 'email',
        }),
        subject,
        meta,
    },
    ticket: {
        account: {
            domain,
        },
        channel,
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
            messages.map((message, index) =>
                createMockTicketMessage({
                    body_text: message.bodyText,
                    subject,
                    created_datetime,
                    from_agent: message.fromAgent,
                    channel,
                    meta: {
                        ...meta,
                        ...(channel === 'chat' && index === 0
                            ? GREETING_MESSAGE_META
                            : {}),
                    },
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
    messages: messages.map((message, index) => {
        return createMockTicketMessage({
            body_text: message.bodyText,
            created_datetime: message.createdDatetime.replace('Z', ''),
            subject: body.subject,
            from_agent: message.fromAgent,
            channel: body.channel,
            meta: {
                ...body.meta,
                ...(body.channel === 'chat' && index === 0
                    ? GREETING_MESSAGE_META
                    : {}),
            },
        })
    }),
})
