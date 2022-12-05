import crypto from 'crypto'
import {Call, Device, TwilioError} from '@twilio/voice-sdk'
import {pick} from 'lodash'

import {reportError} from 'utils/errors'
import socketManager from 'services/socketManager/socketManager'
import {SocketEventType} from 'services/socketManager/types'
import {
    MAX_DEVICE_RECONNECT_ATTEMPTS,
    DEFAULT_ERROR_MESSAGE,
    TwilioErrorCode,
    TwilioSocketEvent,
    TwilioSocketEventType,
    VoiceAppErrorCode,
    VoiceAppError,
} from 'business/twilio'
import {StoreDispatch} from 'state/types'
import {
    incrementReconnectAttempts,
    setCall,
    setDevice,
    setError,
    setIsConnecting,
    setIsDialing,
    setIsRinging,
    setWarning,
} from 'state/twilio/actions'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import {
    acceptCall,
    cancelCall,
    disconnectCall,
    getToken,
} from 'hooks/integrations/phone/api'

import * as utils from './utils'

export async function refreshToken(device: Device) {
    try {
        const token = await getToken()
        if (token) {
            device.updateToken(token)
        }
    } catch (error) {
        reportError(error as Error)
    }
}

export async function connectDevice(
    dispatch: StoreDispatch,
    reconnectAttempts: number
) {
    dispatch(setIsConnecting())
    await utils.sleep(reconnectAttempts * 5000)
    dispatch(incrementReconnectAttempts())

    const isHttps = window.location.protocol.startsWith('https')
    if (!isHttps) {
        const error = new VoiceAppError(VoiceAppErrorCode.HttpsProtoRequired)
        dispatch(setError(error))
        dispatch(setIsConnecting(false))
        reportError(error)
        return
    }

    const canReconnect = reconnectAttempts < MAX_DEVICE_RECONNECT_ATTEMPTS
    if (!canReconnect) {
        const error = new VoiceAppError(
            VoiceAppErrorCode.TooManyReconnectionAttepts
        )
        dispatch(setError(error))
        dispatch(setIsConnecting(false))
        reportError(error)
        return
    }

    const token = await getToken()
    if (!token) {
        const error = new VoiceAppError(VoiceAppErrorCode.MissingOrInvalidToken)
        dispatch(setError(error))
        dispatch(setIsConnecting(false))
        reportError(error)
        return
    }

    const device = utils.createDevice(token)
    dispatch(setDevice(device))
    await utils.registerDevice(device, dispatch)
    dispatch(setIsConnecting(false))
}

export const createDevice = (token: string): Device => {
    return new Device(token, {
        closeProtection: true,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        tokenRefreshMs: 30 * 1000,
        logLevel: 'debug',
    })
}

export async function registerDevice(device: Device, dispatch: StoreDispatch) {
    await device.register()
    utils.handleDeviceEvents(device, dispatch)
}

export function handleDeviceEvents(device: Device, dispatch: StoreDispatch) {
    device.on(Device.EventName.Registered, () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.DeviceRegistered,
        })

        dispatch(setError(null))
    })

    device.on(Device.EventName.Error, (error: TwilioError.TwilioError) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.DeviceError,
            data: {
                error,
            },
        })

        reportError(error)
        dispatch(setError(error))
    })

    device.on(Device.EventName.Unregistered, () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.DeviceUnregistered,
        })
    })

    device.on(Device.EventName.TokenWillExpire, () => {
        void utils.refreshToken(device)
    })

    device.on(Device.EventName.Incoming, (call: Call) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallIncoming,
            data: gatherCallContext(call),
        })

        dispatch(setIsRinging(true))
        dispatch(setCall(call))

        utils.handleCallEvents(call, dispatch)
    })
}

