import _isEqual from 'lodash/isEqual'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import useCancellableRequest from 'hooks/useCancellableRequest'
import useDebouncedValue from 'hooks/useDebouncedValue'
import {OrderDirection} from 'models/api/types'
import {fetchMacros} from 'models/macro/resources'
import {
    Macro,
    MacroSortableProperties,
    MacrosProperties,
} from 'models/macro/types'
import {Ticket} from 'models/ticket/types'

export const SEARCH_DEBOUNCE_DELAY = 350

type Options = {
    filters: MacrosProperties
    query: string
    ticket: Ticket
}

type Filters = MacrosProperties & {cursor?: string | null; search: string}

type FilterKey = keyof Filters

type State = {
    macros: Macro[]
    nextCursor: string | null
}

export default function useMacrosSearch({filters, query, ticket}: Options) {
    const initialLoaded = useRef<boolean>(false)
    const previousSearchOptions = useRef<Filters | null>(null)
    const [{macros, nextCursor}, setState] = useState<State>({
        macros: [],
        nextCursor: null,
    })

    const searchOptions: Filters = useMemo(
        () => ({...filters, search: query}),
        [filters, query]
    )
    const debouncedSearchOptions = useDebouncedValue<Filters>(
        searchOptions,
        SEARCH_DEBOUNCE_DELAY
    )

    const ticketOptions = useMemo(
        () =>
            !ticket.id
                ? {}
                : {
                      ticketId: ticket.id,
                      messageId:
                          ticket.messages[ticket.messages.length - 1]?.id,
                      numberPredictions: 3,
                  },
        [ticket]
    )

    const [cancellableFetchMacros] = useCancellableRequest(
        (cancelToken) => async (options: typeof debouncedSearchOptions) =>
            fetchMacros(
                {
                    ...options,
                    ...ticketOptions,
                    orderBy: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
                },
                {cancelToken}
            )
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
                        previousSearchOptions.current![fieldName]
                )
                .map((fieldName) => fieldName)
        }

        logEvent(SegmentEvent.TicketMacrosSearch, {
            ...debouncedSearchOptions,
            changed,
        })

        previousSearchOptions.current = debouncedSearchOptions

        void cancellableFetchMacros(debouncedSearchOptions)
            .then((res) => {
                if (res) {
                    initialLoaded.current = true
                    setState({
                        macros: res.data.data,
                        nextCursor: res.data.meta.next_cursor,
                    })
                }
            })
            .catch((err) => {
                console.error(err)
            })
    }, [cancellableFetchMacros, debouncedSearchOptions])

    const loadMacros = useCallback(
        async (retainPreviousResults?: boolean): Promise<void> => {
            try {
                const res = await cancellableFetchMacros({
                    ...debouncedSearchOptions,
                    cursor: nextCursor,
                })

                if (res) {
                    setState((s) => ({
                        ...s,
                        macros: retainPreviousResults
                            ? [...s.macros, ...(res.data.data || [])]
                            : res.data.data || [],
                        nextCursor: res.data.meta.next_cursor,
                    }))
                }
            } catch (err) {
                console.error(err)
            }
        },
        [cancellableFetchMacros, debouncedSearchOptions, nextCursor]
    )

    return {
        initialLoaded: initialLoaded.current,
        loadMacros,
        macros,
        nextCursor,
    }
}
