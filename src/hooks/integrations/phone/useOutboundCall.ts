import {useCallback} from 'react'
import {Connection, Device} from 'twilio-client'

import {PhoneCallDirection} from '../../../business/twilio'
import client from '../../../models/api/resources'

type Options = {
    fromAddress: string
    toAddress: string
    integrationId: number
    customerName: string
    ticketId: Maybe<number>
    agentId: number
}

export function useOutboundCall(
    device: Device | null,
    setIsDialing: (isDialing: boolean) => void,
    setConnection: (connection: Connection | null) => void
): (options: Options) => void {
    return useCallback(
        ({
            fromAddress,
            toAddress,
            integrationId,
            customerName,
            ticketId,
            agentId,
        }: Options) => {
            const params: Record<string, string> = {
                Direction: PhoneCallDirection.OutboundDial,
                Caller: fromAddress,
                Called: toAddress,
                From: fromAddress,
                To: toAddress,

                // Custom parameters:
                integration_id: integrationId.toString(),
                customer_name: customerName,
                agent_id: agentId.toString(),
                original_path: window.location.pathname,
            }

            if (!!ticketId) {
                params.original_ticket_id = ticketId.toString()
            }

            const connection = device?.connect(params)
            if (!connection) {
                return
            }

            connection.on('cancel', () => {
                setIsDialing(false)
                setConnection(null)
                onDisconnect().catch(console.error)
            })

            connection.on('disconnect', () => {
                setIsDialing(false)
                setConnection(null)
                onDisconnect().catch(console.error)
            })

            connection.on('error', console.error)

            setIsDialing(true)
            setConnection(connection)
            onConnect().catch(console.error)
        },
        [device, setIsDialing, setConnection]
    )
}

async function onConnect() {
    try {
        await client.post('/integrations/phone/call/connected')
    } catch (error) {
        console.error(error)
    }
}

async function onDisconnect() {
    try {
        await client.post('/integrations/phone/call/disconnected')
    } catch (error) {
        console.error(error)
    }
}
