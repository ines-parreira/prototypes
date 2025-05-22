import type { Event, TicketMessage, VoiceCall } from '@gorgias/api-queries'

import type { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type AIEvent = {
    eventType: TicketEventEnum
}

export type TicketElement =
    | { data: AIEvent; datetime?: string; flags?: string[]; type: 'ai-event' }
    | { data: Event; datetime?: string; flags?: string[]; type: 'event' }
    | {
          data: TicketMessage
          datetime: string
          flags?: string[]
          type: 'message'
      }
    | {
          data: VoiceCall
          datetime?: string
          flags?: string[]
          type: 'voice-call'
      }

export type Transformer = (elements: TicketElement[]) => TicketElement[]
