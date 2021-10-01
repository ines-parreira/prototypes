import {Call} from '@twilio/voice-sdk'

type ConnectionParameters = {
    integrationId: number
    ticketId: number | null
    customerName: string
    customerPhoneNumber: string
}

export function useConnectionParameters(call: Call): ConnectionParameters {
    const integrationId = parseInt(
        call.customParameters.get('integration_id') as string
    )
    const ticketId =
        call.direction === Call.CallDirection.Incoming
            ? parseInt(call.customParameters.get('ticket_id') as string)
            : null
    const customerName = call.customParameters.get('customer_name') as string
    const customerPhoneNumber =
        call.direction === Call.CallDirection.Incoming
            ? call.parameters.From
            : (call.customParameters.get('To') as string)

    return {integrationId, ticketId, customerName, customerPhoneNumber}
}
