export type VoiceCallDirection = 'inbound' | 'outbound'

export type VoiceCall = {
    id: number
    integration_id: number
    ticket_id: number
    phone_number_id: number
    external_id: string
    provider: string
    status: string
    direction: VoiceCallDirection
    phone_number_source: string
    country_source: string
    phone_number_destination: string
    country_destination: string
    duration: string
    started_datetime: string
    created_datetime: string
    updated_datetime: string
    last_answered_by_agent_id: number | null
    initiated_by_agent_id?: number | null
    customer_id: number
}

export type ListVoiceCallsParams = {
    ticket_id?: number
}

export const isVoiceCall = (object: unknown): object is VoiceCall => {
    const obj = object as VoiceCall
    return obj &&
        typeof obj.id === 'number' &&
        obj.provider &&
        typeof obj.provider === 'string' &&
        obj.status &&
        typeof obj.status === 'string' &&
        obj.direction &&
        typeof obj.direction === 'string' &&
        obj.phone_number_source &&
        typeof obj.phone_number_source === 'string' &&
        obj.phone_number_destination &&
        typeof obj.phone_number_destination === 'string'
        ? true
        : false
}

export type OutboundVoiceCall = VoiceCall & {
    initiated_by_agent_id: number
}

export const isOutboundVoiceCall = (
    input: unknown
): input is OutboundVoiceCall =>
    isVoiceCall(input) && typeof input.initiated_by_agent_id === 'number'