export function handleCallEvents(call: Call, dispatch: StoreDispatch) {
    call.on('accept', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallAccepted,
            data: gatherCallContext(call),
        })

        dispatch(setIsRinging(false))
        dispatch(setIsDialing(false))

        // When two agents pick up simultaneously, they both receive an "accept" event. However, the call is
        // actually accepted by the first agent only. The second agent then receives a "cancel" event and the
        // call status changes to "closed". Here, we wait a bit and then double-check the status, to avoid
        // creating wrong events "Call answered by x". See issue APPC-795

        setTimeout(() => utils.handleAcceptedCallEvent(call, dispatch), 1000)
    })

    call.on('reject', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallRejected,
            data: gatherCallContext(call),
        })

        dispatch(setCall(null))
        dispatch(setIsRinging(false))
        dispatch(setWarning(null))
    })

    call.on('cancel', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallCancelled,
            data: gatherCallContext(call),
        })

        dispatch(setCall(null))
        dispatch(setIsRinging(false))
        dispatch(setWarning(null))

        void cancelCall(call)
    })

    call.on('disconnect', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallDisconnected,
            data: gatherCallContext(call),
        })

        dispatch(setCall(null))
        dispatch(setIsRinging(false))
        dispatch(setWarning(null))

        void disconnectCall()
    })

    call.on('reconnected', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallReconnected,
            data: gatherCallContext(call),
        })

        dispatch(setError(null))
    })

    call.on('error', (error: TwilioError.TwilioError) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallError,
            data: {
                ...gatherCallContext(call),
                error,
            },
        })

        dispatch(setError(error))
        reportError(error)
    })

    call.on('warning', (metricName: string) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallWarningStarted,
            data: {
                ...gatherCallContext(call),
                metric_name: metricName,
            },
        })

        dispatch(setWarning(metricName))
    })

    call.on('warning-cleared', (metricName: string) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallWarningEnded,
            data: {
                ...gatherCallContext(call),
                metric_name: metricName,
            },
        })

        dispatch(setWarning(null))
    })
}

export function handleAcceptedCallEvent(call: Call, dispatch: StoreDispatch) {
    if (call.direction === Call.CallDirection.Outgoing) {
        return
    }

    if (call.status() === Call.State.Closed) {
        void dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'Another agent already accepted the call',
            })
        )

        void cancelCall()
    } else {
        void acceptCall(call)
    }
}

export function disconnectDevice(device: Device) {
    if (device.state === Device.State.Destroyed) {
        return
    }

    if (device.state === Device.State.Registered) {
        device.unregister().catch(reportError)
    }

    device.disconnectAll()
    device.removeAllListeners()
    device.destroy()
}

export function sendTwilioSocketEvent(event: TwilioSocketEvent) {
    if (
        event.type === TwilioSocketEventType.CallError ||
        event.type === TwilioSocketEventType.DeviceError
    ) {
        const error = pick(event.data.error, ['code', 'name', 'message'])
        socketManager.send(SocketEventType.TwilioEventTriggered, {
            ...event,
            data: {
                ...event.data,
                error,
            },
        })
    } else {
        socketManager.send(SocketEventType.TwilioEventTriggered, event)
    }
}

export function generateCallId(call: Call): string {
    const shasum = crypto.createHash('sha256')

    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            const from = call.customParameters.get('From')!
            const to = call.customParameters.get('To')!

            shasum.update(`${from}.${to}`)
            break
        }

        case Call.CallDirection.Incoming: {
            const from = call.parameters.From
            const to = call.customParameters.get('to')!

            shasum.update(`${from}.${to}`)
            break
        }
    }

    return shasum.digest('hex')
}

export function getCallSid(call: Call): Maybe<string> {
    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            return call.parameters.CallSid
        }
        case Call.CallDirection.Incoming: {
            return call.customParameters.get('call_sid')
        }
    }
}

export function gatherCallContext(call: Call): {
    id: string
    call_sid: Maybe<string>
} {
    return {
        id: generateCallId(call),
        call_sid: getCallSid(call),
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function errorMessage(error: Error): string {
    if (error instanceof TwilioError.TwilioError) {
        switch (error.code) {
            case TwilioErrorCode.UserMediaPermissionDenied:
                return `Microphone access has not been granted. (Error code: ${error.code})`
            default:
                return `${DEFAULT_ERROR_MESSAGE} (Error code: ${error.code})`
        }
    }

    return DEFAULT_ERROR_MESSAGE
}

export function isRecoverableError(error: Error): boolean {
    if (
        error instanceof TwilioError.TwilioError &&
        error.code === TwilioErrorCode.UserMediaPermissionDenied
    ) {
        return false
    }

    if (
        error instanceof VoiceAppError &&
        [
            VoiceAppErrorCode.HttpsProtoRequired,
            VoiceAppErrorCode.TooManyReconnectionAttepts,
        ].includes(error.code)
    ) {
        return false
    }

    return true
}
