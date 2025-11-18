import { Button, IconName, Menu, MenuItem, MenuPlacement } from '@gorgias/axiom'

import { useTicketEventsDisplay } from './actions/useTicketEventsDisplay'
import { useTicketPrint } from './actions/useTicketPrint'
import { useTicketQuickRepliesDisplay } from './actions/useTicketQuickRepliesDisplay'
import {
    DeleteTicket,
    EventsOptions,
    MarkAsSpam,
    MarkAsUnread,
    MergeTicket,
    PrintTicket,
    QuickRepliesOptions,
} from './options'

export function TicketActions() {
    const { handleTicketPrint } = useTicketPrint()
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
            <MenuItem {...MarkAsSpam} />
            <MenuItem {...DeleteTicket} />
        </Menu>
    )
}
