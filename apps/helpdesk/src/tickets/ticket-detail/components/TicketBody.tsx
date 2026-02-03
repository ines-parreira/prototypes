import { useMemo } from 'react'

import { Virtuoso } from 'react-virtuoso'

import type { Ticket } from '@gorgias/helpdesk-types'

import useExpandedMessages from 'pages/tickets/detail/hooks/useExpandedMessages'

import { MessageExpansionContext } from '../context/MessageExpansionContext'
import type { TicketElement as TicketElementType } from '../types'
import { TicketElement } from './TicketElement'
import { TicketSummary } from './TicketSummary'

import css from './TicketBody.less'

type Props = {
    elements: TicketElementType[]
    ticketId: number
    summary: Ticket['summary']
}

export const AI_SUMMARY_KEY = 'AI-summary'

function Footer() {
    return <div className={css.footerSpacing} />
}

export function TicketBody({ elements, ticketId, summary }: Props) {
    const [expandedMessages, toggleMessage] = useExpandedMessages()

    const messageExpansionContext = useMemo(
        () => ({
            expandedMessages,
            toggleMessage,
        }),
        [expandedMessages, toggleMessage],
    )

    return (
        <MessageExpansionContext.Provider value={messageExpansionContext}>
            <div className={css.body}>
                <Virtuoso<TicketElementType | typeof AI_SUMMARY_KEY>
                    components={{ Footer }}
                    data={[AI_SUMMARY_KEY, ...elements]}
                    itemContent={(__index: number, element) => {
                        if (element === AI_SUMMARY_KEY) {
                            return (
                                <TicketSummary
                                    summary={summary}
                                    ticketId={ticketId}
                                />
                            )
                        }
                        return <TicketElement element={element} />
                    }}
                />
            </div>
        </MessageExpansionContext.Provider>
    )
}
