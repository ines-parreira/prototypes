import { useCallback } from 'react'

export function useCloseTicket() {
    const closeTicket = useCallback(() => {
        /**
         * TODO: Implement validation once the Ticket fields are done
         */
        alert(
            'NOT IMPLEMENTED YET - REQUIRE TICKET FIELDS IMPLEMENTATION BEFORE WE CAN CLOSE A TICKET',
        )
    }, [])

    return {
        closeTicket,
    }
}
