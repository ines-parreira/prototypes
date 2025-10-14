export type PlaygroundTemplateMessage = {
    id: number
    title: string
    content: string
}

export type PlaygroundCustomer = {
    email: string
    name?: string
    id: number
}

export type PlaygroundFormValues = {
    message: string
    subject?: string
    customer: PlaygroundCustomer
}

export type PlaygroundChannels = 'chat' | 'email'
export type PlaygroundChannelAvailability = 'online' | 'offline'
