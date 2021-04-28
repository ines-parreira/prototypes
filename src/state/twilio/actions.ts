import {Connection, Device} from 'twilio-client'

import {
    SET_TWILIO_CONNECTION,
    SET_TWILIO_DEVICE,
    SET_TWILIO_IS_DIALING,
    SET_TWILIO_IS_RINGING,
} from './constants'

export type SetDeviceAction = {
    type: string
    payload: Device | null
}

export type SetConnectionAction = {
    type: string
    payload: Connection | null
}

export type SetIsDialingAction = {
    type: string
    payload: boolean
}

export type SetIsRingingAction = {
    type: string
    payload: boolean
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

export function setConnection(
    connection: Connection | null
): SetConnectionAction {
    return {
        type: SET_TWILIO_CONNECTION,
        payload: connection,
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
