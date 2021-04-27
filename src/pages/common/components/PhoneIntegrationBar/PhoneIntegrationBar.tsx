import React, {useEffect} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Connection, Device} from 'twilio-client'

import {
    setConnection,
    setDevice,
    setIsRinging,
} from '../../../../state/twilio/actions'
import {RootState} from '../../../../state/types'
import client from '../../../../models/api/resources'

import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'

type Props = ConnectedProps<typeof connector>

function PhoneIntegrationBar({
    device,
    connection,
    isRinging,
    setDevice,
    setConnection,
    setIsRinging,
}: Props): JSX.Element | null {
    useDevice(device, setDevice, setConnection, setIsRinging)

    if (!connection) {
        return null
    }

    if (isRinging) {
        return <IncomingPhoneCall connection={connection} />
    }

    return <OngoingPhoneCall connection={connection} />
}

const mapStateToProps = (state: RootState) => state.twilio
const mapDispatchToProps = {
    setDevice,
    setConnection,
    setIsRinging,
}
const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(PhoneIntegrationBar)

function useDevice(
    device: Device | null,
    setDevice: (device: Device | null) => void,
    setConnection: (connection: Connection | null) => void,
    setIsRinging: (isRinging: boolean) => void
) {
    useEffect(() => {
        if (device) {
            return
        }

        async function init() {
            const token = await getToken()
            if (!token) {
                return null
            }

            const newDevice = instantiateDevice(
                token,
                setConnection,
                setIsRinging
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
    }, [device, setConnection, setDevice, setIsRinging])
}

async function getToken(): Promise<string | null> {
    const response = await client.get('/integrations/phone/token')
    const data: {token: string | null} = await response.data
    return data.token
}

function instantiateDevice(
    token: string,
    setConnection: (connection: Connection | null) => void,
    setIsRinging: (isRinging: boolean) => void
): Device {
    const device = new Device(token, {
        enableRingingState: true,
        closeProtection: true,
        debug: true,
        warnings: true,
    })

    device.on('error', console.error)

    device.on('offline', () => {
        setConnection(null)

        getToken()
            .then((token) => {
                if (token) {
                    device.setup(token)
                }
            })
            .catch(console.error)
    })

    device.on('incoming', (connection: Connection) => {
        setIsRinging(true)
        setConnection(connection)

        connection.on('accept', () => {
            setIsRinging(false)
            onAccept(connection).catch(console.error)
        })

        connection.on('cancel', () => {
            setConnection(null)
            setIsRinging(false)
            onCancel().catch(console.error)
        })

        connection.on('disconnect', () => {
            setConnection(null)
            setIsRinging(false)
        })

        connection.on('error', console.error)
    })

    return device
}

async function onAccept(connection: Connection) {
    try {
        const integrationId = parseInt(
            connection.customParameters.get('integration_id') as string
        )
        const customerPhoneNumber = connection.parameters.From
        const customerName = connection.customParameters.get(
            'customer_name'
        ) as string
        const ticketId = parseInt(
            connection.customParameters.get('ticket_id') as string
        )
        const callSid = connection.customParameters.get('call_sid') as string

        await client.post('/integrations/phone/call/accepted', {
            integration_id: integrationId,
            ticket_id: ticketId,
            call_sid: callSid,
            customer: {
                phone_number: customerPhoneNumber,
                name: customerName,
            },
        })
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
