export type VoiceCallDirection = 'inbound' | 'outbound'

export type TicketVoiceCall = {
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
    initiated_by_agent_id: number | null
    customer_id: number
}

export type ListTicketVoiceCallsParams = {
    ticket_id: number
}
