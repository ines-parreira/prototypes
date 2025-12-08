import { Button, IconName, Menu, MenuItem, MenuPlacement } from '@gorgias/axiom'

import {
    TrashTicketConfirmationModal,
    useTrashTicketWorkflow,
} from './actions/trash-ticket'
import { useMarkAsSpam } from './actions/useMarkAsSpam'
import { useMarkAsUnRead } from './actions/useMarkAsUnRead'
import { useTicketEventsDisplay } from './actions/useTicketEventsDisplay'
import { useTicketPrint } from './actions/useTicketPrint'
import { useTicketQuickRepliesDisplay } from './actions/useTicketQuickRepliesDisplay'
import {
    EventsOptions,
    MarkAsUnread,
    MergeTicket,
    PrintTicket,
    QuickRepliesOptions,
    SpamOptions,
    TrashTicketOptions,
} from './options'

export type TicketActionsProps = {
    id: number
    spam: boolean
    isUnread: boolean
    isTrashed: boolean
}

export function TicketActions({
    id: ticketId,
    spam: isSpam,
    isUnread,
    isTrashed,
}: TicketActionsProps) {
    const { handleTicketPrint } = useTicketPrint(ticketId)
    const { markAsSpam } = useMarkAsSpam(ticketId)
    const { markAsUnRead } = useMarkAsUnRead(ticketId)
    const { handleShowAllEventDisplay, areEventsVisible } =
        useTicketEventsDisplay()
    const { handleShowAllQuickRepliesDisplay, areQuickRepliesVisible } =
        useTicketQuickRepliesDisplay()
    const { canTrashTicket, handleTrashTicketMenuClick, isOpen, toggle } =
        useTrashTicketWorkflow({ isTrashed, ticketId })

    return (
        <>
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
                {!isUnread && (
                    <MenuItem
                        {...MarkAsUnread}
                        onAction={() =>
                            markAsUnRead(ticketId, { is_unread: true })
                        }
                    />
                )}
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

                {canTrashTicket && (
                    <MenuItem
                        id={TrashTicketOptions.id}
                        {...(isTrashed
                            ? TrashTicketOptions.Undelete
                            : TrashTicketOptions.Delete)}
                        onAction={handleTrashTicketMenuClick}
                    />
                )}
            </Menu>
            <TrashTicketConfirmationModal
                isOpen={isOpen}
                onOpenChange={toggle}
                ticketId={ticketId}
            />
        </>
    )
}
