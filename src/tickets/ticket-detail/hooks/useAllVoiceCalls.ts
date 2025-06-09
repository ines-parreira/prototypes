import { useMemo } from 'react'

import { listVoiceCalls } from '@gorgias/helpdesk-client'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'

export function useAllVoiceCalls(ticketId: number) {
    const { data, isLoading } = useExhaustEndpoint(
        ['all-voice-calls', ticketId],
        (cursor) => listVoiceCalls({ cursor, ticket_id: ticketId, limit: 100 }),
        {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    )

    return useMemo(() => ({ isLoading, voiceCalls: data }), [data, isLoading])
}
