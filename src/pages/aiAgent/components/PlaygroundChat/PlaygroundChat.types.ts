import {PlaygroundCustomer} from '../../types'

export type PlaygroundFormValues = {
    message: string
    subject?: string
    customer: PlaygroundCustomer
}

export type PlaygroundChannels = 'chat' | 'email'
