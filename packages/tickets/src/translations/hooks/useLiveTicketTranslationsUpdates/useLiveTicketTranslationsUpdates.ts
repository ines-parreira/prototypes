import { useCallback, useEffect, useMemo, useRef } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { sleep } from '@repo/utils'
import { chunk, isNumber } from 'lodash'

import type { DomainEvent } from '@gorgias/events'
import { isDomainEvent } from '@gorgias/events'
import {
    useRequestTicketMessageTranslation,
    useRequestTicketTranslation,
} from '@gorgias/helpdesk-queries'
import type {
    Language,
    TicketMessage,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

import { isInternalNote } from '../../../helpers/isInternalNote'
import { DisplayedContent, FetchingState } from '../../store/constants'
import { useTicketMessageTranslationDisplay } from '../../store/useTicketMessageTranslationDisplay'
import { useCurrentUserLanguagePreferences } from '../useCurrentUserLanguagePreferences'
import { useTicketsTranslatedProperties } from '../useTicketsTranslatedProperties'
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

const createTicketSubjectRequestId = (ticketId: number, primary: Language) =>
    `${ticketId}-${primary}`

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
    ticketId,
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

            if (processedEvents.current.has(event.id)) {
                return
            }
            processedEvents.current.add(event.id)

            if (
                isDomainEvent(event, '//helpdesk/ticket-translation.completed')
            ) {
                handleTicketTranslationCompleted(event)
            } else if (
                isDomainEvent(event, '//helpdesk/ticket-translation.failed')
            ) {
                handleTicketTranslationFailed(event)
            } else if (
                isDomainEvent(
                    event,
                    '//helpdesk/ticket-message-translation.completed',
                )
            ) {
                handleTicketMessageTranslationCompleted(event)
            } else if (
                isDomainEvent(
                    event,
                    '//helpdesk/ticket-message-translation.failed',
                )
            ) {
                handleTicketMessageTranslationFailed(event)
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

    const { primary, shouldShowTranslatedContent } =
        useCurrentUserLanguagePreferences()

    const { translationMap, isInitialLoading } = useTicketsTranslatedProperties(
        {
            ticket_ids: [ticketId],
            ticketsRequiresTranslations:
                shouldShowTranslatedContent(ticketLanguage),
        },
    )

    const { data: ticketTranslations } = useTicketTranslations({
        ticket_id: ticketId,
        enabled: shouldShowTranslatedContent(ticketLanguage),
    })
    const { mutate: requestTicketTranslation } = useRequestTicketTranslation()
    const { mutateAsync: generateTicketMessageTranslation } =
        useRequestTicketMessageTranslation()

    const { setTicketMessageTranslationDisplay } =
        useTicketMessageTranslationDisplay()

    /**
     * Ticket subject translations
     */
    const pendingTicketSubjectRequestsRef = useRef<Set<string>>(new Set())

    const shouldGenerateTicketSubjectTranslation = useMemo(() => {
        if (!hasMessagesTranslation) return false

        if (!ticketId || !ticketLanguage || !primary) return false

        if (!shouldShowTranslatedContent(ticketLanguage)) return false

        if (isInitialLoading) return false

        if (translationMap[ticketId]?.subject) return false

        const requestId = createTicketSubjectRequestId(ticketId, primary)

        return !pendingTicketSubjectRequestsRef.current.has(requestId)
    }, [
        ticketId,
        ticketLanguage,
        shouldShowTranslatedContent,
        primary,
        hasMessagesTranslation,
        isInitialLoading,
        translationMap,
    ])

    const generateTicketSubjectTranslation = useCallback(() => {
        if (!primary || !ticketId) return

        const requestId = createTicketSubjectRequestId(ticketId, primary)
        pendingTicketSubjectRequestsRef.current.add(requestId)

        requestTicketTranslation({
            data: {
                ticket_id: ticketId,
                language: primary,
            },
        })
    }, [ticketId, primary, requestTicketTranslation])

    useEffect(
        function triggerInitialTicketTranslationGeneration() {
            if (shouldGenerateTicketSubjectTranslation) {
                generateTicketSubjectTranslation()
            }
        },
        [
            shouldGenerateTicketSubjectTranslation,
            generateTicketSubjectTranslation,
        ],
    )

    /**
     * Ticket messagestranslations
     */
    const pendingTicketMessageRequestsRef = useRef<Set<string>>(new Set())
    const hasSetInitialTicketMessageDisplayRef = useRef<
        Record<number, boolean>
    >({ [ticketId ?? 0]: false })

    const messagesWithNoTranslation = useMemo(
        () =>
            ticketMessages
                .filter((message) => {
                    if (!message.id) return false

                    // We don't want to generate translations for internal notes
                    if (
                        message?.source &&
                        isInternalNote(
                            message.source.type as TicketMessageSourceType,
                        )
                    )
                        return false

                    const messageTranslation =
                        ticketTranslations?.data.data.find(
                            (translation) =>
                                translation.ticket_message_id === message.id,
                        )
                    return !messageTranslation
                })
                // Sort messages by created_datetime in descending order
                // This is to ensure that the most recent messages are translated first
                // since they're the most likely to be looked at first
                .sort(
                    (a, b) =>
                        new Date(b.created_datetime).getTime() -
                        new Date(a.created_datetime).getTime(),
                ),
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

        if (!shouldShowTranslatedContent(ticketLanguage)) return false

        // We first need to check if the ticket has already generated translations and how many of them
        if (!ticketTranslations?.data.data) return false

        if (messagesWithNoTranslation.length === 0) return false

        const requestId = createRequestId(ticketId, ticketMessages, primary)

        return !pendingTicketMessageRequestsRef.current.has(requestId)
    }, [
        ticketId,
        ticketLanguage,
        ticketMessages,
        shouldShowTranslatedContent,
        primary,
        hasMessagesTranslation,
        ticketTranslations,
        messagesWithNoTranslation,
    ])

    const generateTicketMessagesTranslations = useCallback(async () => {
        if (!primary || !ticketId) return

        const requestId = createRequestId(ticketId, ticketMessages, primary)
        pendingTicketMessageRequestsRef.current.add(requestId)

        // We chunk the messages to avoid overwhelming the API with too many requests at once
        // with batches of 5 messages at a time with a 250ms delay between each batch
        const chunks = chunk(messagesWithNoTranslation, 5)
        for (const chunk of chunks) {
            const messagesWithNoTranslationToUpdate = chunk.map((message) => ({
                messageId: message.id!,
                display: DisplayedContent.Original,
                fetchingState: FetchingState.Loading,
                hasRegeneratedOnce: false,
            }))

            await Promise.all(
                messagesWithNoTranslationToUpdate.map(async (message) => {
                    await generateTicketMessageTranslation({
                        data: {
                            language: primary,
                            ticket_message_id: message.messageId!,
                        },
                    })
                }),
            )

            setTicketMessageTranslationDisplay(
                messagesWithNoTranslationToUpdate,
            )
            await sleep(250)
        }
    }, [
        ticketId,
        ticketMessages,
        primary,
        messagesWithNoTranslation,
        setTicketMessageTranslationDisplay,
        generateTicketMessageTranslation,
    ])

    useEffect(
        function initializeTicketMessageDisplay() {
            if (messagesWithTranslation.length === 0 || !ticketId) return
            if (hasSetInitialTicketMessageDisplayRef.current[ticketId]) return

            const messagesWithTranslationToUpdate = messagesWithTranslation.map(
                (message) => ({
                    messageId: message.id!,
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                }),
            )

            setTicketMessageTranslationDisplay(messagesWithTranslationToUpdate)
            hasSetInitialTicketMessageDisplayRef.current[ticketId] = true
        },
        [messagesWithTranslation, setTicketMessageTranslationDisplay, ticketId],
    )

    useEffect(
        function triggerTicketMessagesTranslationsGeneration() {
            if (shouldGenerateTicketTranslations) {
                generateTicketMessagesTranslations()
            }
        },
        [shouldGenerateTicketTranslations, generateTicketMessagesTranslations],
    )

    return {
        handleTicketMessageTranslationEvents,
        // These two are exposed for testing purposes
        shouldGenerateTicketSubjectTranslation,
        generateTicketSubjectTranslation,
        generateTicketMessagesTranslations,
        shouldGenerateTicketTranslations,
    }
}
