import {Call, Device} from '@twilio/voice-sdk'
import {PreflightCheckStatus} from 'state/twilio/types'
import {
    SET_TWILIO_CALL,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RECORDING,
    SET_TWILIO_IS_RINGING,
    SET_TWILIO_PREFLIGHT_CHECK_STATUS,
} from 'state/twilio/constants'

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

export type SetPreflightCheckStatusAction = {
    type: string
    payload: PreflightCheckStatus
}

export type TwilioAction =
    | SetDeviceAction
    | SetConnectionAction
    | SetIsDialingAction
    | SetIsRingingAction
    | SetPreflightCheckStatusAction

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

export function setPreflightCheckStatus(
    status: PreflightCheckStatus
): SetPreflightCheckStatusAction {
    return {
        type: SET_TWILIO_PREFLIGHT_CHECK_STATUS,
        payload: status,
    }
}
