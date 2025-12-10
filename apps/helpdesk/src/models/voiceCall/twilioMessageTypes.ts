import type { MonitoringErrorCode, VoiceCallMonitoringStatus } from './types'

export enum TwilioMessageType {
    MonitoringValidationFailed = 'monitoring-validation-failed',
    InCallAgentChanged = 'in-call-agent-changed',
    MonitoringUpdate = 'monitoring-updated',
}

export type MonitoringValidationFailedTwilioMessage = {
    type: TwilioMessageType.MonitoringValidationFailed
    data: {
        error_code: MonitoringErrorCode
    }
}

export type InCallAgentChangedTwilioMessage = {
    type: TwilioMessageType.InCallAgentChanged
    data: {
        agent_id: string
    }
}

export type MonitoringUpdateTwilioMessage = {
    type: TwilioMessageType.MonitoringUpdate
    data: {
        monitoring_agent_id: number
        monitoring_status: VoiceCallMonitoringStatus
    }
}

export type TwilioMessage =
    | MonitoringValidationFailedTwilioMessage
    | InCallAgentChangedTwilioMessage
    | MonitoringUpdateTwilioMessage
