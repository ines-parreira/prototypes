import {Call, Device} from '@twilio/voice-sdk'

export type State = {
    device?: Device | null
    call?: Call | null
    isRinging: boolean
    isDialing: boolean
    isConnecting?: boolean
    error: Error | null
    warning: string | null
    reconnectAttempts: number
}

export const initialState: State = {
    device: null,
    call: null,
    isRinging: false,
    isDialing: false,
    isConnecting: false,
    error: null,
    warning: null,
    reconnectAttempts: 0,
}
