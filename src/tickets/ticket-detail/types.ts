import type { Event, TicketMessage, VoiceCall } from '@gorgias/api-queries'

export type TicketElement =
    | { data: Event; datetime?: string; type: 'event' }
    | {
          data: { isBare: true; message: TicketMessage }
          datetime: string
          type: 'bare-message'
      }
    | { data: TicketMessage; datetime: string; type: 'message' }
    | { data: VoiceCall; datetime?: string; type: 'voice-call' }

export type Transformer = (elements: TicketElement[]) => TicketElement[]
