import { type ComponentType, useMemo } from 'react'

import { Language } from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import { TicketMessage } from 'models/ticket/types'
import { getTicket } from 'state/ticket/selectors'
import { useCurrentUserPreferredLanguage } from 'tickets/core/hooks/translations/useCurrentUserPreferredLanguage'
import { useTicketMessageTranslations } from 'tickets/core/hooks/translations/useTicketMessageTranslations'

import { DisplayedContent } from './context/ticketMessageTranslationDisplayContext'
import { useTicketMessageTranslationDisplay } from './context/useTicketMessageTranslationDisplay'

export type WithMessageTranslationsProps = {
    message: TicketMessage
    ticketId: number
}

export function withMessageTranslations<T extends WithMessageTranslationsProps>(
    Component: ComponentType<T & WithMessageTranslationsProps>,
) {
    return (props: T) => {
        const ticket = useAppSelector(getTicket)
        const { shouldShowTranslatedContent } =
            useCurrentUserPreferredLanguage()
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
                    stripped_html: messageTranslations?.stripped_html ?? null,
                    stripped_text: messageTranslations?.stripped_text ?? null,
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
