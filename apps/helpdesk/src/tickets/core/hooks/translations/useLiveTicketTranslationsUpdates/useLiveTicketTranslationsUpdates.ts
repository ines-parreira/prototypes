import { useCallback, useEffect, useMemo, useRef } from 'react'

import { isNumber } from 'lodash'

import type { DomainEvent } from '@gorgias/events'
import { useRequestTicketTranslation } from '@gorgias/helpdesk-queries'
import { Language } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { TicketMessage } from 'models/ticket/types'
import {
    DisplayedContent,
    FetchingState,
} from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from 'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/context/useTicketMessageTranslationDisplay'

import { useCurrentUserPreferredLanguage } from '../useCurrentUserPreferredLanguage'
import { useTicketTranslations } from '../useTicketTranslations'
import { useTicketMessageTranslationCompleteEventHandler } from './useTicketMessageTranslationCompleteEventHandler'
import { useTicketMessageTranslationFailedEventHandler } from './useTicketMessageTranslationFailedEventHandler'
import { useTicketTranslationCompleteEventHandler } from './useTicketTranslationCompleteEventHandler'
import { useTicketTranslationFailedEventHandler } from './useTicketTranslationFailedEventHandler'

type UseLiveTicketTranslationsUpdatesParams = {
    ticketId?: number
    ticketLanguage?: Language
    ticketMessages?: TicketMessage[]
}

const createRequestId = (
    ticketId: number,
    ticketMessages: TicketMessage[],
    primary: Language,
) =>
    `${ticketId}-${ticketMessages
        .map((message) => message.id)
        .filter(isNumber)
        .sort((a, b) => a - b)
        .join('-')}-${primary}`

export const useLiveTicketTranslationsUpdates = ({
    ticketId = 0,
    ticketLanguage,
    ticketMessages = [],
}: UseLiveTicketTranslationsUpdatesParams) => {
    const hasMessagesTranslation = useFlag(FeatureFlagKey.MessagesTranslations)
    const processedEvents = useRef<Set<string>>(new Set())

    /**
     * Events handlers
     */
    const { handleTicketTranslationCompleted } =
        useTicketTranslationCompleteEventHandler()
    const { handleTicketTranslationFailed } =
        useTicketTranslationFailedEventHandler()
    const { handleTicketMessageTranslationCompleted } =
        useTicketMessageTranslationCompleteEventHandler()
    const { handleTicketMessageTranslationFailed } =
        useTicketMessageTranslationFailedEventHandler()

    const handleTicketMessageTranslationEvents = useCallback(
        (event: DomainEvent) => {
            if (!hasMessagesTranslation || !ticketId) {
                return
            }

            // avoid processing the same event multiple times
            if (processedEvents.current.has(event.id)) {
                return
            }
            processedEvents.current.add(event.id)

            switch (event.dataschema) {
                case '//helpdesk/ticket-translation.completed/1.0.0':
                    handleTicketTranslationCompleted(event)
                    break
                case '//helpdesk/ticket-translation.failed/1.0.0':
                    handleTicketTranslationFailed(event)
                    break
                case '//helpdesk/ticket-message-translation.completed/1.0.0':
                    handleTicketMessageTranslationCompleted(event)
                    break
                case '//helpdesk/ticket-message-translation.failed/1.0.0':
                    handleTicketMessageTranslationFailed(event)
                    break
            }
        },
        [
            hasMessagesTranslation,
            handleTicketMessageTranslationCompleted,
            handleTicketMessageTranslationFailed,
            handleTicketTranslationCompleted,
            handleTicketTranslationFailed,
            ticketId,
        ],
    )

    /**
     * Ticket translations
     */
    const pendingRequestsRef = useRef<Set<string>>(new Set())
    const hasSetInitialTicketMessageDisplayRef = useRef<
        Record<number, boolean>
    >({ [ticketId]: false })
    const { primary, languagesNotToTranslateFor } =
        useCurrentUserPreferredLanguage()
    const { setTicketMessageTranslationDisplay } =
        useTicketMessageTranslationDisplay()

    const { data: ticketTranslations } = useTicketTranslations({
        ticket_id: ticketId,
    })

    const { mutate: requestTicketTranslation } = useRequestTicketTranslation()

    const messagesWithNoTranslation = useMemo(
        () =>
            ticketMessages.filter((message) => {
                if (!message.id) return false

                const messageTranslation = ticketTranslations?.data.data.find(
                    (translation) =>
                        translation.ticket_message_id === message.id,
                )
                return !Boolean(messageTranslation)
            }),
        [ticketMessages, ticketTranslations],
    )

    const messagesWithTranslation = useMemo(
        () =>
            ticketMessages.filter((message) => {
                if (!message.id) return false

                const messageTranslation = ticketTranslations?.data.data.find(
                    (translation) =>
                        translation.ticket_message_id === message.id,
                )
                return Boolean(messageTranslation)
            }),
        [ticketMessages, ticketTranslations],
    )

    const shouldGenerateTicketTranslations = useMemo(() => {
        if (!hasMessagesTranslation) return false

        // if no ticketId or ticketLanguage, don't generate translations
        if (!ticketId || !ticketLanguage || !primary) return false

        if (languagesNotToTranslateFor.includes(ticketLanguage)) return false

        // We first need to check if the ticket has already generated translations and how many of them
        if (!ticketTranslations?.data.data) return false

        if (messagesWithNoTranslation.length === 0) return false

        const requestId = createRequestId(ticketId, ticketMessages, primary)

        return !pendingRequestsRef.current.has(requestId)
    }, [
        ticketId,
        ticketLanguage,
        ticketMessages,
        languagesNotToTranslateFor,
        primary,
        hasMessagesTranslation,
        ticketTranslations,
        messagesWithNoTranslation,
    ])

    const generateTicketTranslations = useCallback(() => {
        if (!primary) return

        const requestId = createRequestId(ticketId, ticketMessages, primary)
        pendingRequestsRef.current.add(requestId)

        requestTicketTranslation({
            data: {
                ticket_id: ticketId,
                language: primary,
            },
        })

        const messagesWithNoTranslationToUpdate = messagesWithNoTranslation.map(
            (message) => ({
                messageId: message.id!,
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Loading,
            }),
        )

        setTicketMessageTranslationDisplay(messagesWithNoTranslationToUpdate)
    }, [
        ticketId,
        ticketMessages,
        primary,
        requestTicketTranslation,
        setTicketMessageTranslationDisplay,
        messagesWithNoTranslation,
    ])

    useEffect(
        function initializeTicketMessageDisplay() {
            if (messagesWithTranslation.length === 0) return
            if (hasSetInitialTicketMessageDisplayRef.current[ticketId]) return

            const messagesWithTranslationToUpdate = messagesWithTranslation.map(
                (message) => ({
                    messageId: message.id!,
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                }),
            )

            setTicketMessageTranslationDisplay(messagesWithTranslationToUpdate)
            hasSetInitialTicketMessageDisplayRef.current[ticketId] = true
        },
        [messagesWithTranslation, setTicketMessageTranslationDisplay, ticketId],
    )

    useEffect(
        function triggerTicketTranslationsGeneration() {
            if (shouldGenerateTicketTranslations) {
                generateTicketTranslations()
            }
        },
        [shouldGenerateTicketTranslations, generateTicketTranslations],
    )

    return {
        handleTicketMessageTranslationEvents,
        // These two are exposed for testing purposes
        generateTicketTranslations,
        shouldGenerateTicketTranslations,
    }
}
