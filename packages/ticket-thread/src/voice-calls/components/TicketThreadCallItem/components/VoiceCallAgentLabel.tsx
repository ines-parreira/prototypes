import { Text } from '@gorgias/axiom'

import { useVoiceCallAgent } from '../../../hooks/useVoiceCallAgent'
import { formatPhoneNumberInternational } from '../../../models/phoneFormatting'

type VoiceCallAgentLabelProps = {
    agentId: number
    phoneNumber?: string
    size?: 'sm'
}

export function VoiceCallAgentLabel({
    agentId,
    phoneNumber,
    size,
}: VoiceCallAgentLabelProps) {
    const agent = useVoiceCallAgent(agentId)

    if (agent) {
        return (
            <Text as="span" variant="bold" size={size}>
                {agent.name}
            </Text>
        )
    }

    if (phoneNumber) {
        return (
            <Text as="span" variant="bold" size={size}>
                {formatPhoneNumberInternational(phoneNumber)}
            </Text>
        )
    }

    return (
        <Text as="span" variant="bold" size={size}>
            Agent #{agentId}
        </Text>
    )
}
