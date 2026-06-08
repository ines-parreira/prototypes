import { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useGetTicket } from '@gorgias/helpdesk-queries'

export function useTicketMessageAddresses(ticketId?: number) {
    const { data: ticketData } = useGetTicket(ticketId || 0, undefined, {
        query: {
            enabled: !!ticketId,
            staleTime: Duration.minutes(5),
        },
    })

    const ticketMessageAddresses = useMemo(() => {
        const addresses = new Set<string>()

        if (ticketData?.data?.messages) {
            ticketData.data.messages.forEach((message: any) => {
                const fromAddress = message.source?.from?.address
                if (fromAddress) {
                    addresses.add(fromAddress)
                }

                message.source?.to?.forEach((recipient: any) => {
                    if (recipient?.address) {
                        addresses.add(recipient.address)
                    }
                })
            })
        }

        return addresses
    }, [ticketData?.data?.messages])

    return ticketMessageAddresses
}
