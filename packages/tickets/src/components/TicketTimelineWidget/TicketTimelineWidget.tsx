import { Box, Button, Skeleton } from '@gorgias/axiom'

import { TicketsList } from './TicketsList'
import type { EnrichedTicket } from './types'
import { WidgetHeader } from './WidgetHeader'

export type TicketTimelineWidgetProps = {
    tickets: EnrichedTicket[]
    totalNumber: number
    openTicketsNumber: number
    snoozedTicketsNumber: number
    isLoading: boolean
    customerName?: string
    isTimelineOpen: boolean
    onToggleTimeline: () => void
}

export function TicketTimelineWidget({
    tickets,
    totalNumber,
    openTicketsNumber,
    snoozedTicketsNumber,
    isLoading,
    customerName,
    isTimelineOpen,
    onToggleTimeline,
}: TicketTimelineWidgetProps) {
    const shouldDisplayTicketsList = totalNumber > 1 && !isLoading

    return (
        <Box p="md" flexDirection="column">
            <WidgetHeader
                totalNumber={totalNumber}
                openTicketsNumber={openTicketsNumber}
                snoozedTicketsNumber={snoozedTicketsNumber}
                customerName={customerName}
                isLoading={isLoading}
            />

            {isLoading && <Skeleton count={3} />}

            {shouldDisplayTicketsList && (
                <Box flexDirection="column">
                    <TicketsList enrichedTickets={tickets} />
                    <Box>
                        <Button
                            onClick={onToggleTimeline}
                            variant="tertiary"
                            size="sm"
                            trailingSlot="arrow-chevron-right"
                        >
                            {isTimelineOpen ? 'Close' : 'Show All'}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
