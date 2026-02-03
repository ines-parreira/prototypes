import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { Virtuoso } from 'react-virtuoso'

import { Box } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import TicketSummarySection from 'pages/tickets/detail/components/TicketSummary'
import useExpandedMessages from 'pages/tickets/detail/hooks/useExpandedMessages'
import { TicketElement } from 'tickets/ticket-detail/components/TicketElement'
import { MessageExpansionContext } from 'tickets/ticket-detail/context/MessageExpansionContext'
import type { TicketElement as TicketElementType } from 'tickets/ticket-detail/types'

import css from './TicketThread.less'

type TicketThreadProps = {
    elements: TicketElementType[]
    ticketId: number
    summary: Ticket['summary']
}

const AI_SUMMARY_KEY = 'AI-summary'

function Footer() {
    return <div className={css.footerSpacing} />
}

export function TicketThread({
    elements,
    ticketId,
    summary,
}: TicketThreadProps) {
    const enableAITicketSummary = useFlag(FeatureFlagKey.AITicketSummary)
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
            <Box className={css.container} display="block" flexGrow="1">
                <Virtuoso<TicketElementType | typeof AI_SUMMARY_KEY>
                    components={{ Footer }}
                    data={[AI_SUMMARY_KEY, ...elements]}
                    itemContent={(__index: number, element) => {
                        if (element === AI_SUMMARY_KEY) {
                            if (enableAITicketSummary) {
                                return (
                                    <Box
                                        paddingLeft="lg"
                                        paddingRight="lg"
                                        marginBottom="md"
                                        display="block"
                                    >
                                        <TicketSummarySection
                                            summary={summary}
                                            ticketId={ticketId}
                                        />
                                    </Box>
                                )
                            }
                            return null
                        }

                        return (
                            <div>
                                <TicketElement element={element} />
                            </div>
                        )
                    }}
                />
            </Box>
        </MessageExpansionContext.Provider>
    )
}
