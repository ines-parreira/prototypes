import { FC } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { TicketCompact } from '@gorgias/api-queries'
import { LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import TicketSummarySection from 'pages/tickets/detail/components/TicketSummary'

import { useTicket } from '../hooks/useTicket'
import { TicketHeader } from './TicketHeader'

import css from './TicketDetail.less'

type Props = {
    readOnly?: boolean
    summary?: TicketCompact
    ticketId: number
    AdditionalHeaderAction?: FC
}

export function TicketDetail({
    summary,
    ticketId,
    AdditionalHeaderAction,
}: Props) {
    const enableAITicketSummary = useFlags()[FeatureFlagKey.AITicketSummary]
    const { body, isLoading, ticket } = useTicket(ticketId)
    const headerData = ticket || summary

    return (
        <div className={css.container}>
            <div className={css.content}>
                {!!headerData && (
                    <TicketHeader
                        ticket={headerData}
                        AdditionalAction={AdditionalHeaderAction}
                    />
                )}
                {isLoading || !ticket ? (
                    <div className={css.loading}>
                        <LoadingSpinner size="big" />
                        <p>Loading ticket...</p>
                    </div>
                ) : (
                    <div className={css.body}>
                        {enableAITicketSummary && ticket && (
                            <TicketSummarySection
                                summary={ticket.summary}
                                ticketId={ticket.id}
                            />
                        )}
                        <pre data-testid="dump">
                            {JSON.stringify(body, null, '  ')}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
