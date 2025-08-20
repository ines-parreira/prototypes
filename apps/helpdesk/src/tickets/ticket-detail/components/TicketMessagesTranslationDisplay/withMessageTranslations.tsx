import { type ComponentType, useMemo } from 'react'

import { TicketMessage } from 'models/ticket/types'
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
        const { getTicketMessageTranslationDisplay } =
            useTicketMessageTranslationDisplay()
        const { getMessageTranslation } = useTicketMessageTranslations({
            ticket_id: props.ticketId,
        })

        const displayedMessage = useMemo(() => {
            if (!props.message?.id) return props.message
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
        ])

        return <Component {...props} message={displayedMessage} />
    }
}
