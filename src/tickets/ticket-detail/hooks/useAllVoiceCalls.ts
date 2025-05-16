import { useMemo } from 'react'

import { listVoiceCalls } from '@gorgias/api-client'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'

export function useAllVoiceCalls(ticketId: number) {
    const { data, isLoading } = useExhaustEndpoint(
        ['all-voice-calls', ticketId],
        (cursor) => listVoiceCalls({ cursor, ticket_id: ticketId }),
    )

    return useMemo(() => ({ isLoading, voiceCalls: data }), [data, isLoading])
}
