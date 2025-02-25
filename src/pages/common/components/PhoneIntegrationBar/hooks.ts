import { Call } from '@twilio/voice-sdk'

type ConnectionParameters = {
    integrationId: number
    ticketId: number | null
    customerName: string
    customerPhoneNumber: string
    transferFromAgentId?: number | null
}

export function useConnectionParameters(call: Call): ConnectionParameters {
    const integrationId = parseInt(
        call.customParameters.get('integration_id') as string,
    )
    const ticketId =
        call.direction === Call.CallDirection.Incoming
            ? parseInt(call.customParameters.get('ticket_id') as string)
            : null
    const customerName = call.customParameters.get('customer_name') as string

    const inboundCallCustomerPhoneNumber =
        call.customParameters.get('customer_phone_number') ?? ''

    const customerPhoneNumber =
        call.direction === Call.CallDirection.Incoming
            ? inboundCallCustomerPhoneNumber
            : (call.customParameters.get('To') as string)

    const transferFromAgentIdToNumber = Number(
        call.customParameters.get('transfer.from'),
    )
    const transferFromAgentId = isNaN(transferFromAgentIdToNumber)
        ? null
        : transferFromAgentIdToNumber

    return {
        integrationId,
        ticketId,
        customerName,
        customerPhoneNumber,
        transferFromAgentId,
    }
}
