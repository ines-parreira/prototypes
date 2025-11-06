import { MonitoringErrorCode } from './types'

export enum TwilioMessageType {
    MonitoringValidationFailed = 'monitoring-validation-failed',
    InCallAgentChanged = 'in-call-agent-changed',
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

export type TwilioMessage =
    | MonitoringValidationFailedTwilioMessage
    | InCallAgentChangedTwilioMessage
