import { useCallback, useMemo, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { toast } from '@gorgias/axiom'
import {
    useRequestTicketTranslation,
    useUpdateTicket,
} from '@gorgias/helpdesk-queries'
import type { Language, TicketMessage } from '@gorgias/helpdesk-types'

import {
    patchTicketDetailCache,
    patchTicketInViewListCache,
} from '../../utils/optimisticUpdates/viewListCache'
import { getTranslatableTicketMessages } from '../helpers/getTranslatableTicketMessages'
import { FetchingState } from '../store/constants'
import { useTicketMessageTranslationDisplay } from '../store/useTicketMessageTranslationDisplay'
import { useCurrentUserLanguagePreferences } from './useCurrentUserLanguagePreferences'
import { useRegenerateTicketMessageTranslations } from './useRegenerateTicketMessageTranslations'

export function useRetranslateTicket({
    ticketId,
    ticketMessages = [],
}: {
    ticketId: number
    ticketMessages?: TicketMessage[]
}) {
    const queryClient = useQueryClient()
    const { primary, proficient } = useCurrentUserLanguagePreferences()
    const {
        getTicketMessageTranslationDisplay,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageTranslationDisplay()
    const { regenerateTicketMessageTranslations } =
        useRegenerateTicketMessageTranslations()

    const { mutateAsync: updateTicket } = useUpdateTicket()
    const { mutate: requestTicketTranslation } = useRequestTicketTranslation()

    const [isRetranslatingTicket, setIsRetranslatingTicket] = useState(false)

    const translatableMessages = useMemo(
        () => getTranslatableTicketMessages(ticketMessages),
        [ticketMessages],
    )
    const knownLanguages = useMemo(
        () => [primary, ...(proficient ?? [])].filter(Boolean) as Language[],
        [primary, proficient],
    )

    const retranslateTicket = useCallback(
        async (sourceLanguage: Language) => {
            if (!primary) {
                toast.error('Please configure a default translation language.')
                return
            }

            setIsRetranslatingTicket(true)

            try {
                await updateTicket({
                    id: ticketId,
                    data: {
                        language: sourceLanguage,
                    },
                })

                patchTicketDetailCache(queryClient, ticketId, {
                    language: sourceLanguage,
                })
                patchTicketInViewListCache(queryClient, ticketId, {
                    language: sourceLanguage,
                })

                if (knownLanguages.includes(sourceLanguage)) {
                    return
                }

                if (translatableMessages.length > 0) {
                    setTicketMessageTranslationDisplay(
                        translatableMessages.map((message) => {
                            const currentDisplay =
                                getTicketMessageTranslationDisplay(message.id!)

                            return {
                                messageId: message.id!,
                                display: currentDisplay.display,
                                fetchingState: FetchingState.Loading,
                                hasRegeneratedOnce: true,
                            }
                        }),
                    )
                }

                requestTicketTranslation({
                    data: {
                        ticket_id: ticketId,
                        language: primary,
                    },
                })

                await Promise.all(
                    translatableMessages.map((message) =>
                        regenerateTicketMessageTranslations(message.id!),
                    ),
                )
            } catch {
                toast.error('Failed to translate ticket')
            } finally {
                setIsRetranslatingTicket(false)
            }
        },
        [
            primary,
            updateTicket,
            ticketId,
            queryClient,
            knownLanguages,
            translatableMessages,
            setTicketMessageTranslationDisplay,
            getTicketMessageTranslationDisplay,
            requestTicketTranslation,
            regenerateTicketMessageTranslations,
        ],
    )

    return {
        isRetranslatingTicket,
        primary,
        retranslateTicket,
    }
}
