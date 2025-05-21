import type { TicketElement as TicketElementType } from '../types'
import { TicketAIEvent } from './TicketAIEvent'
import { TicketEvent } from './TicketEvent'
import { TicketMessage } from './TicketMessage'
import { TicketVoiceCall } from './TicketVoiceCall'

type Props = {
    element: TicketElementType
}

export function TicketElement({ element }: Props) {
    switch (element.type) {
        case 'message':
            return <TicketMessage data={element.data} />

        case 'event':
            return <TicketEvent data={element.data} />

        case 'ai-event':
            return <TicketAIEvent data={element.data} />

        case 'voice-call':
            return <TicketVoiceCall data={element.data} />

        default:
            return null
    }
}
