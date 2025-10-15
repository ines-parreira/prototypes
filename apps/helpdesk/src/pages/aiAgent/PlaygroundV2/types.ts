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

export enum PlaygroundEvent {
    RESET_CONVERSATION = 'RESET_CONVERSATION',
}

export type EventCallback = () => void
export type EventHandlers = Record<PlaygroundEvent, EventCallback[]>

export type PlaygroundEventEmitter = {
    on: (event: PlaygroundEvent, callback: EventCallback) => () => void
    emit: (event: PlaygroundEvent) => void
}
