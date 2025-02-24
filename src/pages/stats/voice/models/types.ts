import {VoiceCallDirection} from '@gorgias/api-queries'

import {
    VoiceCallDimension,
    VoiceCallMeasure,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {VoiceCallDisplayStatus, VoiceCallStatus} from 'models/voiceCall/types'

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
}

export enum VoiceCallFilterOptions {
    All = 'all',
    Inbound = 'inbound',
    Outbound = 'outbound',
    Missed = 'missed',
}

export enum VoiceCallAverageTimeMetric {
    TalkTime = 'averageTalkTime',
    WaitTime = 'averageWaitTime',
}

export const isInboundVoiceCallSummary = (call: VoiceCallSummary) =>
    call.direction === 'inbound'

export const getVoiceSegmentFromFilter = (
    filter?: VoiceCallFilterOptions
): VoiceCallSegment | undefined => {
    switch (filter) {
        case VoiceCallFilterOptions.All:
            return undefined
        case VoiceCallFilterOptions.Inbound:
            return VoiceCallSegment.inboundCalls
        case VoiceCallFilterOptions.Outbound:
            return VoiceCallSegment.outboundCalls
        case VoiceCallFilterOptions.Missed:
            return VoiceCallSegment.missedCalls
    }
}
