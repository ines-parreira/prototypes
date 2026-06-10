import { useCallback, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Box, Button, Skeleton } from '@gorgias/axiom'

import { TicketsList } from './TicketsList'
import type { EnrichedTicket } from './types'
import { WidgetHeader } from './WidgetHeader'

import css from './TicketTimelineWidget.less'

export type TicketTimelineWidgetProps = {
    tickets: EnrichedTicket[]
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    isLoading: boolean
    customerName?: string
    onToggleTimeline: () => void
    onSelectTicket?: (ticket: EnrichedTicket) => void
    fetchLimit?: number
}

export function TicketTimelineWidget({
    tickets,
    totalNumber,
    openTicketsNumber,
    snoozedTicketsNumber,
    isLoading,
    customerName,
    onToggleTimeline,
    onSelectTicket,
    fetchLimit,
}: TicketTimelineWidgetProps) {
    const hasNewOrdersSidebar = useFlag(FeatureFlagKey.NewOrdersSidebar)
    const showToggle = hasNewOrdersSidebar
    const shouldDisplayTicketsList = totalNumber > 1 && !isLoading
    const [isExpanded, setIsExpanded] = useState(true)
    const toggle = useCallback(() => setIsExpanded((v) => !v), [])

    const bodyContent = (!showToggle || isExpanded) && (
        <>
            {isLoading && <Skeleton count={3} />}
            {shouldDisplayTicketsList && (
                <Box flexDirection="column">
                    <TicketsList
                        enrichedTickets={tickets}
                        onSelectTicket={onSelectTicket}
                    />
                    <Box>
                        <Button
                            onClick={onToggleTimeline}
                            variant={
                                hasNewOrdersSidebar ? 'secondary' : 'tertiary'
                            }
                            size="sm"
                            trailingSlot="arrow-chevron-right"
                        >
                            Show all
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    )

    if (hasNewOrdersSidebar) {
        return (
            <Box flexDirection="column">
                <WidgetHeader
                    totalNumber={totalNumber}
                    openTicketsNumber={openTicketsNumber}
                    snoozedTicketsNumber={snoozedTicketsNumber}
                    customerName={customerName}
                    isLoading={isLoading}
                    fetchLimit={fetchLimit}
                    isExpanded={isExpanded}
                    onToggle={toggle}
                    className={css.expandableHeader}
                />
                {bodyContent && (
                    <div className={css.bodyContent}>{bodyContent}</div>
                )}
            </Box>
        )
    }

    return (
        <Box p="md" flexDirection="column">
            <WidgetHeader
                totalNumber={totalNumber}
                openTicketsNumber={openTicketsNumber}
                snoozedTicketsNumber={snoozedTicketsNumber}
                customerName={customerName}
                isLoading={isLoading}
                fetchLimit={fetchLimit}
            />
            {bodyContent}
        </Box>
    )
}
