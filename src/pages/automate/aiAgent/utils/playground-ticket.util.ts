import {
    AiAgentInput,
    CreatePlaygroundBody,
    GetPlaygroundCustomerRequest,
    MockTicketMessage,
} from 'models/aiAgentPlayground/types'
import {getAiAgentCustomer} from 'models/aiAgentPlayground/resources'
import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../constants'
import {PlaygroundChannels} from '../components/PlaygroundChat/PlaygroundChat.types'

const PLAYGROUND_TICKET_ID = '123'
const PLAYGROUND_INTEGRATION_ID = -1

export type TicketCustomer = {
    id: string
    name: string
    email: string
    firstname: string
    lastname: string
    integrations: string
}

export type NewCustomerData = {
    customer: TicketCustomer
    body_text: string
    from_agent: boolean
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
    intents: [],
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
    customer,
    from_agent,
}: NewCustomerData): AiAgentInput => ({
    message: createMockTicketMessage({
        body_text: body_text,
        subject,
        created_datetime,
        from_agent,
        channel,
        meta,
    }),
    ticket: {
        account: {
            domain,
        },
        channel,
        created_datetime,
        customer,
        id: PLAYGROUND_TICKET_ID,
        messages: JSON.stringify(
            messages.map((message) =>
                createMockTicketMessage({
                    body_text: message.bodyText,
                    subject,
                    created_datetime,
                    from_agent: message.fromAgent,
                    channel,
                    meta: message.meta,
                })
            )
        ),
        subject,
        tags: '[]',
    },
})

export const getTicketCustomer = async (
    body: GetPlaygroundCustomerRequest
): Promise<TicketCustomer> => {
    if (body.customer_email === DEFAULT_PLAYGROUND_CUSTOMER.email) {
        return {
            id: String(DEFAULT_PLAYGROUND_CUSTOMER.id),
            name: CustomerHttpIntegrationDataMock.name,
            email: CustomerHttpIntegrationDataMock.address,
            firstname: CustomerHttpIntegrationDataMock.firstname,
            lastname: CustomerHttpIntegrationDataMock.lastname,
            integrations: '{}',
        }
    }

    const {data} = await getAiAgentCustomer(body)
    const customerData = data.ticket.customer

    return {
        id: String(customerData.id),
        name: customerData.name,
        email: customerData.email ?? '',
        firstname: customerData.firstname,
        lastname: customerData.lastname,
        integrations: customerData.integrations,
    }
}
