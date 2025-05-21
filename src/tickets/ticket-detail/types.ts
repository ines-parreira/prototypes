import type { Event, TicketMessage, VoiceCall } from '@gorgias/api-queries'

import type { TicketEventEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

type AIEvent = {
    eventType: TicketEventEnum
}

export type TicketElement =
    | { data: AIEvent; datetime?: string; type: 'ai-event' }
    | { data: Event; datetime?: string; type: 'event' }
    | {
          data: { isBare: true; message: TicketMessage }
          datetime: string
          type: 'bare-message'
      }
    | { data: TicketMessage; datetime: string; type: 'message' }
    | { data: VoiceCall; datetime?: string; type: 'voice-call' }

export type Transformer = (elements: TicketElement[]) => TicketElement[]
