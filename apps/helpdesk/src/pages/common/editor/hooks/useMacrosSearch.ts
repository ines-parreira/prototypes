import { useEffect, useMemo, useRef } from 'react'

import { useDebouncedValue } from '@repo/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import _flatten from 'lodash/flatten'
import _isEqual from 'lodash/isEqual'
import { notify } from 'reapop'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { fetchMacros } from 'models/macro/resources'
import { Filters } from 'models/macro/types'
import { Ticket } from 'models/ticket/types'
import { NotificationStatus } from 'state/notifications/types'

export const SEARCH_DEBOUNCE_DELAY = 350

type Props = {
    params: Filters
    ticket?: Ticket
}

type FilterKey = keyof Filters

export const STALE_TIME_MS = 15 * 60 * 1000 // 15 minutes

const queryKey = queryKeys.macros.listMacros() as string[]
queryKey.pop()

export default function useMacrosSearch({ params, ticket }: Props) {
    const dispatch = useAppDispatch()
    const previousSearchOptions = useRef<Filters | null>(null)

    const debouncedSearchOptions = useDebouncedValue<Filters>(
        params,
        SEARCH_DEBOUNCE_DELAY,
    )
    const ticketOptions = useMemo(
        () =>
            !ticket?.id
                ? {}
                : {
                      ticket_id: ticket.id,
                      message_id:
                          ticket.messages[ticket.messages.length - 1]?.id,
                      number_predictions: 3,
                  },
        [ticket],
    )

    useEffect(() => {
        if (_isEqual(debouncedSearchOptions, previousSearchOptions.current)) {
            return
        }
        let changed: string[] = []
        if (previousSearchOptions.current) {
            changed = (Object.keys(debouncedSearchOptions) as FilterKey[])
                .filter(
                    (fieldName) =>
                        debouncedSearchOptions[fieldName] !==
                        previousSearchOptions.current![fieldName],
                )
                .map((fieldName) => fieldName)
        }

        if (!!changed.length) {
            logEvent(SegmentEvent.TicketMacrosSearch, {
                ...debouncedSearchOptions,
                changed,
            })
        }
        previousSearchOptions.current = debouncedSearchOptions
    }, [debouncedSearchOptions])

    const { data, isError, ...props } = useInfiniteQuery({
        queryKey: [...queryKey, debouncedSearchOptions],
        queryFn: async ({ pageParam }: { pageParam?: string }) => {
            return fetchMacros({
                ...debouncedSearchOptions,
                ...ticketOptions,
                cursor: pageParam,
                order_by: 'name:asc',
            })
        },
        getNextPageParam: (lastPage) => {
            return lastPage.data.meta?.next_cursor
        },
        staleTime: STALE_TIME_MS,
    })

    const nextCursor =
        data?.pages[data?.pages.length - 1].data.meta?.next_cursor

    const macrosData = useMemo(
        () => _flatten(data?.pages.map((page) => page.data.data)),
        [data],
    )

    useEffect(() => {
        if (isError) {
            void dispatch(
                notify({
                    message: 'Failed to fetch macros',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, isError])

    return {
        data: macrosData,
        nextCursor,
        ...props,
    }
}
