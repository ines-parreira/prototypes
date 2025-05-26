import type { Event, TicketMessage, VoiceCall } from '@gorgias/helpdesk-queries'

import type { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type AIEvent = {
    eventType: TicketEventEnum
}

export type TicketMessageElement = {
    data: TicketMessage
    datetime: string
    flags?: string[]
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
