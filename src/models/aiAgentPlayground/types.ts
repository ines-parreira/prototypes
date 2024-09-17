import {PlaygroundChannels} from 'pages/automate/aiAgent/components/PlaygroundChat/PlaygroundChat.types'

export type CreatePlaygroundMessage = {
    bodyText: string
    fromAgent: boolean
    createdDatetime: string
    meta?: Record<string, string>
}

export type CreatePlaygroundOptions = {
    shopName: string
}

export type CreatePlaygroundBody = {
    use_mock_context: boolean
    domain: string
    customer_email: string
    body_text: string
    subject: string
    http_integration_id: number
    account_id: number
    messages: CreatePlaygroundMessage[]
    created_datetime: string
    channel: PlaygroundChannels
    meta?: Record<string, string>
    _playground_options: CreatePlaygroundOptions
    // Property for AI Agent to identify actions
    _action_serialized_state?: unknown

    // TODO: Remove in https://linear.app/gorgias/issue/AUTAI-1418/update-mechanism-to-get-customer-data
    email_integration_id: number
}

export type MockTicketMessage = {
    attachments: []
    body_html: string
    body_text: string
    created_datetime: string
    from_agent: boolean
    id: number
    integration_id: number
    channel: PlaygroundChannels
    sender: {
        firstname: string
        email: string
        id: 601409
        lastname: string
        meta: Record<string, string>
        name: string
    }
    source: {
        bcc: []
        cc: []
        from: {
            address: string
            name: string
        }
        to: [
            {
                address: string
                name: string
            }
        ]
        type: 'email'
    }
    subject: string
    meta: Record<string, string>
}

export type CreatePlaygroundRequest = Omit<CreatePlaygroundBody, 'messages'> & {
    messages: MockTicketMessage[]
    email_integration_id: number
}

export type SearchCustomerRequest = {
    email: string
}

// All ids are strings here as the jinja templating system is transforming from a dict to a json string
export type AiAgentInput = {
    // Property for AI Agent to identify actions
    _action_serialized_state?: unknown
    _playground_options?: CreatePlaygroundOptions
    ticket: {
        id: string
        tags: string
        account: {
            domain: string
        }
        channel: string
        subject: string
        customer: {
            id: string
            name: string
            email: string
            lastname: string
            firstname: string
            integrations: string
        }
        messages: string
        created_datetime: string
    }
    message: {
        id: string
        from_agent: boolean
        source: string
        channel: string
        intents: string
        subject: string
        body_text: string
        integration_id: string
        created_datetime: string
        meta: Record<string, string>
    }
}

export enum MessageType {
    INTERNAL_NOTE = 'INTERNAL_NOTE',
    MESSAGE = 'MESSAGE',
    ERROR = 'ERROR',
    TICKET_EVENT = 'TICKET_EVENT',
    PLACEHOLDER = 'PLACEHOLDER',
    PROMPT = 'PROMPT',
}

export enum PlaygroundPromptType {
    RELEVANT_RESPONSE = 'RELEVANT_RESPONSE',
    NOT_RELEVANT_RESPONSE = 'NOT_RELEVANT_RESPONSE',
}

export const isApiEligiblePlaygroundMessage = (
    message: PlaygroundMessage
): message is PlaygroundTextMessage | PlaygroundPromptMessage =>
    message.type === MessageType.MESSAGE || message.type === MessageType.PROMPT

type BaseMessage = {
    sender: string
    createdDatetime: string
}
export type PlaygroundTextMessage = BaseMessage & {
    type: MessageType.MESSAGE
    content: string
}

export type PlaygroundPromptMessage = BaseMessage & {
    type: MessageType.PROMPT
    prompt: PlaygroundPromptType
    content: string
}

export type PlaygroundInternalNoteMessage = BaseMessage & {
    type: MessageType.INTERNAL_NOTE
    content: string
}

export type PlaygroundErrorMessage = BaseMessage & {
    type: MessageType.ERROR
    content: React.ReactNode | string
}

export type PlaygroundTicketEventMessage = BaseMessage & {
    type: MessageType.TICKET_EVENT
    outcome: TicketOutcome
}

export type PlaygroundPlaceholderMessage = BaseMessage & {
    type: MessageType.PLACEHOLDER
}

export type PlaygroundMessage =
    | PlaygroundTextMessage
    | PlaygroundPromptMessage
    | PlaygroundInternalNoteMessage
    | PlaygroundErrorMessage
    | PlaygroundTicketEventMessage
    | PlaygroundPlaceholderMessage

export enum TicketOutcome {
    CLOSE = 'close',
    HANDOVER = 'handover',
    WAIT = 'wait',
}

export enum AiAgentMessageType {
    WAIT_FOR_CLOSE_TICKET_CONFIRMATION = 'wait_for_close_ticket_confirmation',
    WAIT_FOR_CUSTOMER_RESPONSE = 'wait_for_customer_response',
    HANDOVER_TO_AGENT = 'handover_to_agent',
    GREETING = 'ai_agent_greeting',
    AI_AGENT_RESPONSE_RELEVANT_TRUE = 'ai_agent_response_relevant_true',
    AI_AGENT_RESPONSE_RELEVANT_FALSE = 'ai_agent_response_relevant_false',
    ERROR = 'error',
}

export type AiAgentResponse = {
    generate: {
        output: {
            generated_message: string
            outcome: TicketOutcome
        }
    }
    qa: {
        output: {
            validate_outcome: boolean
            validate_generated_message: boolean
        }
    }
    postProcessing: {
        internalNote: string
        htmlReply: string | null
        chatTicketMessageMeta?: {ai_agent_message_type?: AiAgentMessageType}
    }
    _action_serialized_state: unknown
}

export type CustomerSearchResponse = {
    data: CustomerList
}

export type CustomerList = {
    id: number
    address: string
    type: string
    user: {
        id: number
        name: string
    }
    customer: {
        id: number
        name: string
    }
}[]

export enum ProcessingStatus {
    CHECKING_PERMISSIONS = 'Checking permissions',
    SUMMARIZING = 'Summarizing',
    GATHERING_INFO = 'Gathering information',
    GENERATING = 'Generating response',
}

export enum PlaygroundStep {
    INPUT = 'input',
    OUTPUT = 'output',
}
