import { TicketSummary } from '@gorgias/api-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { useTicket } from '../hooks/useTicket'
import { TicketHeader } from './TicketHeader'

import css from './TicketDetail.less'

type Props = {
    readOnly?: boolean
    summary?: TicketSummary
    ticketId: number
    onClose?: () => void
}

export function TicketDetail({ summary, ticketId, onClose }: Props) {
    const { isLoading, ticket } = useTicket(ticketId)
    const headerData = ticket || summary

    return (
        <div className={css.container}>
            <div className={css.content}>
                {!!headerData && (
                    <TicketHeader ticket={headerData} onClose={onClose} />
                )}
                {isLoading || !ticket ? (
                    <div className={css.loading}>
                        <LoadingSpinner size="big" />
                        <p>Loading ticket...</p>
                    </div>
                ) : (
                    <div className={css.body}>
                        <pre data-testid="dump">
                            {JSON.stringify(ticket.messages, null, '  ')}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
