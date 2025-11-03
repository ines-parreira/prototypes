export enum TwilioMessageType {
    MonitoringValidationFailed = 'monitoring-validation-failed',
}

export type MonitoringValidationFailedTwilioMessage = {
    type: TwilioMessageType.MonitoringValidationFailed
    data: {
        error_code: string
    }
}

export type TwilioMessage = MonitoringValidationFailedTwilioMessage
