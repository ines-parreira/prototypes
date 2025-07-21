import { useMemo } from 'react'

import { listVoiceCalls } from '@gorgias/helpdesk-client'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'

import { TICKET_QUERIES_DEFAULT_CONFIG } from '../constants'

export function useAllVoiceCalls(ticketId: number) {
    const queryParams = {
        ticket_id: ticketId,
        limit: 100,
    } as const

    const { data, isLoading } = useExhaustEndpoint(
        queryKeys.voiceCalls.listVoiceCalls(queryParams),
        (cursor) => listVoiceCalls({ cursor, ...queryParams }),
        TICKET_QUERIES_DEFAULT_CONFIG,
    )

    return useMemo(() => ({ isLoading, voiceCalls: data }), [data, isLoading])
}
