import React, {useCallback, useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Call, Device} from '@twilio/voice-sdk'

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

import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

type Props = ConnectedProps<typeof connector>

function PhoneIntegrationBar({
    device,
    call,
    isDialing,
    isRinging,
    setDevice,
    setCall,
    setIsDialing,
    setIsRinging,
}: Props): JSX.Element | null {
    useDevice(device, setDevice, setCall, setIsDialing, setIsRinging)

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

const mapStateToProps = (state: RootState) => state.twilio
const mapDispatchToProps = {
    setDevice,
    setCall,
    setIsDialing,
    setIsRinging,
}
const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(PhoneIntegrationBar)

function useDevice(
    device: Device | null,
    setDevice: (device: Device | null) => void,
    setCall: (call: Call | null) => void,
    setIsDialing: (isDialing: boolean) => void,
    setIsRinging: (isRinging: boolean) => void
) {
    const dispatch = useAppDispatch()

    const onCallAlreadyAccepted = useCallback(() => {
        void dispatch(
            notify({
                status: NotificationStatus.Info,
                message: 'Another agent already accepted the call',
            })
        )
    }, [dispatch])

    useEffect(() => {
        if (device) {
            return
        }

        async function init() {
            const token = await getToken()
            const isHttps = window.location.protocol.startsWith('https')
            if (!token || !isHttps) {
                return null
            }

            const newDevice = instantiateDevice(
                token,
                setCall,
                setIsDialing,
                setIsRinging,
                onCallAlreadyAccepted
            )

            setDevice(newDevice)
        }

        init().catch(console.error)

        return () => {
            if (device) {
                ;(device as Device).disconnectAll()
                setDevice(null)
            }
        }
    }, [
        device,
        setCall,
        setDevice,
        setIsDialing,
        setIsRinging,
        onCallAlreadyAccepted,
    ])
}

async function getToken(): Promise<string | null> {
    const response = await client.get('/integrations/phone/token')
    const data: {token: string | null} = await response.data
    return data.token
}

function instantiateDevice(
    token: string,
    setCall: (call: Call | null) => void,
    setIsDialing: (isDialing: boolean) => void,
    setIsRinging: (isRinging: boolean) => void,
    onCallAlreadyAccepted: () => void
): Device {
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
    device.on(Device.EventName.Error, console.error)

    device.on(Device.EventName.Unregistered, () => {
        if (reconnectionAttempts > maxReconnectionAttempts) {
            console.error(
                `Impossible to reconnect to Twilio after ${maxReconnectionAttempts} attempts`
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
                .catch(console.error)
        }, timeout)
    })

    device.on(Device.EventName.Incoming, (call: Call) => {
        setIsRinging(true)
        setCall(call)

        call.on('accept', () => {
            setIsRinging(false)
            onAccept(call, onCallAlreadyAccepted).catch(console.error)
        })

        call.on('cancel', () => {
            setCall(null)
            setIsRinging(false)
            onCancel().catch(console.error)
        })

        call.on('disconnect', () => {
            setCall(null)
            setIsRinging(false)
        })

        call.on('error', console.error)
    })

    return device
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function onAccept(call: Call, onCallAlreadyAccepted: () => void) {
    try {
        // When two agents pick up simultaneously, they both receive an "accept" event. However, the call is actually
        // accepted by the first agent only. The second agent then receives a "cancel" event and the call status changes
        // to "closed". Here, we wait a bit and then double-check the status, to avoid creating wrong events "Call
        // answered by x". See issue APPC-795
        await sleep(1000)
        if (call.status() === Call.State.Closed) {
            onCallAlreadyAccepted()
            onCancel().catch(console.error)
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
        setIsDialing(false)
    } catch (error) {
        console.error(error)
    }
}

async function onCancel() {
    try {
        await client.post('/integrations/phone/call/canceled')
    } catch (error) {
        console.error(error)
    }
}
