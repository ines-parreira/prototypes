import { assertNever } from '../../../../../utils/assertNever'
import type { PhoneEventType } from './types'

function getPhoneEventBaseLabel(type: PhoneEventType): string {
    switch (type) {
        case 'phone-call-conversation-started':
            return 'Phone conversation started'
        case 'phone-call-forwarded-to-external-number':
            return 'Call forwarded to an external number'
        case 'phone-call-forwarded-to-gorgias-number':
            return 'Call forwarded to a Gorgias number'
        case 'phone-call-forwarded':
            return 'Call forwarded'
        case 'message-played':
            return 'Message played'
        default:
            return assertNever(type)
    }
}

function getPayloadUserName(payloadUserName: unknown): string | null {
    if (typeof payloadUserName !== 'string' || !payloadUserName.trim()) {
        return null
    }

    return payloadUserName
}

export function resolvePhoneEventAgentName({
    userId,
    payloadUserName,
    agents,
}: {
    userId: number | null | undefined
    payloadUserName: unknown
    agents: Array<{ id?: number | null; name?: string | null }> | undefined
}): string | null {
    if (userId != null) {
        const matchedAgent = agents?.find(
            (agent) => typeof agent.id === 'number' && agent.id === userId,
        )
        if (matchedAgent?.name) {
            return matchedAgent.name
        }
    }

    return getPayloadUserName(payloadUserName)
}

export function getPhoneEventLabel({
    type,
    agentName,
    customerName,
}: {
    type: PhoneEventType
    agentName: string | null
    customerName: string | null
}): string {
    const label = getPhoneEventBaseLabel(type)

    if (type !== 'phone-call-conversation-started') {
        return label
    }

    if (!agentName || !customerName) {
        return label
    }

    return `${label} by ${agentName}`
}
