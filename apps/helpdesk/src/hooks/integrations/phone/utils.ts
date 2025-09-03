import { FeatureFlagKey } from '@repo/feature-flags'
import { Call, Device, TwilioError } from '@twilio/voice-sdk'
import crypto from 'crypto'
import { pick } from 'lodash'

import { appQueryClient } from 'api/queryClient'
import {
    DEFAULT_ERROR_MESSAGE,
    MAX_DEVICE_RECONNECT_ATTEMPTS,
    TwilioErrorCode,
    TwilioSocketEvent,
    TwilioSocketEventType,
    VoiceAppError,
    VoiceAppErrorCode,
} from 'business/twilio'
import {
    desktopNotify,
    requestNotificationPermission,
} from 'common/notifications'
import {
    acceptCall,
    cancelCall,
    declineCall,
    disconnectCall,
    getToken,
} from 'hooks/integrations/phone/api'
import { UseListVoiceCalls, voiceCallsKeys } from 'models/voiceCall/queries'
import { ListVoiceCallsParams } from 'models/voiceCall/types'
import { CALL_FAILED_MICROPHONE_PERMISSION_ERROR } from 'pages/common/components/PhoneIntegrationBar/constants'
import { VoiceDeviceActions } from 'pages/integrations/integration/components/voice/types'
import { ActivityEvents, logActivityEvent } from 'services/activityTracker'
import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { StoreDispatch } from 'state/types'
import { isProduction } from 'utils/environment'
import { reportError } from 'utils/errors'
import { getLDClient } from 'utils/launchDarkly'

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
        utils.sendTwilioSocketEvent({
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
            utils.sendTwilioSocketEvent({
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
                reportError(error)
                break
        }
    })

    device.on(Device.EventName.Unregistered, () => {
        utils.sendTwilioSocketEvent({
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

        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallIncoming,
            data: gatherCallContext(call),
        })

        actions.setIsRinging(true)
        actions.setCall(call)

        utils.handleCallEvents(call, dispatch, actions)

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

export function handleCallEvents(
    call: Call,
    dispatch: StoreDispatch,
    actions: VoiceDeviceActions,
) {
    call.on('accept', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallAccepted,
            data: gatherCallContext(call),
        })

        actions.setIsRinging(false)
        actions.setIsDialing(false)

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

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)
    })

    call.on('cancel', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallCancelled,
            data: gatherCallContext(call),
        })

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)

        void cancelCall(call)
    })

    call.on('disconnect', () => {
        utils.logCallEnd(call)

        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallDisconnected,
            data: gatherCallContext(call),
        })

        actions.setCall(null)
        actions.setIsRinging(false)
        actions.setWarning(null)
        actions.setIsDialing(false)

        void disconnectCall()
    })

    call.on('reconnected', () => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallReconnected,
            data: gatherCallContext(call),
        })

        actions.setError(null)
    })

    call.on('error', (error: TwilioError.TwilioError) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallError,
            data: {
                ...gatherCallContext(call),
                error,
            },
        })

        actions.setError(error)
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

        actions.setWarning(metricName)
    })

    call.on('warning-cleared', (metricName: string) => {
        utils.sendTwilioSocketEvent({
            type: TwilioSocketEventType.CallWarningEnded,
            data: {
                ...gatherCallContext(call),
                metric_name: metricName,
            },
        })

        actions.setWarning(null)
    })
}

export function logCallEnd(call: Call) {
    let ticketId: string | number | undefined
    const phoneCallId = getCallSid(call)

    if (call.customParameters.get('ticket_id')) {
        ticketId = call.customParameters.get('ticket_id') as string
    } else {
        const ticketIdQueryKey = appQueryClient
            .getQueriesData<UseListVoiceCalls>(voiceCallsKeys.lists())
            .find(([, data]) => {
                return !!data?.data.find(
                    (call) => call.external_id === phoneCallId,
                )
            })?.[0]

        ticketId = (ticketIdQueryKey?.[2] as ListVoiceCallsParams)?.ticket_id
    }

    logActivityEvent(ActivityEvents.UserFinishedPhoneCall, {
        entityId: Number(ticketId),
        entityType: 'ticket',
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
            }),
        )

        void cancelCall()
    } else {
        void acceptCall(call)
        const ticketId = parseInt(
            call.customParameters.get('ticket_id') as string,
        )
        logActivityEvent(ActivityEvents.UserStartedPhoneCall, {
            entityId: ticketId,
            entityType: 'ticket',
        })
    }
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
        if (error instanceof Error) {
            reportError(error)
        }
    } finally {
        actions.setDevice(null)
    }
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

export function getCallSid(call: Call): string {
    switch (call.direction) {
        case Call.CallDirection.Outgoing: {
            return call.parameters.CallSid
        }
        case Call.CallDirection.Incoming: {
            return call.customParameters.get('call_sid') as string
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
