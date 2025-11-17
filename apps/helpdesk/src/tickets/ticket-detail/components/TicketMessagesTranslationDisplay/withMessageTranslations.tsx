import { type ComponentType, useMemo } from 'react'

import type {
    Language,
    TicketMessageTranslation,
} from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { getTicket } from 'state/ticket/selectors'
import { useCurrentUserLanguagePreferences } from 'tickets/core/hooks/translations/useCurrentUserLanguagePreferences'
import { useTicketMessageTranslations } from 'tickets/core/hooks/translations/useTicketMessageTranslations'

import { DisplayedContent } from './context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from './context/useTicketMessageTranslationDisplay'

export type WithMessageTranslationsProps = {
    message: TicketMessage & { translations?: TicketMessageTranslation }
    ticketId: number
}

export function withMessageTranslations<T extends WithMessageTranslationsProps>(
    Component: ComponentType<T & WithMessageTranslationsProps>,
) {
    return (props: T) => {
        const ticket = useAppSelector(getTicket)
        const { shouldShowTranslatedContent } =
            useCurrentUserLanguagePreferences()
        const { getTicketMessageTranslationDisplay } =
            useTicketMessageTranslationDisplay()
        const { getMessageTranslation } = useTicketMessageTranslations({
            ticket_id: props.ticketId,
        })

        const displayedMessage = useMemo(() => {
            if (!props.message?.id) return props.message

            if (!shouldShowTranslatedContent(ticket.language as Language))
                return props.message

            const messageTranslations = getMessageTranslation(props.message.id)
            const displayType = getTicketMessageTranslationDisplay(
                props.message.id,
            )
            if (
                displayType.display === DisplayedContent.Translated &&
                messageTranslations
            ) {
                return {
                    ...props.message,
                    translations: messageTranslations,
                }
            }
            return props.message
        }, [
            getTicketMessageTranslationDisplay,
            getMessageTranslation,
            props.message,
            shouldShowTranslatedContent,
            ticket,
        ])

        return <Component {...props} message={displayedMessage} />
    }
}
