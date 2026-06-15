import { Text } from '@gorgias/axiom'
import type {
    TicketMessageUserOrCustomer,
    VoiceCall,
} from '@gorgias/helpdesk-queries'

import { MessageSender } from '../../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { useVoiceCallCustomer } from '../../../hooks/useVoiceCallCustomer'
import { isFinalVoiceCallStatus } from '../../../models/utils'
import { VoiceCallContainer } from './VoiceCallContainer'
import { VoiceCallInboundStatus } from './VoiceCallInboundStatus'

type VoiceCallInboundProps = {
    voiceCall: VoiceCall
    renderMonitorCallButton?: (voiceCall: VoiceCall) => React.ReactNode
}

export function VoiceCallInbound({
    voiceCall,
    renderMonitorCallButton,
}: VoiceCallInboundProps) {
    const { customer } = useVoiceCallCustomer(voiceCall.customer_id ?? 0)

    const sender: TicketMessageUserOrCustomer = {
        ...customer,
        name: customer?.name ?? null,
        firstname: customer?.firstname ?? '',
        lastname: customer?.lastname ?? '',
        email: customer?.email ?? null,
        meta: customer?.meta ?? null,
        id: voiceCall.customer_id ?? 0,
    }

    return (
        <VoiceCallContainer
            sender={sender}
            header={
                <>
                    <MessageSender sender={sender} />
                    <Text as="span" color="content-neutral-secondary">
                        {isFinalVoiceCallStatus(voiceCall.status)
                            ? 'called'
                            : 'is calling'}
                    </Text>
                </>
            }
            directionIcon="arrow-down-left"
            callStatus={<VoiceCallInboundStatus voiceCall={voiceCall} />}
            voiceCall={voiceCall}
            renderMonitorCallButton={renderMonitorCallButton}
        />
    )
}
