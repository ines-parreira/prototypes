import {Call, Device} from '@twilio/voice-sdk'

export enum PreflightCheckStatus {
    NotPerformed = 'NotPerformed',
    Running = 'Running',
    Succeeded = 'Succeeded',
    Failed = 'Failed',
}

export type TwilioState = {
    device: Device | null
    call: Call | null
    isDialing: boolean
    isRinging: boolean
    isRecording: boolean
    preflightCheckStatus: PreflightCheckStatus
}
