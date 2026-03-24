import { FeatureFlagKey, getLDClient } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { isProduction } from '@repo/utils'
import { Call, Device, TwilioError } from '@twilio/voice-sdk'

import {
    DEFAULT_ERROR_MESSAGE,
    MAX_DEVICE_RECONNECT_ATTEMPTS,
    TwilioErrorCode,
    TwilioSocketEventType,
    VoiceAppError,
    VoiceAppErrorCode,
} from 'business/twilio'
import {
    desktopNotify,
    requestNotificationPermission,
} from 'common/notifications'
import { declineCall, getToken } from 'hooks/integrations/phone/api'
import { CALL_FAILED_MICROPHONE_PERMISSION_ERROR } from 'pages/common/components/PhoneIntegrationBar/constants'
import type { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import type { StoreDispatch } from 'state/types'

import {
    gatherCallContext,
    getCallSid,
    handleCallEvents,
    sendTwilioSocketEvent,
} from './twilioCall.utils'
import * as utils from './utils'

export async function refreshToken(device: Device) {
    try {
        const token = await getToken()
        if (token && device.state !== Device.State.Destroyed) {
            device.updateToken(token)
        }
    } catch (error) {
        reportError(error as Error)
    }
}

export async function connectDevice(
    dispatch: StoreDispatch,
    reconnectAttempts: number,
    actions: VoiceDeviceActions,
) {
    actions.setIsConnecting(true)
    await utils.sleep(reconnectAttempts * 5000)
    actions.incrementReconnectAttempts()

    const isHttps = window.location.protocol.startsWith('https')
    if (isProduction() && !isHttps) {
        const error = new VoiceAppError(VoiceAppErrorCode.HttpsProtoRequired)
        actions.setError(error)
        actions.setIsConnecting(false)
        reportError(error)
        return
    }

    const canReconnect = reconnectAttempts < MAX_DEVICE_RECONNECT_ATTEMPTS
    if (!canReconnect) {
        const error = new VoiceAppError(
            VoiceAppErrorCode.TooManyReconnectionAttepts,
        )
        actions.setError(error)
        actions.setIsConnecting(false)
        reportError(error)
        return
    }

    try {
        const token = await getToken()

        if (!token) {
            const error = new VoiceAppError(
                VoiceAppErrorCode.MissingOrInvalidToken,
            )
            actions.setError(error)
            actions.setIsConnecting(false)
            reportError(error)
            return
        }

        const device = utils.createDevice(token)
        await utils.registerDevice(device, dispatch, actions)
        actions.setDevice(device)
        actions.resetReconnectAttempts()
        actions.setIsConnecting(false)
    } catch (error) {
        actions.setError(error as Error)
        actions.setIsConnecting(false)
    }
}

export const createDevice = (token: string): Device => {
    return new Device(token, {
        closeProtection: true,
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        tokenRefreshMs: 30 * 1000,
        logLevel: 'error',
        allowIncomingWhileBusy: true,
    })
}

export async function setAudioConstraints(device: Device) {
    if (!device.audio) {
        return
    }

    try {
        await device.audio.setAudioConstraints({
            noiseSuppression: true,
        })
    } catch {
        reportError(new Error('Could not set audio constraints'))
    }
}

export async function registerDevice(
    device: Device,
    dispatch: StoreDispatch,
    actions: VoiceDeviceActions,
) {
    await device.register()
    await setAudioConstraints(device)

    utils.handleDeviceEvents(device, dispatch, actions)
}

export function handleDeviceEvents(
    device: Device,
    dispatch: StoreDispatch,
    actions: VoiceDeviceActions,
) {
    device.on(Device.EventName.Registered, () => {
        sendTwilioSocketEvent({
            type: TwilioSocketEventType.DeviceRegistered,
        })

        actions.setError(null)
    })

    device.on(Device.EventName.Error, (error: TwilioError.TwilioError) => {
        const ignoredWSEventCodes = [
            TwilioErrorCode.GeneralUnknown,
            TwilioErrorCode.GeneralConnection,
            TwilioErrorCode.AuthorizationAccessTokenInvalid,
            TwilioErrorCode.GeneralTransport,
        ]

        if (!ignoredWSEventCodes.includes(error.code)) {
            sendTwilioSocketEvent({
                type: TwilioSocketEventType.DeviceError,
                data: {
                    error,
                },
            })
        }

        actions.setError(error)

        switch (error.code) {
            case TwilioErrorCode.AuthorizationAccessTokenExpired:
            case TwilioErrorCode.AuthorizationAccessTokenInvalid:
                void utils.disconnectDevice(device, actions)
                break

            default:
                reportVoiceError(error)
                break
        }
    })

    device.on(Device.EventName.Unregistered, () => {
        sendTwilioSocketEvent({
            type: TwilioSocketEventType.DeviceUnregistered,
        })
    })

    device.on(Device.EventName.TokenWillExpire, () => {
        void utils.refreshToken(device)
    })

    device.on(Device.EventName.Incoming, async (call: Call) => {
        if (device.isBusy) {
            reportError(
                new Error('Incoming call for agent already in a call'),
                { extra: { call: call.toString() } },
            )

            call.reject()
            call.emit('cancel')

            void declineCall(call)
            return
        }

        sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallIncoming,
            data: gatherCallContext(call),
        })

        actions.setIsRinging(true)
        actions.setCall(call)

        handleCallEvents(call, dispatch, actions)

        const ld = getLDClient()
        const hasDesktopNotifications = ld.variation(
            FeatureFlagKey.DesktopNotifications,
        )
        if (hasDesktopNotifications) {
            const hasPermission = await requestNotificationPermission()
            if (hasPermission) {
                const callSid = getCallSid(call)
                desktopNotify(callSid, 'Incoming call')
            }
        }
    })
}

export async function disconnectDevice(
    device: Device,
    actions: VoiceDeviceActions,
) {
    try {
        if (device.state === Device.State.Registered) {
            device.disconnectAll()
            await device.unregister()
        }

        if (device.state !== Device.State.Destroyed) {
            device.destroy()
        }

        device.removeAllListeners()
    } catch (error) {
        reportVoiceError(error)
    } finally {
        actions.setDevice(null)
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function errorMessage(error: Error): string {
    if (error instanceof TwilioError.TwilioError) {
        switch (error.code) {
            case TwilioErrorCode.UserMediaPermissionDenied:
                return CALL_FAILED_MICROPHONE_PERMISSION_ERROR
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

const reportVoiceError = (error: unknown) => {
    const ignoredTwilioErrors = [
        TwilioErrorCode.AuthorizationAccessTokenExpired,
        TwilioErrorCode.AuthorizationAccessTokenInvalid,
    ]

    if (
        error instanceof TwilioError.TwilioError &&
        ignoredTwilioErrors.includes(error.code)
    ) {
        return
    }

    reportError(error)
}
