import { useMemo } from 'react'
import type { ComponentType } from 'react'

import {
    DisplayedContent,
    useCurrentUserLanguagePreferences,
    useTicketMessageDisplayState,
    useTicketMessageTranslations,
} from '@repo/tickets'

import type {
    Language,
    TicketMessageTranslation,
} from '@gorgias/helpdesk-types'

import useAppSelector from 'hooks/useAppSelector'
import type { TicketMessage } from 'models/ticket/types'
import { getTicket } from 'state/ticket/selectors'

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
        const { display } = useTicketMessageDisplayState(props.message?.id ?? 0)
        const { getMessageTranslation } = useTicketMessageTranslations({
            ticket_id: props.ticketId,
        })

        const displayedMessage = useMemo(() => {
            if (!props.message?.id) return props.message

            if (!shouldShowTranslatedContent(ticket.language as Language))
                return props.message

            const messageTranslations = getMessageTranslation(props.message.id)

            if (
                display === DisplayedContent.Translated &&
                messageTranslations
            ) {
                return {
                    ...props.message,
                    translations: messageTranslations,
                }
            }
            return props.message
        }, [
            display,
            getMessageTranslation,
            props.message,
            shouldShowTranslatedContent,
            ticket,
        ])

        return <Component {...props} message={displayedMessage} />
    }
}
