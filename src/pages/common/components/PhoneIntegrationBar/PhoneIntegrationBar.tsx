import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {Call, Device, TwilioError} from '@twilio/voice-sdk'

import {
    setCall,
    setDevice,
    setIsDialing,
    setIsRinging,
} from '../../../../state/twilio/actions'
import {RootState} from '../../../../state/types'
import client from '../../../../models/api/resources'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {usePhoneError} from '../../../../hooks/integrations/phone/usePhoneError'
import {TwilioErrorCode} from '../../../../business/twilio'

import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

export default function PhoneIntegrationBar(): JSX.Element | null {
    useDevice()
    const {call, isDialing, isRinging} = useSelector(
        (state: RootState) => state.twilio
    )

    if (!call) {
        return null
    }

    if (isDialing) {
        return <OutgoingPhoneCall call={call} />
    }

    if (isRinging) {
        return <IncomingPhoneCall call={call} />
    }

    return <OngoingPhoneCall call={call} />
}

function useDevice() {
    const dispatch = useAppDispatch()
    const {onErrorMessage, onError} = usePhoneError()
    const {device} = useSelector((state: RootState) => state.twilio)
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
    }, [])
}

async function getToken(): Promise<string | null> {
    const response = await client.get('/integrations/phone/token')
    const data: {token: string | null} = await response.data
    return data.token
}

function useInstantiateDevice() {
    const dispatch = useAppDispatch()
    const {onErrorMessage, onError, onTwilioError} = usePhoneError({
        ignoredErrorCodes: [TwilioErrorCode.AuthorizationAccessTokenExpired],
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
            onError(error, "Couldn't mark phone call as canceled")
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
                onError(error, "Couldn't mark phone call as accepted")
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
            })

            device.on(
                Device.EventName.Error,
                (error: TwilioError.TwilioError) => {
                    onTwilioError(error, 'Phone device error')
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

                call.on('accept', () => {
                    dispatch(setIsRinging(false))
                    void onAccept(call)
                })

                call.on('cancel', () => {
                    dispatch(setCall(null))
                    dispatch(setIsRinging(false))
                    void onCancel()
                })

                call.on('disconnect', () => {
                    dispatch(setCall(null))
                    dispatch(setIsRinging(false))
                })

                call.on('error', (error: TwilioError.TwilioError) => {
                    onTwilioError(error, 'Phone call error')
                })
            })

            return device
        },
        [dispatch, onAccept, onCancel, onError, onErrorMessage, onTwilioError]
    )
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
