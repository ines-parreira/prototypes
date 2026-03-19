import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'
import { isNumber } from 'lodash'

import { useListTicketTranslations } from '@gorgias/helpdesk-queries'
import type {
    HttpResponse,
    ListTicketTranslations200,
    TicketLanguage,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { KeyPrefixes } from './constants'
import type { TicketTranslationsQueryKeyParams } from './types'
import { useCurrentUserLanguagePreferences } from './useCurrentUserLanguagePreferences'

type TicketPropertiesTranslationsParams = {
    ticket_ids: (number | undefined)[]
    ticketsRequiresTranslations?: boolean
}

type TranslationMap = Record<number, TicketTranslationCompact>
const MAX_TICKET_TRANSLATION_IDS = 100

export function useTicketsTranslatedProperties({
    ticket_ids = [],
    ticketsRequiresTranslations = true,
}: TicketPropertiesTranslationsParams) {
    const queryClient = useQueryClient()
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)

    const { primary } = useCurrentUserLanguagePreferences()

    // So that the tanstack query cache is as stable as possible
    const stableTicketIds = useMemo(
        /**
         * We filter out undefined values and sort the array to make the query cache as stable as possible
         * This is needed since the component where the useTicketsTranslatedProperties hook is used
         * don't always have ticket_ids (Ticket header in the new ticket page for example)
         */
        () =>
            ticket_ids
                .filter(isNumber)
                .sort((a, b) => a - b)
                .slice(0, MAX_TICKET_TRANSLATION_IDS),
        [ticket_ids],
    )

    const isQueryEnabled =
        hasMessagesTranslations &&
        ticketsRequiresTranslations &&
        Boolean(primary) &&
        stableTicketIds.length > 0

    const { data: translations, isInitialLoading } = useListTicketTranslations(
        {
            language: primary as TicketLanguage,
            ticket_ids: stableTicketIds,
        },
        {
            query: {
                refetchOnWindowFocus: false,
                enabled: isQueryEnabled,
                keepPreviousData: true,
            },
        },
    )

    /**
     * The Backend invalidate the translated subject when the user updates the subject in the application
     * This function is used to optimistically remove the translated subject from the cache
     */
    const updateTicketTranslatedSubject = useCallback(
        (ticketId: number, subject: string) => {
            const queryCache = queryClient.getQueryCache()

            const ticketTranslationsKeys = queryCache.findAll({
                queryKey: KeyPrefixes.ticketTranslations,
            })
            const ticketTranslationsKeysToUpdate =
                ticketTranslationsKeys.filter((query) => {
                    const queryParams = query
                        .queryKey[2] as TicketTranslationsQueryKeyParams

                    if (!Array.isArray(queryParams.queryParams.ticket_ids)) {
                        return false
                    }

                    return queryParams.queryParams.ticket_ids.some(
                        (id) => id === ticketId,
                    )
                })

            for (const query of ticketTranslationsKeysToUpdate) {
                queryClient.setQueryData(
                    query.queryKey,
                    (
                        oldData:
                            | HttpResponse<ListTicketTranslations200>
                            | undefined,
                    ) => {
                        if (!oldData) return

                        const ticketTranslation = oldData.data.data.find(
                            (ticket) => ticket.ticket_id === ticketId,
                        )

                        if (!ticketTranslation) return oldData

                        const otherTicketTranslations =
                            oldData.data.data.filter(
                                (ticket) => ticket.ticket_id !== ticketId,
                            )

                        const newTicketTranslation = {
                            ...ticketTranslation,
                            subject,
                        }

                        return {
                            ...oldData,
                            data: {
                                ...oldData.data,
                                data: [
                                    ...otherTicketTranslations,
                                    newTicketTranslation,
                                ],
                            },
                        }
                    },
                )
            }
        },
        [queryClient],
    )

    const translationMap = useMemo(() => {
        const requestedTicketIds = new Set(stableTicketIds)
        const queryCache = queryClient.getQueryCache()
        const cachedQueries = queryCache.findAll({
            queryKey: KeyPrefixes.ticketTranslations,
        })

        const cachedTranslationMap = cachedQueries.reduce<TranslationMap>(
            (acc, query) => {
                const cachedData = query.state.data as
                    | HttpResponse<ListTicketTranslations200>
                    | undefined

                if (!cachedData?.data?.data) {
                    return acc
                }

                for (const ticketTranslation of cachedData.data.data) {
                    if (requestedTicketIds.has(ticketTranslation.ticket_id)) {
                        acc[ticketTranslation.ticket_id] = ticketTranslation
                    }
                }

                return acc
            },
            {},
        )

        if (!translations?.data?.data) {
            return cachedTranslationMap
        }

        return translations.data.data.reduce<TranslationMap>(
            (acc, ticketTranslation) => {
                acc[ticketTranslation.ticket_id] = ticketTranslation
                return acc
            },
            cachedTranslationMap,
        )
    }, [queryClient, stableTicketIds, translations])

    if (!hasMessagesTranslations) {
        return {
            translationMap: {},
            isInitialLoading: isQueryEnabled && isInitialLoading,
            updateTicketTranslatedSubject,
        }
    }

    return {
        translationMap,
        isInitialLoading: isQueryEnabled && isInitialLoading,
        updateTicketTranslatedSubject,
    }
}
