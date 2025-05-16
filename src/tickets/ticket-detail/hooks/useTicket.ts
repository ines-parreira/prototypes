import { useMemo } from 'react'

import { useGetTicket } from '@gorgias/api-queries'

import { transformers } from '../transformers'
import type { TicketElement } from '../types'
import { useAllEvents } from './useAllEvents'
import { useAllVoiceCalls } from './useAllVoiceCalls'

export function useTicket(ticketId: number) {
    const { data, isLoading: isLoadingTicket } = useGetTicket(ticketId)
    const { events, isLoading: isLoadingEvents } = useAllEvents(ticketId)
    const { voiceCalls, isLoading: isLoadingVoiceCalls } =
        useAllVoiceCalls(ticketId)

    const isLoading = isLoadingTicket || isLoadingEvents || isLoadingVoiceCalls
    const ticket = data?.data
    const messages = useMemo(() => ticket?.messages || [], [ticket?.messages])

    const body = useMemo(() => {
        if (isLoading) return []

        const grouped = [
            ...messages.map(
                (m): TicketElement => ({
                    data: m,
                    datetime: m.created_datetime,
                    type: 'message',
                }),
            ),
            ...events.map(
                (e): TicketElement => ({
                    data: e,
                    datetime: e.created_datetime,
                    type: 'event',
                }),
            ),
            ...voiceCalls.map(
                (v): TicketElement => ({
                    data: v,
                    datetime: v.created_datetime,
                    type: 'voice-call',
                }),
            ),
        ].sort((a, b) => (a.datetime || '').localeCompare(b.datetime || ''))

        return transformers.reduce(
            (acc, transformer) => transformer(acc),
            grouped,
        )
    }, [events, isLoading, messages, voiceCalls])

    return useMemo(
        () => ({ body, isLoading: isLoading, ticket }),
        [body, isLoading, ticket],
    )
}
