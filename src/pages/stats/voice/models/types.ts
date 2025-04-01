import { VoiceCallDirection } from '@gorgias/api-queries'

import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import { VoiceCallDisplayStatus, VoiceCallStatus } from 'models/voiceCall/types'

export type VoiceCallStatListItem = {
    [VoiceCallDimension.AgentId]: string | null
    [VoiceCallDimension.CustomerId]: string | null
    [VoiceCallDimension.Direction]: VoiceCallDirection
    [VoiceCallDimension.IntegrationId]: string | null
    [VoiceCallDimension.CreatedAt]: string
    [VoiceCallDimension.Status]: VoiceCallStatus
    [VoiceCallDimension.Duration]: string | null
    [VoiceCallDimension.TicketId]: string | null
    [VoiceCallDimension.PhoneNumberDestination]: string
    [VoiceCallDimension.PhoneNumberSource]: string
    [VoiceCallMeasure.VoiceCallCount]: string
    [VoiceCallDimension.TalkTime]: string | null
    [VoiceCallDimension.WaitTime]: string | null
    [VoiceCallDimension.VoicemailAvailable]: boolean | null
    [VoiceCallDimension.VoicemailUrl]: string | null
    [VoiceCallDimension.CallRecordingAvailable]: boolean | null
    [VoiceCallDimension.CallRecordingUrl]: string | null
    [VoiceCallDimension.DisplayStatus]: VoiceCallDisplayStatus
    [VoiceCallDimension.QueueId]: string | null
    [VoiceCallDimension.QueueName]: string | null
}

export type VoiceCallSummary = {
    agentId: number | null
    customerId?: number | null
    customerName?: string
    direction: VoiceCallDirection
    integrationId: number | null
    createdAt: string
    status: VoiceCallStatus
    duration?: number | null
    ticketId?: number | null
    phoneNumberDestination: string
    phoneNumberSource: string
    talkTime: number | null
    waitTime: number | null
    voicemailAvailable?: boolean | null
    voicemailUrl: string | null
    callRecordingAvailable?: boolean | null
    callRecordingUrl: string | null
    displayStatus: VoiceCallDisplayStatus
    queueId: number | null
    queueName?: string | null
}

export enum VoiceCallFilterDirection {
    All = 'all',
    Inbound = 'inbound',
    Outbound = 'outbound',
}

export type VoiceCallFilterOptions = {
    direction: VoiceCallFilterDirection
    statuses?: VoiceCallDisplayStatus[]
}

export enum VoiceCallAverageTimeMetric {
    TalkTime = 'averageTalkTime',
    WaitTime = 'averageWaitTime',
}

export const isInboundVoiceCallSummary = (call: VoiceCallSummary) =>
    call.direction === 'inbound'
