import {useCallback, useEffect} from 'react'
import {Call, Device, TwilioError} from '@twilio/voice-sdk'

import {
    setCall,
    setDevice,
    setIsDialing,
    setIsRinging,
} from 'state/twilio/actions'
import client from 'models/api/resources'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {notify} from 'state/notifications/actions'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {usePhoneError} from 'hooks/integrations/phone/usePhoneError'
import {TwilioErrorCode, TwilioSocketEventType} from 'business/twilio'
import {
    getToken,
    sendTwilioSocketEvent,
    gatherCallContext,
} from 'hooks/integrations/phone/utils'
import {PHONE_EVENTS_LOGGING_ACCOUNTS} from 'hooks/integrations/phone/constants'

export function useDevice() {
    const dispatch = useAppDispatch()
    const {onErrorMessage, onError} = usePhoneError()
    const {device} = useAppSelector((state) => state.twilio)
    const instantiateDevice = useInstantiateDevice()

    useEffect(() => {
        if (device) {
            return
        }

        async function init() {
            const isHttps = window.location.protocol.startsWith('https')
            if (!isHttps) {
                return
            }

            const token = await getToken()
            if (!token) {
                onErrorMessage(
                    "Couldn't fetch phone token",
                    "Couldn't instantiate phone device"
                )
                return null
            }

            const newDevice = instantiateDevice(token)
            dispatch(setDevice(newDevice))
        }

        init().catch((error: Error) => {
            onError(error, "Couldn't initialize phone device")
        })

        return () => {
            if (device) {
                ;(device as Device).disconnectAll()
                dispatch(setDevice(null))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

function useInstantiateDevice() {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const shouldLogEvents = PHONE_EVENTS_LOGGING_ACCOUNTS.includes(
        currentAccount.get('domain')
    )
    const {onErrorMessage, onError, onTwilioError} = usePhoneError({
        ignoredErrorCodes: [
            TwilioErrorCode.AuthorizationAccessTokenExpired, // we refresh the token when it expires
            TwilioErrorCode.GeneralTransport, // Twilio has a retry mechanism when it happens
        ],
    })

    const onCallAlreadyAccepted = useCallback(() => {
        void dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'Another agent already accepted the call',
            })
        )
    }, [dispatch])

    const onCancel = useCallback(async () => {
        try {
            await client.post('/integrations/phone/call/canceled')
        } catch (error) {
            const message = "Couldn't mark phone call as canceled"
            error instanceof Error
                ? onError(error, message)
                : onError(new Error(message), message)
        }
    }, [onError])

    const onAccept = useCallback(
        async (call: Call) => {
            try {
                // When two agents pick up simultaneously, they both receive an "accept" event. However, the call is
                // actually accepted by the first agent only. The second agent then receives a "cancel" event and the
                // call status changes to "closed". Here, we wait a bit and then double-check the status, to avoid
                // creating wrong events "Call answered by x". See issue APPC-795
                await sleep(1000)
                if (call.status() === Call.State.Closed) {
                    onCallAlreadyAccepted()
                    await onCancel()
                    return
                }

                const integrationId = parseInt(
                    call.customParameters.get('integration_id') as string
                )
                const customerPhoneNumber = call.parameters.From
                const customerName = call.customParameters.get(
                    'customer_name'
                ) as string
                const ticketId = parseInt(
                    call.customParameters.get('ticket_id') as string
                )
                const callSid = call.customParameters.get('call_sid') as string

                await client.post('/integrations/phone/call/accepted', {
                    integration_id: integrationId,
                    ticket_id: ticketId,
                    call_sid: callSid,
                    customer: {
                        phone_number: customerPhoneNumber,
                        name: customerName,
                    },
                })

                dispatch(setIsDialing(false))
            } catch (error) {
                const message = "Couldn't mark phone call as accepted"
                error instanceof Error
                    ? onError(error, message)
                    : onError(new Error(message), message)
            }
        },
        [dispatch, onCallAlreadyAccepted, onCancel, onError]
    )

    return useCallback(
        (token: string) => {
            const device = new Device(token, {
                closeProtection: true,
                codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
                logLevel: 'debug',
            })

            void device.register()

            const maxReconnectionAttempts = 10
            let reconnectionAttempts = 0

            device.on(Device.EventName.Registered, () => {
                reconnectionAttempts = 0
                shouldLogEvents &&
                    sendTwilioSocketEvent({
                        type: TwilioSocketEventType.DeviceRegistered,
                    })
            })

            device.on(
                Device.EventName.Error,
                (error: TwilioError.TwilioError) => {
                    onTwilioError(error, 'Phone device error')
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.DeviceError,
                            data: {
                                error,
                            },
                        })
                }
            )

            device.on(Device.EventName.Unregistered, () => {
                if (reconnectionAttempts > maxReconnectionAttempts) {
                    onErrorMessage(
                        `Impossible to reconnect to phone device after ${maxReconnectionAttempts} attempts`
                    )
                    return
                }

                const timeout = 1000 * reconnectionAttempts
                reconnectionAttempts++

                shouldLogEvents &&
                    sendTwilioSocketEvent({
                        type: TwilioSocketEventType.DeviceUnregistered,
                    })

                setTimeout(() => {
                    getToken()
                        .then((token) => {
                            if (token) {
                                device.updateToken(token)
                            }
                        })
                        .catch((error: Error) => {
                            onError(error, "Couldn't refresh phone token")
                        })
                }, timeout)
            })

            device.on(Device.EventName.Incoming, (call: Call) => {
                dispatch(setIsRinging(true))
                dispatch(setCall(call))

                shouldLogEvents &&
                    sendTwilioSocketEvent({
                        type: TwilioSocketEventType.CallIncoming,
                        data: gatherCallContext(call),
                    })

                call.on('accept', () => {
                    dispatch(setIsRinging(false))
                    void onAccept(call)
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallAccepted,
                            data: gatherCallContext(call),
                        })
                })

                call.on('reject', () => {
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallRejected,
                            data: gatherCallContext(call),
                        })
                })

                call.on('cancel', () => {
                    dispatch(setCall(null))
                    dispatch(setIsRinging(false))
                    void onCancel()
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallCancelled,
                            data: gatherCallContext(call),
                        })
                })

                call.on('disconnect', () => {
                    dispatch(setCall(null))
                    dispatch(setIsRinging(false))
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallDisconnected,
                            data: gatherCallContext(call),
                        })
                })

                call.on('reconnected', () => {
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallReconnected,
                            data: gatherCallContext(call),
                        })
                })

                call.on('error', (error: TwilioError.TwilioError) => {
                    onTwilioError(error, 'Phone call error')
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallError,
                            data: {
                                ...gatherCallContext(call),
                                error,
                            },
                        })
                })

                call.on('warning', (metricName: string) => {
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallWarningStarted,
                            data: {
                                ...gatherCallContext(call),
                                metric_name: metricName,
                            },
                        })
                })

                call.on('warning-ended', (metricName: string) => {
                    shouldLogEvents &&
                        sendTwilioSocketEvent({
                            type: TwilioSocketEventType.CallWarningEnded,
                            data: {
                                ...gatherCallContext(call),
                                metric_name: metricName,
                            },
                        })
                })
            })

            return device
        },
        [
            dispatch,
            onAccept,
            onCancel,
            onError,
            onErrorMessage,
            onTwilioError,
            shouldLogEvents,
        ]
    )
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
