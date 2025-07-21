import type { Event, TicketMessage, VoiceCall } from '@gorgias/helpdesk-queries'

import { Action } from 'models/ticket/types'
import type { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type AIEvent = {
    eventType: TicketEventEnum
}

export type FailedData = {
    message: string
    failedActions: Action[]
}

export type FailedFlag = ['failed', FailedData]

export type Flag = string | FailedFlag

export type TicketMessageElement = {
    data: TicketMessage
    datetime: string
    flags?: Flag[]
    type: 'message'
}

export type TicketElement =
    | { data: AIEvent; datetime?: string; flags?: string[]; type: 'ai-event' }
    | { data: Event; datetime?: string; flags?: string[]; type: 'event' }
    | { data: Event; datetime?: string; flags?: string[]; type: 'phone-event' }
    | TicketMessageElement
    | {
          data: VoiceCall
          datetime?: string
          flags?: string[]
          type: 'voice-call'
      }

export type Transformer = (elements: TicketElement[]) => TicketElement[]
