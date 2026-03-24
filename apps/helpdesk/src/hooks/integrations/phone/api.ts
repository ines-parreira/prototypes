import { reportError } from '@repo/logging'
import type { Call } from '@twilio/voice-sdk'

import client from 'models/api/resources'

export async function getToken(): Promise<string | null> {
    const response = await client.get('/integrations/phone/token')
    const data: { token: string | null } = await response.data
    return data.token
}

export async function acceptCall(call: Call) {
    try {
        const integrationId = parseInt(
            call.customParameters.get('integration_id') as string,
        )
        const customerPhoneNumber = call.parameters.From
        const customerName = call.customParameters.get(
            'customer_name',
        ) as string
        const customerId = parseInt(
            call.customParameters.get('customer_id') as string,
        )
        const ticketId = parseInt(
            call.customParameters.get('ticket_id') as string,
        )
        const callSid = call.customParameters.get('call_sid') as string

        await client.post('/integrations/phone/call/accepted', {
            integration_id: integrationId,
            ticket_id: ticketId,
            call_sid: callSid,
            customer: {
                id: customerId,
                phone_number: customerPhoneNumber,
                name: customerName,
            },
        })
    } catch (error) {
        reportError(error as Error)
    }
}

export async function cancelCall(call?: Call) {
    try {
        if (call === undefined) {
            await client.post('/integrations/phone/call/canceled')
        } else {
            const ticketId = parseInt(
                call.customParameters.get('ticket_id') as string,
            )
            const callSid = call.customParameters.get('call_sid') as string
            await client.post('/integrations/phone/call/canceled', {
                ticket_id: ticketId,
                call_sid: callSid,
            })
        }
    } catch (error) {
        reportError(error as Error)
    }
}

export async function connectCall() {
    try {
        await client.post('/integrations/phone/call/connected')
    } catch (error) {
        reportError(error as Error)
    }
}

export async function disconnectCall() {
    try {
        await client.post('/integrations/phone/call/disconnected')
    } catch (error) {
        reportError(error as Error)
    }
}

export async function declineCall(call: Call) {
    try {
        const ticketId = parseInt(
            call.customParameters.get('ticket_id') as string,
        )
        const callSid = call.customParameters.get('call_sid') as string

        await client.post('/integrations/phone/call/declined', {
            ticket_id: ticketId,
            call_sid: callSid,
        })
    } catch (error) {
        reportError(error as Error)
    }
}
