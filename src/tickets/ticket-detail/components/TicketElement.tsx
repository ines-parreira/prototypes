import { fromJS } from 'immutable'

import PhoneEvent from 'pages/tickets/detail/components/PhoneEvent/PhoneEvent'

import type { TicketElement as TicketElementType } from '../types'
import { TicketAIEvent } from './TicketAIEvent'
import { TicketMessage } from './TicketMessage'
import { TicketVoiceCall } from './TicketVoiceCall'

type Props = {
    element: TicketElementType
}

export function TicketElement({ element }: Props) {
    switch (element.type) {
        case 'message':
            return <TicketMessage data={element.data} />

        case 'phone-event':
            return <PhoneEvent event={fromJS(element.data)} isLast={false} />

        case 'ai-event':
            return <TicketAIEvent data={element.data} />

        case 'voice-call':
            return <TicketVoiceCall data={element.data} />

        default:
            return null
    }
}
