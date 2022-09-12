import {
    SetConnectionAction,
    SetDeviceAction,
    SetErrorAction,
    SetIsDialingAction,
    SetIsRecordingAction,
    SetIsRingingAction,
    SetWarningAction,
    TwilioAction,
} from './actions'
import {
    SET_TWILIO_CALL,
    SET_TWILIO_DEVICE,
    SET_TWILIO_ERROR,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RECORDING,
    SET_TWILIO_IS_RINGING,
    SET_TWILIO_WARNING,
} from './constants'
import {TwilioState} from './types'

export const initialState: TwilioState = {
    device: null,
    call: null,
    isDialing: false,
    isRinging: false,
    isRecording: false,
    warning: null,
    error: null,
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
        case SET_TWILIO_CALL:
            return {
                ...state,
                call: (action as SetConnectionAction).payload,
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
        case SET_TWILIO_ERROR:
            return {
                ...state,
                error: (action as SetErrorAction).payload,
            }
        case SET_TWILIO_WARNING:
            return {
                ...state,
                warning: (action as SetWarningAction).payload,
            }
        default:
            return state
    }
}
