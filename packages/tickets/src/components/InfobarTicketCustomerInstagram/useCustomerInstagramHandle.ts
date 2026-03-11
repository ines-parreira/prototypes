import { useMemo } from 'react'

import type { TicketCustomer } from '@gorgias/helpdesk-types'

export const useCustomerInstagramHandle = (customer: TicketCustomer) => {
    return useMemo(() => {
        if (customer.channels.length === 0) {
            return null
        }

        const instagramChannel = customer.channels
            .filter((channel) => channel.type === 'instagram')
            .sort(
                (a, b) =>
                    new Date(
                        b.updated_datetime ?? b.created_datetime,
                    ).getTime() -
                    new Date(
                        a.updated_datetime ?? a.created_datetime,
                    ).getTime(),
            )[0]

        return instagramChannel?.address
    }, [customer.channels])
}
