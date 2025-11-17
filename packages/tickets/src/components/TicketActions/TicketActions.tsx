import { Button, IconName, Menu, MenuItem, MenuPlacement } from '@gorgias/axiom'

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
            <MenuItem
                id={MergeTicket.id}
                label={MergeTicket.name}
                leadingSlot={MergeTicket.icon}
                intent={MergeTicket.intent}
            />
            <MenuItem
                id={MarkAsUnread.id}
                label={MarkAsUnread.name}
                leadingSlot={MarkAsUnread.icon}
                intent={MarkAsUnread.intent}
            />
            <MenuItem
                id={EventsOptions.ShowAll.id}
                label={EventsOptions.ShowAll.name}
                leadingSlot={EventsOptions.ShowAll.icon}
                intent={EventsOptions.ShowAll.intent}
            />
            <MenuItem
                id={EventsOptions.HideAll.id}
                label={EventsOptions.HideAll.name}
                leadingSlot={EventsOptions.HideAll.icon}
                intent={EventsOptions.HideAll.intent}
            />
            <MenuItem
                id={QuickRepliesOptions.ShowAll.id}
                label={QuickRepliesOptions.ShowAll.name}
                leadingSlot={QuickRepliesOptions.ShowAll.icon}
                intent={QuickRepliesOptions.ShowAll.intent}
            />
            <MenuItem
                id={QuickRepliesOptions.HideAll.id}
                label={QuickRepliesOptions.HideAll.name}
                leadingSlot={QuickRepliesOptions.HideAll.icon}
                intent={QuickRepliesOptions.HideAll.intent}
            />
            <MenuItem
                id={PrintTicket.id}
                label={PrintTicket.name}
                leadingSlot={PrintTicket.icon}
                intent={PrintTicket.intent}
            />
            <MenuItem
                id={MarkAsSpam.id}
                label={MarkAsSpam.name}
                leadingSlot={MarkAsSpam.icon}
                intent={MarkAsSpam.intent}
            />
            <MenuItem
                id={DeleteTicket.id}
                label={DeleteTicket.name}
                leadingSlot={DeleteTicket.icon}
                intent={DeleteTicket.intent}
            />
        </Menu>
    )
}
