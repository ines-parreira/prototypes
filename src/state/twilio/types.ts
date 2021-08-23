import {Connection, Device} from 'twilio-client'

export type TwilioState = {
    device: Device | null
    connection: Connection | null
    isDialing: boolean
    isRinging: boolean
    isRecording: boolean
}
