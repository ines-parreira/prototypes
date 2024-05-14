export type CreatePlaygroundRequest = {
    new_customer_email: boolean
    domain: string
    customer_email: string
    body_text: string
    http_integration_id: number
    account_id: number
    email_integration_id: number
    email_integration_address: string
}

// All ids are strings here as the jinja templating system is transforming from a dict to a json string
export type AiAgentInput = {
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
    }
}

export enum MessageType {
    INTERNAL_NOTE = 'INTERNAL_NOTE',
    MESSAGE = 'MESSAGE',
    ERROR = 'ERROR',
    TICKET_EVENT = 'TICKET_EVENT',
}

export type PlaygroundMessage = {
    sender: string
    type: MessageType
    message?: string | React.ReactNode
    outcome?: TicketOutcome
    processingStatus?: ProcessingStatus
}

export enum TicketOutcome {
    CLOSE = 'close',
    HANDOVER = 'handover',
    WAIT = 'wait',
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
    }
}

export enum ProcessingStatus {
    CHECKING_PERMISSIONS = 'Checking permissions',
    SUMMARIZING = 'Summarizing',
    GATHERING_INFO = 'Gathering information',
    GENERATING = 'Generating response',
}
