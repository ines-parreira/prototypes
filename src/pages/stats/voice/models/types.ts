import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import {VoiceCallStatus} from 'models/voiceCall/types'

export type VoiceCallStatListItem = {
    [VoiceCallDimension.AgentId]: string | null
    [VoiceCallDimension.CustomerId]: string | null
    [VoiceCallDimension.Direction]: string
    [VoiceCallDimension.IntegrationId]: string | null
    [VoiceCallDimension.CreatedAt]: string
    [VoiceCallDimension.Status]: VoiceCallStatus
    [VoiceCallDimension.Duration]: string | null
    [VoiceCallDimension.TicketId]: string | null
    [VoiceCallDimension.PhoneNumberDestination]: string
    [VoiceCallDimension.PhoneNumberSource]: string
    [VoiceCallMeasure.VoiceCallCount]: string
}

export type VoiceCallSummary = {
    agentId: number | null
    customerId: number | null
    direction: string
    integrationId: number | null
    createdAt: string
    status: VoiceCallStatus
    duration: number | null
    ticketId: number | null
    phoneNumberDestination: string
    phoneNumberSource: string
}
