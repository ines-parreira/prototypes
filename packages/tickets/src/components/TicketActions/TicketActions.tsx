import { Button, IconName, Menu, MenuItem, MenuPlacement } from '@gorgias/axiom'

import { useMarkAsSpam } from './actions/useMarkAsSpam'
import { useTicketEventsDisplay } from './actions/useTicketEventsDisplay'
import { useTicketPrint } from './actions/useTicketPrint'
import { useTicketQuickRepliesDisplay } from './actions/useTicketQuickRepliesDisplay'
import {
    DeleteTicket,
    EventsOptions,
    MarkAsUnread,
    MergeTicket,
    PrintTicket,
    QuickRepliesOptions,
    SpamOptions,
} from './options'

export type TicketActionsProps = {
    id: number
    spam: boolean
}

export function TicketActions({
    id: ticketId,
    spam: isSpam,
}: TicketActionsProps) {
    const { handleTicketPrint } = useTicketPrint(ticketId)
    const { markAsSpam } = useMarkAsSpam(ticketId)
    const { handleShowAllEventDisplay, areEventsVisible } =
        useTicketEventsDisplay()
    const { handleShowAllQuickRepliesDisplay, areQuickRepliesVisible } =
        useTicketQuickRepliesDisplay()

    return (
        <Menu
            placement={MenuPlacement.BottomRight}
            aria-label="More ticket options selection"
            trigger={
                <Button
                    slot="button"
                    size="sm"
                    variant="tertiary"
                    icon={IconName.DotsKebabVertical}
                />
            }
        >
            <MenuItem {...MergeTicket} />
            <MenuItem {...MarkAsUnread} />
            <MenuItem
                id={EventsOptions.id}
                {...(areEventsVisible
                    ? EventsOptions.HideAll
                    : EventsOptions.ShowAll)}
                onAction={handleShowAllEventDisplay}
            />

            <MenuItem
                id={QuickRepliesOptions.id}
                {...(areQuickRepliesVisible
                    ? QuickRepliesOptions.HideAll
                    : QuickRepliesOptions.ShowAll)}
                onAction={handleShowAllQuickRepliesDisplay}
            />

            <MenuItem {...PrintTicket} onAction={handleTicketPrint} />
            <MenuItem
                id={SpamOptions.id}
                {...(isSpam
                    ? SpamOptions.UnmarkAsSpam
                    : SpamOptions.MarkAsSpam)}
                onAction={() => markAsSpam(ticketId, { spam: !isSpam })}
            />
            <MenuItem {...DeleteTicket} />
        </Menu>
    )
}
