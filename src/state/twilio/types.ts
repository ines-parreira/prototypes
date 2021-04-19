import {Connection, Device} from 'twilio-client'

export type TwilioState = {
    device: Device | null
    connection: Connection | null
    isRinging: boolean
}
