import {
    SetConnectionAction,
    SetDeviceAction,
    SetIsDialingAction,
    SetIsRecordingAction,
    SetIsRingingAction,
    TwilioAction,
} from './actions'
import {
    SET_TWILIO_CONNECTION,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RECORDING,
    SET_TWILIO_IS_RINGING,
} from './constants'
import {TwilioState} from './types'

export const initialState: TwilioState = {
    device: null,
    connection: null,
    isDialing: false,
    isRinging: false,
    isRecording: false,
}

export default function reducer(
    state: TwilioState = initialState,
    action: TwilioAction
): TwilioState {
    switch (action.type) {
        case SET_TWILIO_DEVICE:
            return {
                ...state,
                device: (action as SetDeviceAction).payload,
            }
        case SET_TWILIO_CONNECTION:
            return {
                ...state,
                connection: (action as SetConnectionAction).payload,
            }
        case SET_TWILIO_IS_DIALING:
            return {
                ...state,
                isDialing: (action as SetIsDialingAction).payload,
            }
        case SET_TWILIO_IS_RINGING:
            return {
                ...state,
                isRinging: (action as SetIsRingingAction).payload,
            }
        case SET_TWILIO_IS_RECORDING:
            return {
                ...state,
                isRecording: (action as SetIsRecordingAction).payload,
            }
        default:
            return state
    }
}
