import { forwardRef } from 'react'

import {
    Color,
    Icon,
    IconName,
    StatusButton,
    StatusButtonColor,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
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
                <Tooltip placement="bottom right">
                    <StatusButton
                        ref={ref}
                        aria-label="Ticket status menu"
                        leadingSlot={<Icon name={IconName.CircleCheck} />}
                        trailingSlot={<Icon name={IconName.ArrowChevronDown} />}
                        color={StatusButtonColor.Grey}
                    >
                        Closed
                    </StatusButton>
                    <TooltipContent
                        title={getClosedDateTitle(ticket.closed_datetime)}
                        caption="Click to change status"
                    />
                </Tooltip>
            )
        case TicketStatus.Snoozed:
            return (
                <Tooltip placement="bottom right">
                    <StatusButton
                        ref={ref}
                        aria-label="Ticket status menu"
                        leadingSlot={
                            <Icon
                                name={IconName.TimerSnooze}
                                color={Color.Blue}
                            />
                        }
                        trailingSlot={<Icon name={IconName.ArrowChevronDown} />}
                        color={StatusButtonColor.Blue}
                    >
                        {getRemainingSnoozeTime(ticket.snooze_datetime)}
                    </StatusButton>
                    <TooltipContent
                        title={getSnoozeTooltipTitle(ticket.snooze_datetime)}
                        caption="Click to change status"
                    />
                </Tooltip>
            )
        default:
            return (
                <Tooltip placement="bottom right">
                    <StatusButton
                        ref={ref}
                        aria-label="Ticket status menu"
                        leadingSlot={
                            <Icon name={IconName.Inbox} color={Color.Purple} />
                        }
                        trailingSlot={<Icon name={IconName.ArrowChevronDown} />}
                        color={StatusButtonColor.Purple}
                    >
                        Open
                    </StatusButton>
                    <TooltipContent title="Change status" />
                </Tooltip>
            )
    }
})
