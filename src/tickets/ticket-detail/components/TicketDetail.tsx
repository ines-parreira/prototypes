import { ReactNode } from 'react'

import cn from 'classnames'

import { TicketCompact } from '@gorgias/helpdesk-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { useTicket } from '../hooks/useTicket'
import { TicketBody } from './TicketBody'
import { TicketHeader } from './TicketHeader'

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
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const { body, isLoading, ticket } = useTicket(ticketId)
    const headerData = ticket || summary

    return (
        <div
            className={cn(css.container, 'shortcuts-enable', {
                'ticket-thread-revamp': hasTicketThreadRevamp,
            })}
        >
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
                    <TicketBody
                        elements={body}
                        ticketId={ticketId}
                        summary={ticket.summary}
                    />
                )}
            </div>
        </div>
    )
}
