import { Text } from '@gorgias/axiom'
import type {
    TicketMessageUserOrCustomer,
    VoiceCall,
} from '@gorgias/helpdesk-queries'

import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { useVoiceCallAgent } from '#voice-calls/hooks/useVoiceCallAgent'
import { isFinalVoiceCallStatus } from '#voice-calls/models/utils'
import { VoiceCallContainer } from './VoiceCallContainer'
import { VoiceCallOutboundStatus } from './VoiceCallOutboundStatus'

type VoiceCallOutboundProps = {
    voiceCall: VoiceCall & { initiated_by_agent_id: number }
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export function VoiceCallOutbound({
    voiceCall,
    renderMonitorCallButton,
}: VoiceCallOutboundProps) {
    const agent = useVoiceCallAgent(voiceCall.initiated_by_agent_id)

    const sender: TicketMessageUserOrCustomer = {
        id: voiceCall.initiated_by_agent_id,
        name: agent?.name ?? null,
        firstname: agent?.firstname ?? '',
        lastname: agent?.lastname ?? '',
        email: agent?.email ?? null,
        meta: agent?.meta ?? null,
    }

    return (
        <VoiceCallContainer
            sender={sender}
            header={
                <>
                    <MessageSender sender={sender} />
                    <Text as="span" color="content-neutral-secondary">
                        {isFinalVoiceCallStatus(voiceCall.status)
                            ? 'made a call'
                            : 'is making a call'}
                    </Text>
                </>
            }
            directionIcon="arrow-up-right"
            callStatus={<VoiceCallOutboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
            renderMonitorCallButton={renderMonitorCallButton}
        />
    )
}
