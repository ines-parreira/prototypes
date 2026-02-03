import type { ReactNode } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { TicketCustomField } from '@repo/tickets'
import cn from 'classnames'

import type { IconName } from '@gorgias/axiom'
import { Box, Skeleton } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-queries'

import { useTicket } from 'tickets/ticket-detail/hooks/useTicket'

import { SidePanelTicketHeader } from './SidePanelTicketHeader'
import { TicketThread } from './TicketThread'

import css from './SidePanelTicketDetail.less'

type SidePanelTicketDetailProps = {
    ticket: TicketCompact
    customFields: TicketCustomField[]
    conditionsLoading: boolean
    iconName: IconName
    additionalHeaderActions?: ReactNode
    onExpand?: () => void
}

export function SidePanelTicketDetail({
    ticket,
    customFields,
    conditionsLoading,
    iconName,
    additionalHeaderActions,
    onExpand,
}: SidePanelTicketDetailProps) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const { body, isLoading, ticket: fullTicket } = useTicket(ticket.id)
    const ticketData = fullTicket || ticket

    return (
        <Box
            flexDirection="column"
            className={cn(css.container, {
                'ticket-thread-revamp': hasTicketThreadRevamp,
            })}
        >
            <Box
                flexDirection="column"
                flex={1}
                className={css.content}
                gap={'sm'}
            >
                <SidePanelTicketHeader
                    ticket={ticketData}
                    customFields={customFields}
                    conditionsLoading={conditionsLoading}
                    iconName={iconName}
                    additionalActions={additionalHeaderActions}
                    onExpand={onExpand}
                />
                {isLoading || !fullTicket ? (
                    <Box
                        flexDirection="column"
                        gap="md"
                        flex={1}
                        padding="md"
                        className={css.loading}
                    >
                        <Skeleton height="60px" />
                        <Skeleton height="100px" />
                        <Skeleton height="80px" />
                    </Box>
                ) : (
                    <TicketThread
                        elements={body}
                        ticketId={ticket.id}
                        summary={fullTicket.summary}
                    />
                )}
            </Box>
        </Box>
    )
}
