import { useShortcuts } from '@repo/utils'

import {
    Button,
    IconName,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
} from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import {
    MergeTicketsModal,
    useMergeTicketsWorflow,
} from './actions/merge-tickets'
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

export type TicketActionsProps = Ticket

export function TicketActions(ticket: TicketActionsProps) {
    const isTrashed = Boolean(ticket.trashed_datetime)

    const { handleTicketPrint } = useTicketPrint(ticket.id)
    const { markAsSpam } = useMarkAsSpam(ticket.id)
    const { markAsUnRead } = useMarkAsUnRead(ticket.id)

    const { handleShowAllEventDisplay, areEventsVisible } =
        useTicketEventsDisplay()
    const { handleShowAllQuickRepliesDisplay, areQuickRepliesVisible } =
        useTicketQuickRepliesDisplay()

    const {
        isMergeTicketsModalOpen,
        handleMergeTicketsModalToggle,
        handleMergeTicketsModalClick,
    } = useMergeTicketsWorflow(ticket.id)

    const {
        canTrashTicket,
        handleTrashTicketMenuClick,
        isTrashTicketModalOpen,
        handleTrashTicketModalToggle,
    } = useTrashTicketWorkflow({
        isTrashed,
        ticketId: ticket.id,
    })

    const actions = {
        MARK_TICKET_SPAM: {
            action: () => {
                markAsSpam(ticket.id, { spam: !ticket.spam })
            },
        },
        DELETE_TICKET: {
            action: () => canTrashTicket && handleTrashTicketModalToggle(true),
        },
    }

    useShortcuts('TicketActions', actions)

    return (
        <>
            <Menu
                placement={MenuPlacement.BottomRight}
                size={MenuSize.Sm}
                aria-label="More ticket options selection"
                trigger={
                    <Button
                        size="sm"
                        variant="tertiary"
                        icon={IconName.DotsMeatballsHorizontal}
                    />
                }
            >
                <MenuItem
                    {...MergeTicket}
                    onAction={handleMergeTicketsModalClick}
                />
                {!ticket.is_unread && (
                    <MenuItem
                        {...MarkAsUnread}
                        onAction={() =>
                            markAsUnRead(ticket.id, { is_unread: true })
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
                    {...(ticket.spam
                        ? SpamOptions.UnmarkAsSpam
                        : SpamOptions.MarkAsSpam)}
                    onAction={() =>
                        markAsSpam(ticket.id, { spam: !ticket.spam })
                    }
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
                ticketId={ticket.id}
                isOpen={isTrashTicketModalOpen}
                onOpenChange={handleTrashTicketModalToggle}
            />
            <MergeTicketsModal
                key={
                    isMergeTicketsModalOpen
                        ? 'merge-tickets-modal-open'
                        : 'merge-tickets-modal-closed'
                }
                isOpen={isMergeTicketsModalOpen}
                onOpenChange={handleMergeTicketsModalToggle}
                ticket={ticket}
            />
        </>
    )
}
