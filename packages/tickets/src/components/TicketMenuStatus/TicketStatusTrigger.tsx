import { forwardRef } from 'react'

import { StatusButton, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import {
    getClosedDateTitle,
    getRemainingSnoozeTime,
    getSnoozeTooltipTitle,
    getTicketStatus,
    TicketStatus,
} from './utils'

type TicketStatusTriggerProps = {
    ticket: Ticket
}

export const TicketStatusTrigger = forwardRef<
    HTMLButtonElement,
    TicketStatusTriggerProps
>(({ ticket }, ref) => {
    const status = getTicketStatus(ticket)

    switch (status) {
        case TicketStatus.Closed:
            return (
                <Tooltip
                    placement="bottom"
                    trigger={
                        <StatusButton
                            ref={ref}
                            aria-label="Ticket status menu"
                            leadingSlot="circle-check"
                            trailingSlot="arrow-chevron-down"
                            color="grey"
                        >
                            Closed
                        </StatusButton>
                    }
                >
                    <TooltipContent
                        title={getClosedDateTitle(ticket.closed_datetime)}
                        caption="Click to change status"
                    />
                </Tooltip>
            )
        case TicketStatus.Snoozed:
            return (
                <Tooltip
                    placement="bottom"
                    trigger={
                        <StatusButton
                            ref={ref}
                            aria-label="Ticket status menu"
                            leadingSlot="timer-snooze"
                            trailingSlot="arrow-chevron-down"
                            color="blue"
                        >
                            {getRemainingSnoozeTime(ticket.snooze_datetime)}
                        </StatusButton>
                    }
                >
                    <TooltipContent
                        title={getSnoozeTooltipTitle(ticket.snooze_datetime)}
                        caption="Click to change status"
                    />
                </Tooltip>
            )
        default:
            return (
                <Tooltip
                    placement="bottom"
                    trigger={
                        <StatusButton
                            ref={ref}
                            aria-label="Ticket status menu"
                            leadingSlot="inbox"
                            trailingSlot="arrow-chevron-down"
                            color="purple"
                        >
                            Open
                        </StatusButton>
                    }
                >
                    <TooltipContent title="Change status" />
                </Tooltip>
            )
    }
})
