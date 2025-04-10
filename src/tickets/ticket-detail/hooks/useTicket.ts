import { useMemo } from 'react'

import { useGetTicket } from '@gorgias/api-queries'

export function useTicket(ticketId: number) {
    const { data, isLoading } = useGetTicket(ticketId)
    const ticket = data?.data

    return useMemo(() => ({ isLoading, ticket }), [isLoading, ticket])
}
