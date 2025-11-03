import { JourneyTypeEnum } from '@gorgias/convert-client'
import { Customer } from '@gorgias/helpdesk-types'

import { Product } from 'constants/integrations/types/shopify'

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

export type PlaygroundChannels = 'chat' | 'email' | 'sms'
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

export type PlaygroundModes = 'inbound' | 'outbound'

export type InboundSettings = {
    chatAvailability: PlaygroundChannelAvailability
    selectedCustomer: Customer | null
    areActionsEnabled: boolean
}

export type AIJourneySettings = {
    journeyType: JourneyTypeEnum
    selectedProduct: Product | null
    totalFollowUp: number
    includeProductImage: boolean
    includeDiscountCode: boolean
    discountCodeValue: number
    discountCodeMessageIdx: number
    outboundMessageInstructions: string
}
