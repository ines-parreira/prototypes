export type CreatePlaygroundRequest = {
    customer_email: string
    body_text: string
    http_integration_id: number
    account_id: number
    email_integration_id: number
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
