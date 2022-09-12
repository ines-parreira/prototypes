import {Call, Device} from '@twilio/voice-sdk'

import {
    SET_TWILIO_CALL,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RECORDING,
    SET_TWILIO_IS_RINGING,
    SET_TWILIO_ERROR,
    SET_TWILIO_WARNING,
} from './constants'

export type SetDeviceAction = {
    type: string
    payload: Device | null
}

export type SetConnectionAction = {
    type: string
    payload: Call | null
}

export type SetIsDialingAction = {
    type: string
    payload: boolean
}

export type SetIsRingingAction = {
    type: string
    payload: boolean
}

export type SetIsRecordingAction = {
    type: string
    payload: boolean
}
export type SetErrorAction = {
    type: string
    payload: Error | null
}
export type SetWarningAction = {
    type: string
    payload: string | null
}

export type TwilioAction =
    | SetDeviceAction
    | SetConnectionAction
    | SetIsDialingAction
    | SetIsRingingAction

export function setDevice(device: Device | null): SetDeviceAction {
    return {
        type: SET_TWILIO_DEVICE,
        payload: device,
    }
}

export function setCall(call: Call | null): SetConnectionAction {
    return {
        type: SET_TWILIO_CALL,
        payload: call,
    }
}

export function setIsDialing(isDialing: boolean): SetIsDialingAction {
    return {
        type: SET_TWILIO_IS_DIALING,
        payload: isDialing,
    }
}

export function setIsRinging(isRinging: boolean): SetIsRingingAction {
    return {
        type: SET_TWILIO_IS_RINGING,
        payload: isRinging,
    }
}

export function setIsRecording(isRecording: boolean): SetIsRingingAction {
    return {
        type: SET_TWILIO_IS_RECORDING,
        payload: isRecording,
    }
}

export function setError(error: Error | null): SetErrorAction {
    return {
        type: SET_TWILIO_ERROR,
        payload: error,
    }
}

export function setWarning(warning: string | null): SetWarningAction {
    return {
        type: SET_TWILIO_WARNING,
        payload: warning,
    }
}
