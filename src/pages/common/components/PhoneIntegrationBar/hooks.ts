import {Connection} from 'twilio-client'

type ConnectionParameters = {
    integrationId: number
    customerName: string
    customerPhoneNumber: string
}

export function useConnectionParameters(
    connection: Connection
): ConnectionParameters {
    const integrationId = parseInt(
        connection.customParameters.get('integration_id') as string
    )
    const customerName = connection.customParameters.get(
        'customer_name'
    ) as string
    const customerPhoneNumber =
        connection.direction === Connection.CallDirection.Incoming
            ? connection.parameters.From
            : (connection.customParameters.get('To') as string)

    return {integrationId, customerName, customerPhoneNumber}
}
