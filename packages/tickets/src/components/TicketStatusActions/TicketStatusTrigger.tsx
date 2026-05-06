import { Button, IconName, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import { getTicketStatus, TicketStatus } from './utils'

type TicketStatusTriggerProps = {
    ticket: Ticket
    onCloseTicket: () => Promise<void>
    onOpenTicket: () => Promise<void>
}

export function TicketStatusTrigger({
    ticket,
    onCloseTicket,
    onOpenTicket,
}: TicketStatusTriggerProps) {
    const status = getTicketStatus(ticket)

    if (status === TicketStatus.Closed) {
        return (
            <Tooltip
                placement="bottom"
                trigger={
                    <Button
                        size="sm"
                        variant="primary"
                        leadingSlot={IconName.CircleCheck}
                        onClick={onOpenTicket}
                        aria-label="Reopen ticket"
                    >
                        Closed
                    </Button>
                }
            >
                <TooltipContent title="Reopen ticket" />
            </Tooltip>
        )
    }

    return (
        <Tooltip
            placement="bottom"
            trigger={
                <Button
                    size="sm"
                    variant="secondary"
                    {...(status === TicketStatus.Open
                        ? { leadingSlot: IconName.CircleCheck }
                        : { icon: IconName.CircleCheck })}
                    onClick={onCloseTicket}
                    aria-label="Close ticket"
                >
                    {status === TicketStatus.Open ? 'Close' : undefined}
                </Button>
            }
        >
            <TooltipContent title="Close ticket" />
        </Tooltip>
    )
}
