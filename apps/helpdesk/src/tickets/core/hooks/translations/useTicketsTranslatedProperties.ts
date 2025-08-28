import { useCallback, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useQueryClient } from '@tanstack/react-query'
import { isNumber } from 'lodash'

import { useListTicketTranslations } from '@gorgias/helpdesk-queries'
import {
    HttpResponse,
    ListTicketTranslations200,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'

import { KeyPrefixes } from './constants'
import type { TicketTranslationsQueryKeyParams } from './types'
import { useCurrentUserPreferredLanguage } from './useCurrentUserPreferredLanguage'

type TicketPropertiesTranslationsParams = {
    ticket_ids: (number | undefined)[]
    ticketsRequiresTranslations?: boolean
}

type TranslationMap = Record<number, TicketTranslationCompact>

export function useTicketsTranslatedProperties({
    ticket_ids = [],
    ticketsRequiresTranslations = true,
}: TicketPropertiesTranslationsParams) {
    const queryClient = useQueryClient()
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)

    const { primary } = useCurrentUserPreferredLanguage()

    // So that the tanstack query cache is as stable as possible
    const stableTicketIds = useMemo(
        /**
         * We filter out undefined values and sort the array to make the query cache as stable as possible
         * This is needed since the component where the useTicketsTranslatedProperties hook is used
         * don't always have ticket_ids (Ticket header in the new ticket page for example)
         */
        () => ticket_ids.filter(isNumber).sort((a, b) => a - b),
        [ticket_ids],
    )

    const isQueryEnabled =
        hasMessagesTranslations &&
        ticketsRequiresTranslations &&
        Boolean(primary) &&
        stableTicketIds.length > 0

    const { data: translations, isInitialLoading } = useListTicketTranslations(
        {
            language: primary as string,
            ticket_ids: stableTicketIds,
        },
        {
            query: {
                refetchOnWindowFocus: false,
                enabled: isQueryEnabled,
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
        if (!translations || !translations.data) {
            return {}
        }

        return translations.data.data.reduce<TranslationMap>(
            (acc, ticketTranslation) => {
                acc[ticketTranslation.ticket_id] = ticketTranslation
                return acc
            },
            {},
        )
    }, [translations])

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
