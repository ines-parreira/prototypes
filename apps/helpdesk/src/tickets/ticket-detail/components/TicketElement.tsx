import { fromJS } from 'immutable'

import type { VoiceCall } from 'models/voiceCall/types'
import VoiceRecordingsProvider from 'pages/integrations/integration/components/voice/VoiceRecordingsProvider'
import PhoneEvent from 'pages/tickets/detail/components/PhoneEvent/PhoneEvent'
import TicketVoiceCall from 'pages/tickets/detail/components/TicketVoiceCall/TicketVoiceCall'

import type { TicketElement as TicketElementType } from '../types'
import { TicketAIEvent } from './TicketAIEvent'
import { TicketMessage } from './TicketMessage'

type Props = {
    element: TicketElementType
}

export function TicketElement({ element }: Props) {
    switch (element.type) {
        case 'message':
            return <TicketMessage element={element} />

        case 'phone-event':
            return <PhoneEvent event={fromJS(element.data)} isLast={false} />

        case 'ai-event':
            return <TicketAIEvent data={element.data} />

        case 'voice-call':
            return (
                <VoiceRecordingsProvider>
                    <TicketVoiceCall voiceCall={element.data as VoiceCall} />
                </VoiceRecordingsProvider>
            )

        default:
            return null
    }
}
