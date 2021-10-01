import {useCallback} from 'react'
import {Call, Device} from '@twilio/voice-sdk'

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
    setCall: (call: Call | null) => void
): (options: Options) => void {
    return useCallback(
        async ({
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

            const call = await device?.connect({params: params})
            if (!call) {
                return
            }

            call.on('accept', () => {
                setIsDialing(false)
            })

            call.on('cancel', () => {
                setIsDialing(false)
                setCall(null)
                onDisconnect().catch(console.error)
            })

            call.on('disconnect', () => {
                setIsDialing(false)
                setCall(null)
                onDisconnect().catch(console.error)
            })

            call.on('error', console.error)

            setIsDialing(true)
            setCall(call)
            onConnect().catch(console.error)
        },
        [device, setIsDialing, setCall]
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
