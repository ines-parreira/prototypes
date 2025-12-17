import { useEffect, useState } from 'react'

import { Call } from '@twilio/voice-sdk'

type ConnectionParameters = {
    integrationId: number
    ticketId: number | null
    customerName: string
    customerPhoneNumber: string
    transferFromAgentId?: number | null
    isTransferring: boolean
    isPossibleSpam: boolean
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

    const isTransferring =
        call.customParameters.get('transfer')?.toLowerCase() === 'true'

    const isPossibleSpamValue = call.customParameters.get('is_possible_spam')
    const isPossibleSpam =
        call.direction === Call.CallDirection.Incoming &&
        isPossibleSpamValue?.toLowerCase() === 'true'
    return {
        integrationId,
        ticketId,
        customerName,
        customerPhoneNumber,
        transferFromAgentId,
        isTransferring,
        isPossibleSpam,
    }
}

export function useAudioLevel(call: Call): number {
    const [audioLevel, setAudioLevel] = useState(0)

    useEffect(() => {
        const handleVolume = (inputVolume: number) => {
            setAudioLevel(inputVolume)
        }

        call.on('volume', handleVolume)

        return () => {
            call.off('volume', handleVolume)
        }
    }, [call])

    return audioLevel
}
