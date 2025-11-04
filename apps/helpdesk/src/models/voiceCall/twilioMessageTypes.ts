import { MonitoringErrorCode } from './types'

export enum TwilioMessageType {
    MonitoringValidationFailed = 'monitoring-validation-failed',
}

export type MonitoringValidationFailedTwilioMessage = {
    type: TwilioMessageType.MonitoringValidationFailed
    data: {
        error_code: MonitoringErrorCode
    }
}

export type TwilioMessage = MonitoringValidationFailedTwilioMessage
