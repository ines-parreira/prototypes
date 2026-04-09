import { Text } from '@gorgias/axiom'
import type { VoiceCall } from '@gorgias/helpdesk-queries'

import { useVoiceCallAgent } from '../hooks/useVoiceCallAgent'
import { formatPhoneNumberInternational } from '../models/phoneFormatting'
import { isFinalVoiceCallStatus } from '../models/utils'
import { VoiceCallAgentLabel } from './VoiceCallAgentLabel'
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
    const agentName =
        agent?.name ||
        formatPhoneNumberInternational(voiceCall.phone_number_source)

    return (
        <VoiceCallContainer
            dateTime={voiceCall.created_datetime}
            avatarName={agentName}
            header={
                <>
                    <VoiceCallAgentLabel
                        agentId={voiceCall.initiated_by_agent_id}
                        phoneNumber={voiceCall.phone_number_source}
                    />
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
