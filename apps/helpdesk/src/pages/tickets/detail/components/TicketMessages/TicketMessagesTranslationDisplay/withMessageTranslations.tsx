import { type ComponentType, useMemo } from 'react'

import { TicketMessage } from 'models/ticket/types'
import { useTicketMessageTranslations } from 'tickets/core/hooks/useTicketMessageTranslations'

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
        const { ticketMessagesTranslationMap } = useTicketMessageTranslations({
            ticket_id: props.ticketId,
        })

        const messageTranslations = useMemo(() => {
            if (!props.message?.id) return
            return ticketMessagesTranslationMap[props.message.id]
        }, [props.message.id, ticketMessagesTranslationMap])

        const displayedMessage = useMemo(() => {
            if (!props.message?.id) return props.message
            if (
                getTicketMessageTranslationDisplay(props.message.id) ===
                    'translated' &&
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
            props.message,
            messageTranslations,
        ])

        return <Component {...props} message={displayedMessage} />
    }
}
