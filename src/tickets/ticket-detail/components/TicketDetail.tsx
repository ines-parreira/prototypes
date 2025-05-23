import { ReactNode } from 'react'

import { TicketCompact } from '@gorgias/helpdesk-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useTicket } from '../hooks/useTicket'
import { TicketBody } from './TicketBody'
import { TicketHeader } from './TicketHeader'
import { TicketSummary } from './TicketSummary'

import css from './TicketDetail.less'

type Props = {
    readOnly?: boolean
    summary?: TicketCompact
    ticketId: number
    additionalHeaderActions?: ReactNode
}

export function TicketDetail({
    summary,
    ticketId,
    additionalHeaderActions,
}: Props) {
    const { body, isLoading, ticket } = useTicket(ticketId)
    const headerData = ticket || summary

    return (
        <div className={css.container}>
            <div className={css.content}>
                {!!headerData && (
                    <TicketHeader
                        ticket={headerData}
                        additionalActions={additionalHeaderActions}
                    />
                )}
                {isLoading || !ticket ? (
                    <div className={css.loading}>
                        <LoadingSpinner size="big" />
                        <p>Loading ticket...</p>
                    </div>
                ) : (
                    <div className={css.body}>
                        <TicketSummary ticket={ticket} />
                        <TicketBody elements={body} />
                    </div>
                )}
            </div>
        </div>
    )
}
