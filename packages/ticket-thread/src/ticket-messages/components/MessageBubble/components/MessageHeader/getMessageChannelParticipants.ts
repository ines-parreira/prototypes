import { formatPhoneNumberInternational } from '#voice-calls/models/phoneFormatting'

type MessageSourceAddressLike = {
    address?: string | null
    name?: string | null
}

type MessageSourceLike = {
    type?: string | null
    from?: MessageSourceAddressLike | null
    to?: MessageSourceAddressLike[] | null
    cc?: MessageSourceAddressLike[] | null
    bcc?: MessageSourceAddressLike[] | null
}

const ADDRESS_IN_TOOLTIP_SOURCE_TYPES = new Set([
    'aircall',
    'email',
    'ottspott-call',
    'phone',
    'sms',
    'twilio',
    'whatsapp-message',
])

function formatParticipantAddress(
    address: string | null | undefined,
    sourceType?: string | null,
) {
    if (!address) {
        return ''
    }

    if (sourceType && ADDRESS_IN_TOOLTIP_SOURCE_TYPES.has(sourceType)) {
        if (sourceType !== 'email') {
            return formatPhoneNumberInternational(address)
        }

        if (address.length > 45) {
            return `${address.slice(0, 20)}[...]${address.slice(-20)}`
        }
    }

    return address
}

function formatParticipant(
    participant: MessageSourceAddressLike | null | undefined,
    sourceType?: string | null,
) {
    if (!participant) {
        return null
    }

    const name = participant.name?.trim() ?? ''
    const address = formatParticipantAddress(participant.address, sourceType)
    const shouldShowAddress =
        !!sourceType && ADDRESS_IN_TOOLTIP_SOURCE_TYPES.has(sourceType)

    if (shouldShowAddress && address) {
        return name ? `${name} (${address})` : address
    }

    return name || address || null
}

function formatParticipants(
    participants: MessageSourceAddressLike[] | null | undefined,
    sourceType?: string | null,
) {
    if (!participants?.length) {
        return null
    }

    const labels = participants
        .map((participant) => formatParticipant(participant, sourceType))
        .filter((label): label is string => !!label)

    return labels.length > 0 ? labels.join(', ') : null
}

export function getMessageChannelParticipants(
    source?: MessageSourceLike | null,
) {
    const sourceType = source?.type

    return {
        from: formatParticipant(source?.from, sourceType),
        to: formatParticipants(source?.to, sourceType),
        cc: formatParticipants(source?.cc, sourceType),
        bcc: formatParticipants(source?.bcc, sourceType),
    }
}
