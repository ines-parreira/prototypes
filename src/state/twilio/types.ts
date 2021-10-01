import {Call, Device} from '@twilio/voice-sdk'

export type TwilioState = {
    device: Device | null
    call: Call | null
    isDialing: boolean
    isRinging: boolean
    isRecording: boolean
}
