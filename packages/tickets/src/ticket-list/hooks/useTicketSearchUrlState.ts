import { useCallback, useMemo } from 'react'

import { useSearchParams } from '@repo/routing'

import { TicketSearchParamsKeys } from '../../utils/routing'
import { getTicketSearchParams } from '../utils/search'

export function useTicketSearchUrlState() {
    const [searchParams, setSearchParams] = useSearchParams()

    const state = useMemo(
        () => getTicketSearchParams(searchParams),
        [searchParams],
    )

    const setQuery = useCallback(
        (query: string) => {
            setSearchParams(({ draft }) => {
                const nextDraft = { ...draft }

                if (query) {
                    nextDraft[TicketSearchParamsKeys.query.key] = query
                } else {
                    delete nextDraft[TicketSearchParamsKeys.query.key]
                }

                delete nextDraft[TicketSearchParamsKeys.cursor.key]

                return nextDraft
            })
        },
        [setSearchParams],
    )

    const setCursor = useCallback(
        (cursor?: string) => {
            setSearchParams(({ draft }) => {
                const nextDraft = { ...draft }

                if (cursor) {
                    nextDraft[TicketSearchParamsKeys.cursor.key] = cursor
                } else {
                    delete nextDraft[TicketSearchParamsKeys.cursor.key]
                }

                return nextDraft
            })
        },
        [setSearchParams],
    )

    return {
        ...state,
        setQuery,
        setCursor,
    }
}
